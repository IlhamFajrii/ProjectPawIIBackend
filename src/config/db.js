import mongoose from 'mongoose';

mongoose.set('sanitizeFilter', true);

let cached;

// Promise di-cache agar instance Vercel yang masih hangat memakai koneksi yang sama.
export function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return Promise.reject(new Error('MONGODB_URI belum diisi'));

  cached ??= mongoose
    .connect(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
    .catch((error) => {
      cached = undefined;
      throw error;
    });
  return cached;
}
