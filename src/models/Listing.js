import { model, Schema } from 'mongoose';
import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES, PRICE_UNITS } from '../utils/constants.js';
import { ref, text, urlList } from './fields.js';

const schema = new Schema(
  {
    owner: ref('User'),
    type: { type: String, required: true, enum: LISTING_TYPES },
    title: text(120, { required: true }),
    description: text(3000, { required: true }),
    category: text(60, { required: true, lowercase: true }),
    price: {
      type: Number,
      required: true,
      min: 1,
      max: 1_000_000_000,
      validate: { validator: Number.isInteger, message: 'harus bilangan bulat rupiah' },
    },
    priceUnit: { type: String, enum: PRICE_UNITS, default: 'ITEM' },
    district: { type: String, required: true, enum: DISTRICTS },
    images: urlList,
    status: { type: String, enum: LISTING_STATUSES, default: 'ACTIVE' },
  },
  { timestamps: true },
);

schema.index({ status: 1, type: 1, district: 1, createdAt: -1 });
schema.index({ owner: 1, createdAt: -1 });

export default model('Listing', schema);
