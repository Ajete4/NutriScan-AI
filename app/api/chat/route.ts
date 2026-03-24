export async function POST(req: Request): Promise<Response> {
  try {
    const { message }: { message: string } = await req.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Ti je një nutricionist profesional.
            Përgjigju VETËM në formatin JSON.
            Struktura e JSON duhet të jetë saktësisht kjo:
            {
              "ushqimi": "emri i ushqimit",
              "kalori": "numri kcal",
              "proteina": "gramet",
              "karbohidrate": "gramet",
              "yndyrna": "gramet",
              "keshilla": "një këshillë e shkurtër"
            }`,
          },
          { role: "user", content: message },
        ],
      }),
    });

    type OpenAIResponse = {
      choices: { message: { content: string } }[];
    };

    const data: OpenAIResponse = await response.json();
    const aiContent = data.choices[0].message.content;

    return new Response(aiContent, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Gabim i panjohur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
