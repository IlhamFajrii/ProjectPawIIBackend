// Menjadikan akun yang sudah terdaftar sebagai admin. Pakai: npm run make-admin -- 081234567890
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import { normalizePhone } from '../src/utils/phone.js';

const phone = normalizePhone(process.argv[2]);
if (!phone) {
  console.error('Pakai: npm run make-admin -- <nomor HP>');
  process.exit(1);
}

await connectDB();
const { matchedCount } = await User.updateOne({ phone }, { role: 'admin' });
await mongoose.disconnect();

if (!matchedCount) {
  console.error('Nomor belum terdaftar. Register dulu lewat API.');
  process.exit(1);
}
console.log('Akun sekarang berperan admin.');
