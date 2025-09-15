import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

interface Body {
  character: { base64: string; mimeType: string };
  clothing: { base64: string; mimeType: string };
  prompt: string;
}

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response('Missing GEMINI_API_KEY', { status: 500 });
    }

    const { character, clothing, prompt } = (await req.json()) as Body;
    if (!character?.base64 || !clothing?.base64 || !prompt?.trim()) {
      return new Response('Invalid input', { status: 400 });
    }

    const client = new GoogleGenerativeAI(apiKey);

    // Note: Replace model name with an image generation capable Gemini model when available in your region.
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // We will attempt to request an image result. If the model returns text, we surface NO_IMAGE_RETURNED upstream.
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `You are an expert image compositor. Combine the provided character and clothing images. ${prompt}` },
            { inlineData: { data: character.base64, mimeType: character.mimeType } },
            { inlineData: { data: clothing.base64, mimeType: clothing.mimeType } },
          ],
        },
      ],
    });

    // Try to parse an inline image if present
    const candidates = (result as any)?.response?.candidates ?? [];
    for (const c of candidates) {
      const parts = c?.content?.parts ?? [];
      for (const p of parts) {
        if (p?.inlineData?.data && p?.inlineData?.mimeType?.startsWith('image/')) {
          return Response.json({ imageBase64: p.inlineData.data, mimeType: p.inlineData.mimeType });
        }
      }
    }

    // Fallback: no image inlined
    return new Response('NO_IMAGE_RETURNED', { status: 502 });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Unknown error';
    return new Response(message, { status: 500 });
  }
}

