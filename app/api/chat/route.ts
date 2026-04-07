import { NextRequest, NextResponse } from "next/server";

interface Profile {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  activity_level?: string;
  goal?: string;
  diet_type?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile?: Profile } = await req.json();

    if (!profile) {
      return NextResponse.json({ error: "Profile missing" }, { status: 400 });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Ti je një nutricionist profesional. Krijo një plan ushqimor bazuar në profilin e përdoruesit. Kthe vetëm JSON:
{
  "daily_plan": ["meal1", "meal2", "meal3"],
  "weekly_plan": ["day1 plan", "day2 plan"],
  "monthly_tips": ["tip1", "tip2"]
}`,
          },
          { role: "user", content: JSON.stringify(profile) },
        ],
      }),
    });

    const data = await res.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    let parsed;
    try {
      parsed = JSON.parse(aiContent);
    } catch {
      return NextResponse.json({ error: "Invalid AI JSON", raw: aiContent }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}