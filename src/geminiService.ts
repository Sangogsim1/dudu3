import type { ImageData } from './types';

// Client calls our API route. Keep API key server-side only.
export async function generateDressUpImage(
  character: ImageData,
  clothing: ImageData,
  prompt: string,
): Promise<string> {
  const apiBaseFromStorage = typeof window !== 'undefined' ? localStorage.getItem('API_BASE') || '' : ''
  const apiBase = apiBaseFromStorage || import.meta.env.VITE_API_BASE || ''
  const response = await fetch(`${apiBase}/api/gemini-dress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ character, clothing, prompt }),
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => '');
    throw new Error(`GENERATION_FAILED:${msg || response.statusText}`);
  }

  const data = await response.json();
  if (!data?.imageBase64 || !data?.mimeType) {
    throw new Error('NO_IMAGE_RETURNED');
  }
  return `data:${data.mimeType};base64,${data.imageBase64}`;
}

