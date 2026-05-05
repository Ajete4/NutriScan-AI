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

type WeeklyMealItem = {
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type WeeklyDayPlan = {
  day: number;
  meals: WeeklyMealItem[];
};

type NutritionPlan = {
  daily_plan: DailyMealItem[];
  weekly_plan: WeeklyDayPlan[];
  monthly_tips: string[];
  explanation?: string[];
};

type NutritionTargets = {
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
};

const EXPECTED_GOALS = new Set([
  "Weight Loss",
  "Maintenance",
  "Muscle Gain",
  "Sports Performance",
]);

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  athlete: 1.9,
};

const MACRO_SPLITS: Record<string, { protein: number; carbs: number; fat: number }> = {
  "Weight Loss": { protein: 0.35, carbs: 0.35, fat: 0.3 },
  Maintenance: { protein: 0.25, carbs: 0.45, fat: 0.3 },
  "Muscle Gain": { protein: 0.3, carbs: 0.45, fat: 0.25 },
  "Sports Performance": { protein: 0.25, carbs: 0.5, fat: 0.25 },
};

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

function calculateNutritionTargets(profile: Profile): NutritionTargets {
  const genderAdjustment = profile.gender === "Female" ? -161 : 5;
  const bmr =
    10 * profile.weight! +
    6.25 * profile.height! -
    5 * profile.age! +
    genderAdjustment;
  const activityMultiplier = profile.activity_level
    ? ACTIVITY_MULTIPLIERS[profile.activity_level] ?? ACTIVITY_MULTIPLIERS.moderate
    : ACTIVITY_MULTIPLIERS.moderate;
  const tdee = bmr * activityMultiplier;
  const calorieTarget =
    profile.goal === "Weight Loss"
      ? tdee - 400
      : profile.goal === "Muscle Gain"
        ? tdee + 300
        : Math.round(tdee);
  const roundedCalories = Math.max(1200, Math.round(calorieTarget / 25) * 25);
  const macroSplit = profile.goal
    ? MACRO_SPLITS[profile.goal] ?? MACRO_SPLITS.Maintenance
    : MACRO_SPLITS.Maintenance;

  return {
    calorieTarget: roundedCalories,
    proteinGrams: Math.round((roundedCalories * macroSplit.protein) / 4),
    carbsGrams: Math.round((roundedCalories * macroSplit.carbs) / 4),
    fatGrams: Math.round((roundedCalories * macroSplit.fat) / 9),
  };
}

function getDefaultExplanation(
  profile: Profile,
  targets: NutritionTargets
): string[] {
  const goalText = profile.goal?.toLowerCase() || "maintenance";
  const activityText = profile.activity_level?.replace("_", " ") || "moderate activity";

  return [
    `Built for ${goalText} with a ${targets.calorieTarget} calorie daily target`,
    `${targets.proteinGrams}g protein supports your goal and activity level`,
    `${targets.carbsGrams}g carbohydrates help fuel ${activityText} days`,
    `${targets.fatGrams}g fat supports hormones and overall health`,
  ];
}

function getValidExplanation(
  explanation: unknown,
  profile: Profile,
  targets: NutritionTargets
) {
  if (!Array.isArray(explanation)) {
    return getDefaultExplanation(profile, targets);
  }

  const validItems = explanation
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (validItems.length < 3) {
    return getDefaultExplanation(profile, targets);
  }

  return validItems;
}

function isWeeklyMealItem(value: unknown): value is WeeklyMealItem {
  if (!value || typeof value !== "object") return false;

  const meal = value as Partial<WeeklyMealItem>;
  const expectedMeals = new Set(["breakfast", "lunch", "dinner", "snack"]);

  return (
    typeof meal.meal === "string" &&
    expectedMeals.has(meal.meal) &&
    typeof meal.name === "string" &&
    meal.name.trim().length > 0 &&
    typeof meal.calories === "number" &&
    Number.isFinite(meal.calories) &&
    typeof meal.protein === "number" &&
    Number.isFinite(meal.protein) &&
    typeof meal.carbs === "number" &&
    Number.isFinite(meal.carbs) &&
    typeof meal.fats === "number" &&
    Number.isFinite(meal.fats)
  );
}

function isWeeklyDayPlan(value: unknown, mealCount: number): value is WeeklyDayPlan {
  if (!value || typeof value !== "object") return false;

  const dayPlan = value as Partial<WeeklyDayPlan>;

  return (
    typeof dayPlan.day === "number" &&
    Number.isInteger(dayPlan.day) &&
    dayPlan.day >= 1 &&
    dayPlan.day <= 7 &&
    Array.isArray(dayPlan.meals) &&
    dayPlan.meals.length === mealCount &&
    dayPlan.meals.every(isWeeklyMealItem)
  );
}

