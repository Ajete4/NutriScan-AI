import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  try {
    const { imageUrl }: { imageUrl?: string } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY." },
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
        { error: "AI analysis failed." },
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
      return NextResponse.json(
        { error: "No AI output received." },
        { status: 500 }
      );
    }

    let parsed: MealAnalysis;

    try {
      parsed = JSON.parse(outputText) as MealAnalysis;
    } catch (parseError) {
      console.error("JSON parse error:", outputText);

      return NextResponse.json(
        { error: "AI returned invalid JSON." },
        { status: 500 }
      );
    }

    /* 🔹 Extra validation (optional but recommended) */
    if (
      !parsed.meal_name ||
      typeof parsed.calories !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid AI response structure." },
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