// Data contoh. Aman dijalankan berulang. Pakai: npm run seed
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Listing from '../src/models/Listing.js';
import User from '../src/models/User.js';

const LISTINGS = [
  { type: 'BARANG', title: 'Kulkas Sharp 2 Pintu 300L', category: 'elektronik', price: 2_800_000, priceUnit: 'ITEM', district: 'Ilir Timur I' },
  { type: 'SEWA', title: 'Sewa Tenda Pernikahan & Kursi', category: 'perlengkapan event', price: 850_000, priceUnit: 'HARI', district: 'Seberang Ulu I' },
  { type: 'JASA', title: 'Jasa Perbaikan AC & Elektronik', category: 'servis', price: 75_000, priceUnit: 'KUNJUNGAN', district: 'Bukit Kecil' },
  { type: 'TUGAS', title: 'Bantu Belanja di Pasar 16 Ilir', category: 'titip belanja', price: 50_000, priceUnit: 'TRIP', district: 'Ilir Timur I' },
];

await connectDB();

// Password acak dan tidak disimpan: akun demo tidak dimaksudkan untuk login.
const owner =
  (await User.findOne({ phone: '+628000000001' })) ??
  (await User.create({
    name: 'Penjual Demo',
    phone: '+628000000001',
    district: 'Ilir Timur I',
    passwordHash: await bcrypt.hash(randomBytes(24).toString('hex'), 10),
  }));

for (const data of LISTINGS) {
  if (await Listing.exists({ owner: owner._id, title: data.title })) continue;
  await Listing.create({ ...data, description: `Contoh listing: ${data.title}.`, owner: owner._id });
  console.log(`Ditambahkan: ${data.title}`);
}

await mongoose.disconnect();
console.log('Seed selesai.');
