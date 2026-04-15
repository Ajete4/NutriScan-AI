import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile?: Profile } = await req.json();

    if (!profile) {
      return NextResponse.json({ error: "Profile missing" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
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
        { error: "AI request failed", details: data },
        { status: 500 }
      );
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    let parsed: NutritionPlan;

    try {
      parsed = JSON.parse(content) as NutritionPlan;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid AI JSON", raw: content },
        { status: 500 }
      );
    }

    if (
      !Array.isArray(parsed.daily_plan) ||
      !Array.isArray(parsed.weekly_plan) ||
      !Array.isArray(parsed.monthly_tips)
    ) {
      return NextResponse.json(
        { error: "AI response structure is invalid", raw: parsed },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}