import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../middleware/auth.js';
import User from '../models/User.js';
import { HttpError, ok } from '../utils/http.js';
import { normalizePhone } from '../utils/phone.js';

export async function register(req, res) {
  const { name, phone, email, password, district } = req.body;

  // bcrypt hanya memakai 72 byte pertama.
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
    throw new HttpError(400, 'Password harus 8 sampai 72 karakter');
  }
  const normalized = normalizePhone(phone);
  if (!normalized) throw new HttpError(400, 'Nomor HP tidak valid');

  const user = await User.create({
    name,
    district,
    email,
    phone: normalized,
    passwordHash: await bcrypt.hash(password, 10),
  });
  ok(res, user, 201);
}

export async function login(req, res) {
  const { identifier, password } = req.body;
  if (typeof identifier !== 'string' || typeof password !== 'string' || !identifier || !password) {
    throw new HttpError(400, 'identifier (nomor HP atau email) dan password wajib diisi');
  }

  const filter = identifier.includes('@')
    ? { email: identifier.trim().toLowerCase() }
    : { phone: normalizePhone(identifier) ?? identifier };
  const user = await User.findOne(filter).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Nomor HP/email atau password salah');
  }

  const lifetime = process.env.JWT_EXPIRES_IN || '7d';
  const token = jwt.sign({}, jwtSecret(), {
    subject: user.id,
    // String angka dibaca jsonwebtoken sebagai milidetik, Number sebagai detik.
    expiresIn: /^\d+$/.test(lifetime) ? Number(lifetime) : lifetime,
  });
  ok(res, { token, user });
}

export const me = (req, res) => ok(res, req.user);
