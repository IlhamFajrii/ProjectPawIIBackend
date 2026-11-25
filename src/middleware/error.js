import { HttpError } from '../utils/http.js';

const VALIDATION_MESSAGES = { required: 'wajib diisi', maxlength: 'terlalu panjang', minlength: 'terlalu pendek' };

const DUPLICATE_MESSAGES = {
  phone: 'Nomor HP sudah terdaftar',
  email: 'Email sudah terdaftar',
  order: 'Pesanan ini sudah punya sengketa',
  voucher: 'Anda sudah memberi vouch ke pengguna ini',
};

export const notFound = () => {
  throw new HttpError(404, 'Endpoint tidak ditemukan');
};

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const send = (status, message, errors = []) => res.status(status).json({ success: false, message, errors });

  if (err instanceof HttpError) return send(err.status, err.message);
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.kind === 'user defined' ? e.message : (VALIDATION_MESSAGES[e.kind] ?? 'tidak valid'),
    }));
    return send(400, 'Data tidak valid', errors);
  }
  if (err.name === 'CastError') return send(400, `Nilai ${err.path} tidak valid`);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0];
    return send(409, DUPLICATE_MESSAGES[field] ?? 'Data sudah ada');
  }
  if (err.type === 'entity.too.large') return send(413, 'Ukuran data terlalu besar');
  if (err.status >= 400 && err.status < 500) return send(err.status, 'Request tidak valid');

  console.error(err.stack);
  return send(500, 'Terjadi kesalahan pada server');
}
