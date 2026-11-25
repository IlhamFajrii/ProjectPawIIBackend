import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HttpError } from '../utils/http.js';

export function jwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET belum diisi');
  return process.env.JWT_SECRET;
}

export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Token tidak ada');

  const secret = jwtSecret();
  let payload;
  try {
    payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch {
    throw new HttpError(401, 'Token tidak valid atau kedaluwarsa');
  }

  // Diambil dari database agar perubahan role langsung berlaku.
  req.user = await User.findById(payload.sub);
  if (!req.user) throw new HttpError(401, 'Pengguna tidak ditemukan');
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') throw new HttpError(403, 'Khusus admin');
  next();
}