function hasValidWeeklyPlan(value: unknown, mealCount: number): value is WeeklyDayPlan[] {
  return (
    Array.isArray(value) &&
    value.length === 7 &&
    value.every((dayPlan) => isWeeklyDayPlan(dayPlan, mealCount))
  );
}

function getValidMonthlyTips(monthlyTips: unknown): string[] | null {
  if (!Array.isArray(monthlyTips)) return null;

  const validTips = monthlyTips
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);

  return validTips.length >= 4 ? validTips : null;
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
    const nutritionTargets = calculateNutritionTargets(profile);
    const defaultExplanation = getDefaultExplanation(profile, nutritionTargets);

    const developerPrompt = `
You are a professional nutritionist AI.

IMPORTANT RULES:
- ALWAYS respond in ENGLISH.
- Do NOT use any other language.
- Use simple, natural, practical English.
- Return ONLY valid JSON.

TASK:
Create a personalized nutrition plan based on the user's profile.

NUTRITION TARGETS:
- Daily calorie target: ${nutritionTargets.calorieTarget} calories.
- Macronutrient distribution: ${nutritionTargets.proteinGrams}g protein, ${nutritionTargets.carbsGrams}g carbohydrates, ${nutritionTargets.fatGrams}g fats.

REQUIREMENTS:
- Daily plan must contain EXACTLY ${mealCount} meals.
- Daily plan items must use meal labels such as Breakfast, Lunch, Dinner, Snack.
- Daily plan descriptions must align with the calorie target and macronutrient distribution.
- Weekly plan must contain EXACTLY 7 days.
- Each weekly day must contain EXACTLY ${mealCount} real meals, not tips or summaries.
- Weekly meal names must vary slightly across days.
- Weekly meal calories and macros should add up close to the daily calorie target and macronutrient distribution.
- Monthly tips must contain 4 to 6 practical nutrition tips.
- Monthly tips must be personalized to the user's goal, activity level, calorie target, and macros.
- Monthly tips must be short actionable sentences, not generic advice.
- Explanation must contain 3 to 5 short bullet points.
- Explanation must mention the user's goal, activity level, calorie target, and macronutrient distribution.
- Explanation must be specific to the user's data and avoid vague generic statements.
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
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      day: {
                        type: "number",
                        minimum: 1,
                        maximum: 7,
                      },
                      meals: {
                        type: "array",
                        minItems: mealCount,
                        maxItems: mealCount,
                        items: {
                          type: "object",
                          additionalProperties: false,
                          properties: {
                            meal: {
                              type: "string",
                              enum: ["breakfast", "lunch", "dinner", "snack"],
                            },
                            name: {
                              type: "string",
                            },
                            calories: {
                              type: "number",
                            },
                            protein: {
                              type: "number",
                            },
                            carbs: {
                              type: "number",
                            },
                            fats: {
                              type: "number",
                            },
                          },
                          required: [
                            "meal",
                            "name",
                            "calories",
                            "protein",
                            "carbs",
                            "fats",
                          ],
                        },
                      },
                    },
                    required: ["day", "meals"],
                  },
                },
                monthly_tips: {
                  type: "array",
                  minItems: 4,
                  maxItems: 6,
                  items: { type: "string" },
                },
                explanation: {
                  type: "array",
                  minItems: 3,
                  maxItems: 5,
                  items: { type: "string" },
                },
              },
              required: ["daily_plan", "weekly_plan", "monthly_tips", "explanation"],
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
        {
          daily_plan: [],
          weekly_plan: [],
          monthly_tips: [],
          explanation: defaultExplanation,
          error: "AI request failed. Please try again.",
        },
        { status: 500 }
      );
    }

    if (
      !Array.isArray(parsed.daily_plan) ||
      !Array.isArray(parsed.monthly_tips)
    ) {
      console.error("OpenAI response structure is invalid.");
      return NextResponse.json(
        { error: "AI request failed. Please try again." },
        { status: 500 }
      );
    }

    const monthlyTips = getValidMonthlyTips(parsed.monthly_tips);

    if (!hasValidWeeklyPlan(parsed.weekly_plan, mealCount) || !monthlyTips) {
      console.error("OpenAI response nutrition plan details are invalid.");
      return NextResponse.json(
        { error: "AI request failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...parsed,
      monthly_tips: monthlyTips,
      explanation: getValidExplanation(
        parsed.explanation,
        profile,
        nutritionTargets
      ),
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
