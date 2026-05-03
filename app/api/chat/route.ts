import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabaseServerAuth";
import { checkRateLimit } from "@/lib/rateLimit";

interface Profile {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  activity_level?: string;
  goal?: string;
  diet_type?: string;
  allergies?: string[] | string | null;
  intolerances?: string[] | string | null;
  chronic_conditions?: string[] | string | null;
  meal_frequency?: number | null;
}

type DailyMealItem = {
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  description: string;
};

type NutritionPlan = {
  daily_plan: DailyMealItem[];
  weekly_plan: string[];
  monthly_tips: string[];
};

const EXPECTED_GOALS = new Set([
  "Weight Loss",
  "Maintenance",
  "Muscle Gain",
  "Sports Performance",
]);

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  return token || null;
}

function validateProfile(profile: Profile) {
  if (
    typeof profile.age !== "number" ||
    !Number.isFinite(profile.age) ||
    profile.age < 13 ||
    profile.age > 100
  ) {
    return "Profile age is missing or outside the supported range.";
  }

  if (
    typeof profile.weight !== "number" ||
    !Number.isFinite(profile.weight) ||
    profile.weight < 20 ||
    profile.weight > 300
  ) {
    return "Profile weight is missing or outside the supported range.";
  }

  if (
    typeof profile.height !== "number" ||
    !Number.isFinite(profile.height) ||
    profile.height < 50 ||
    profile.height > 250
  ) {
    return "Profile height is missing or outside the supported range.";
  }

  if (
    typeof profile.meal_frequency !== "number" ||
    !Number.isFinite(profile.meal_frequency) ||
    profile.meal_frequency < 1 ||
    profile.meal_frequency > 6
  ) {
    return "Profile meal frequency must be between 1 and 6.";
  }

  if (!profile.goal || !EXPECTED_GOALS.has(profile.goal)) {
    return "Profile goal is missing or invalid.";
  }

  return null;
}

async function getUserProfile(req: Request, userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const accessToken = getBearerToken(req);

  if (!supabaseUrl || !supabaseAnonKey || !accessToken) {
    return {
      profile: null,
      error: "Profile service is not configured.",
      status: 500,
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return {
      profile: null,
      error: "User profile not found. Please complete setup.",
      status: 400,
    };
  }

  return { profile: data as Profile, error: null, status: 200 };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);

    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // In-memory limiting is acceptable for local/prototype use; production should use Redis/Upstash or another shared persistent limiter.
    const allowed = checkRateLimit({
      endpoint: "chat",
      limit: 3,
      windowMs: 60 * 1000,
      userId: auth.user.id,
    });

    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }

    const { profile, error: profileError, status } = await getUserProfile(
      req,
      auth.user.id
    );

    if (!profile) {
      return NextResponse.json({ error: profileError }, { status });
    }

    const validationError = validateProfile(profile);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI request failed. Please try again." },
        { status: 500 }
      );
    }

    const mealCount = profile.meal_frequency || 3;

    const developerPrompt = `
You are a professional nutritionist AI.

IMPORTANT RULES:
- ALWAYS respond in ENGLISH.
- Do NOT use any other language.
- Use simple, natural, practical English.
- Return ONLY valid JSON.

TASK:
Create a personalized nutrition plan based on the user's profile.

REQUIREMENTS:
- Daily plan must contain EXACTLY ${mealCount} meals.
- Daily plan items must use meal labels such as Breakfast, Lunch, Dinner, Snack.
- Weekly plan must contain EXACTLY 7 short day summaries.
- Monthly tips must contain EXACTLY 6 practical nutrition tips.
- Respect the user's goal, activity level, diet type, allergies, intolerances, and chronic conditions.
- Keep meals realistic and easy to follow.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "nutrition_plan",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                daily_plan: {
                  type: "array",
                  minItems: mealCount,
                  maxItems: mealCount,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      meal: {
                        type: "string",
                        enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
                      },
                      description: {
                        type: "string",
                      },
                    },
                    required: ["meal", "description"],
                  },
                },
                weekly_plan: {
                  type: "array",
                  minItems: 7,
                  maxItems: 7,
                  items: { type: "string" },
                },
                monthly_tips: {
                  type: "array",
                  minItems: 6,
                  maxItems: 6,
                  items: { type: "string" },
                },
              },
              required: ["daily_plan", "weekly_plan", "monthly_tips"],
            },
          },
        },
        messages: [
          {
            role: "developer",
            content: developerPrompt,
          },
          {
            role: "user",
            content: JSON.stringify(profile),
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return NextResponse.json(
        { error: "AI request failed. Please try again." },
        { status: 500 }
      );
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OpenAI response missing content.");
      return NextResponse.json(
        { error: "AI request failed. Please try again." },
        { status: 500 }
      );
    }

    let parsed: NutritionPlan;

    try {
      parsed = JSON.parse(content) as NutritionPlan;
    } catch {
      console.error("OpenAI returned invalid JSON.");
      return NextResponse.json(
        { error: "AI request failed. Please try again." },
        { status: 500 }
      );
    }

    if (
      !Array.isArray(parsed.daily_plan) ||
      !Array.isArray(parsed.weekly_plan) ||
      !Array.isArray(parsed.monthly_tips)
    ) {
      console.error("OpenAI response structure is invalid.");
      return NextResponse.json(
        { error: "AI request failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
