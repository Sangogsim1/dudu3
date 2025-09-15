import { GoogleGenerativeAI } from '@google/generative-ai';

interface Body {
  character: { base64: string; mimeType: string };
  clothing: { base64: string; mimeType: string };
  prompt: string;
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).send('Missing GEMINI_API_KEY');
      return;
    }
    const { character, clothing, prompt } = req.body as Body;
    if (!character?.base64 || !clothing?.base64 || !prompt?.trim()) {
      res.status(400).send('Invalid input');
      return;
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
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

    const candidates = (result as any)?.response?.candidates ?? [];
    for (const c of candidates) {
      const parts = c?.content?.parts ?? [];
      for (const p of parts) {
        if (p?.inlineData?.data && p?.inlineData?.mimeType?.startsWith('image/')) {
          res.status(200).json({ imageBase64: p.inlineData.data, mimeType: p.inlineData.mimeType });
          return;
        }
      }
    }
    res.status(502).send('NO_IMAGE_RETURNED');
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Unknown error';
    res.status(500).send(message);
  }
}

