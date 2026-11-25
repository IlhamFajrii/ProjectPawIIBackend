import { model, Schema } from 'mongoose';
import { DISTRICTS } from '../utils/constants.js';
import { text, url } from './fields.js';

const schema = new Schema(
  {
    name: text(80, { required: true }),
    phone: { type: String, required: true, unique: true },
    email: text(120, {
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      unique: true,
      sparse: true,
      // Kosong atau null berarti tidak ada, agar tidak ikut masuk index unik.
      set: (value) => (value === null || (typeof value === 'string' && !value.trim()) ? undefined : value),
    }),
    passwordHash: { type: String, required: true, select: false },
    district: { type: String, required: true, enum: DISTRICTS },
    avatarUrl: url,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export default model('User', schema);
