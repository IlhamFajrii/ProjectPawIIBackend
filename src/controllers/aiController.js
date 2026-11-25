import { draftListing } from '../utils/gemini.js';
import { HttpError, ok } from '../utils/http.js';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

// Isi file dicocokkan dengan tipe yang diklaim client.
const SIGNATURES = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP',
};

export async function draft(req, res) {
  const { imageBase64, mimeType, note } = req.body ?? {};

  if (typeof mimeType !== 'string' || !Object.hasOwn(SIGNATURES, mimeType)) {
    throw new HttpError(400, 'mimeType harus image/jpeg, image/png, atau image/webp');
  }
  if (typeof imageBase64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64)) {
    throw new HttpError(400, 'imageBase64 wajib berupa base64 tanpa awalan data URL');
  }
  if (note !== undefined && (typeof note !== 'string' || note.length > 500)) {
    throw new HttpError(400, 'note harus teks maksimal 500 karakter');
  }

  const image = Buffer.from(imageBase64, 'base64');
  if (image.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'Ukuran foto maksimal 3 MB');
  if (!SIGNATURES[mimeType](image)) throw new HttpError(400, 'Isi file tidak sesuai dengan mimeType');

  ok(res, await draftListing({ imageBase64, mimeType, note }));
}
