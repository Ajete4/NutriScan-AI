import { NextRequest } from "next/server";

type AIResponse = {
  daily_plan: string[];
  weekly_plan: string[];
  monthly_tips: string[];
};

type ErrorResponse = {
  error: string;
  raw?: string;
};

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body: { profile?: unknown } = await req.json();
    const { profile } = body;

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile missing" } satisfies ErrorResponse),
        { status: 400 }
      );
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      throw new Error("Missing service role key");
    }

    const res = await fetch(
      "https://jevpbuakupznuwtwwmud.supabase.co/functions/v1/generate-plan",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ profile }),
      }
    );

    const text = await res.text();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: text } satisfies ErrorResponse),
        { status: res.status }
      );
    }

    let data: AIResponse;

    try {
      data = JSON.parse(text) as AIResponse;
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON from AI",
          raw: text,
        } satisfies ErrorResponse),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
    });
  } catch (err: unknown) {
    let message = "Server error";

    if (err instanceof Error) {
      message = err.message;
    }

    return new Response(
      JSON.stringify({ error: message } satisfies ErrorResponse),
      { status: 500 }
    );
  }
}

