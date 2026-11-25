import { HttpError } from './http.js';

const PROMPT = `Anda membantu penjual di marketplace lokal Palembang membuat draft listing dari foto.
Balas hanya JSON dengan tiga field string: "title" (maksimal 100 karakter), "description", "category" (satu atau dua kata).
Tulis dalam Bahasa Indonesia. Jangan menyebut harga, dan jangan menjamin kondisi barang yang tidak terlihat di foto.`;

const failed = () => new HttpError(502, 'AI gagal membuat draft, coba lagi atau isi manual');

export async function draftListing({ imageBase64, mimeType, note }) {
  const { GEMINI_API_KEY: key, GEMINI_MODEL: model } = process.env;
  if (!key || !model) throw new HttpError(500, 'AI belum dikonfigurasi di server');

  let draft;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: note ? `${PROMPT}\nCatatan penjual: ${note}` : PROMPT },
              { inlineData: { mimeType, data: imageBase64 } },
            ],
          }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    );
    if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
    const body = await response.json();
    draft = JSON.parse(body.candidates[0].content.parts.map((part) => part.text ?? '').join(''));
  } catch (error) {
    console.error('AI draft gagal:', error.message);
    throw failed();
  }

  const clean = (value, max) => {
    if (typeof value !== 'string' || !value.trim()) throw failed();
    return value.trim().slice(0, max);
  };
  // Hanya tiga field ini yang diteruskan, jadi harga dari model ikut terbuang.
  return {
    title: clean(draft?.title, 120),
    description: clean(draft?.description, 3000),
    category: clean(draft?.category, 60).toLowerCase(),
  };
}
