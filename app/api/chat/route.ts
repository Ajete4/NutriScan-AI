export async function POST(req: Request): Promise<Response> {
  try {
    const { message }: { message: string } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Mesazhi mungon" }), { status: 400 });
    }

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
            content: `Ti je një nutricionist profesional shqiptar.
            Analizo vaktin dhe përgjigju VETËM në formatin JSON.
            Rregullat:
            - 'kalori', 'proteina', 'karbohidrate', 'yndyrna' duhet të jenë vetëm numra (psh "25g" bëje "25").
            - 'keshilla' duhet të jetë një fjali inkurajuese.
            
            Struktura:
            {
              "ushqimi": "emri i ushqimit",
              "kalori": "vlerë numerike",
              "proteina": "vlerë numerike",
              "karbohidrate": "vlerë numerike",
              "yndyrna": "vlerë numerike",
              "keshilla": "tekst"
            }`,
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    // Kontrolli nëse OpenAI ktheu gabim (psh. API key i pasaktë)
    if (data.error) {
      throw new Error(data.error.message);
    }

    const aiContent = data.choices[0].message.content;

    return new Response(aiContent, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("API Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Gabim i panjohur";
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}