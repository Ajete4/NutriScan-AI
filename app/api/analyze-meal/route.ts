import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabaseServerAuth";
import { checkRateLimit } from "@/lib/rateLimit";

type MealAnalysis = {
  meal_name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

/* 🔹 Types për OpenAI response */
type OpenAIOutputText = {
  type: "output_text";
  text: string;
};

type OpenAIOutputItem = {
  content?: OpenAIOutputText[];
};

type OpenAIResponse = {
  output?: OpenAIOutputItem[];
  output_text?: string;
};

const MEAL_TYPES = new Set(["breakfast", "lunch", "dinner", "snack"]);

function getMealImageStoragePath(imageUrl: string) {
  if (!imageUrl.trim()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  try {
    const parsedImageUrl = new URL(imageUrl);
    const parsedSupabaseUrl = new URL(supabaseUrl);
    const basePath = parsedSupabaseUrl.pathname.replace(/\/$/, "");
    const mealImagesPath = `${basePath}/storage/v1/object/public/meal-images/`;

    if (
      parsedImageUrl.origin !== parsedSupabaseUrl.origin ||
      !parsedImageUrl.pathname.startsWith(mealImagesPath)
    ) {
      return null;
    }

    const storagePath = parsedImageUrl.pathname.slice(mealImagesPath.length);
    return storagePath || null;
  } catch {
    return null;
  }
}

function isValidNumber(value: unknown, allowZero = true) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    (allowZero ? value >= 0 : value > 0)
  );
}

function isValidMealAnalysis(value: MealAnalysis) {
  return (
    typeof value.meal_name === "string" &&
    value.meal_name.trim().length > 0 &&
    MEAL_TYPES.has(value.meal_type) &&
    isValidNumber(value.calories, false) &&
    isValidNumber(value.protein) &&
    isValidNumber(value.carbs) &&
    isValidNumber(value.fats)
  );
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedUser(req);

    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // In-memory limiting is acceptable for local/prototype use; production should use Redis/Upstash or another shared persistent limiter.
    const allowed = checkRateLimit({
      endpoint: "analyze-meal",
      limit: 5,
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

    let body: { imageUrl?: string };

    try {
      body = (await req.json()) as { imageUrl?: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required." },
        { status: 400 }
      );
    }

    const storagePath = getMealImageStoragePath(imageUrl);

    if (!storagePath) {
      return NextResponse.json(
        { error: "Invalid meal image URL." },
        { status: 400 }
      );
    }

    // This prevents users from analyzing meal images uploaded by other users.
    if (!storagePath.startsWith(`${auth.user.id}/`)) {
      return NextResponse.json(
        { error: "Invalid image ownership." },
        { status: 403 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Unable to analyze meal. Please try another image." },
        { status: 500 }
      );
    }

    const prompt = `
Analyze this meal image and estimate the nutritional values.

Return ONLY valid JSON in this exact format:
{
  "meal_name": "string",
  "meal_type": "breakfast | lunch | dinner | snack",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number
}

Rules:
- Estimate based on a typical serving size if exact quantity is unclear.
- Keep numbers realistic.
- Do not return markdown.
- Do not add explanations outside JSON.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              {
                type: "input_image",
                image_url: imageUrl,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);

      return NextResponse.json(
        { error: "Unable to analyze meal. Please try another image." },
        { status: 500 }
      );
    }

    /* 🔹 Parse response safely */
    const data = (await response.json()) as OpenAIResponse;

    const outputText =
      data.output?.[0]?.content?.find(
        (item) => item.type === "output_text"
      )?.text || data.output_text;

    if (!outputText) {
      console.error("OpenAI meal analysis response missing output text.");
      return NextResponse.json(
        { error: "Unable to analyze meal. Please try another image." },
        { status: 500 }
      );
    }

    let parsed: MealAnalysis;

    try {
      parsed = JSON.parse(outputText) as MealAnalysis;
    } catch {
      console.error("OpenAI meal analysis returned invalid JSON.");

      return NextResponse.json(
        { error: "Unable to analyze meal. Please try another image." },
        { status: 500 }
      );
    }

    /* 🔹 Extra validation (optional but recommended) */
    if (!isValidMealAnalysis(parsed)) {
      console.error("OpenAI meal analysis response structure is invalid.");
      return NextResponse.json(
        { error: "Unable to analyze meal. Please try another image." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Analyze meal route error:", error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
