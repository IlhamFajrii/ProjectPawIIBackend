import { handleUpload } from '@vercel/blob/client';
import { HttpError } from '../utils/http.js';

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

/**
 * Memberi browser izin sekali pakai untuk mengunggah satu foto langsung ke Vercel Blob.
 * shortcut: jumlah unggahan per akun belum dibatasi, tambahkan penghitung bila kuota Blob mulai disalahgunakan.
 */
export async function token(req, res) {
  if (req.body.type !== 'blob.generate-client-token') throw new HttpError(400, 'Request tidak valid');

  // Setiap pengguna hanya boleh menulis di foldernya sendiri.
  const allowed = new RegExp(`^(listings|avatars)/${req.user.id}/[\\w-]{1,60}\\.jpg$`);

  const result = await handleUpload({
    body: req.body,
    request: req,
    onBeforeGenerateToken: async (pathname) => {
      if (!allowed.test(pathname)) throw new HttpError(400, 'Nama file tidak valid');
      return {
        allowedContentTypes: ['image/jpeg'],
        maximumSizeInBytes: MAX_PHOTO_BYTES,
        addRandomSuffix: true,
        validUntil: Date.now() + 5 * 60 * 1000,
      };
    },
  });
  // Dibaca langsung oleh upload() di @vercel/blob/client, jadi tanpa amplop { success, data }.
  res.json(result);
}
