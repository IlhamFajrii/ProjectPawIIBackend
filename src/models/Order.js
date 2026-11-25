import { model, Schema } from 'mongoose';
import { LISTING_TYPES, ORDER_STATUSES, PRICE_UNITS } from '../utils/constants.js';
import { ref, text } from './fields.js';

const history = new Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    by: ref('User'),
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const schema = new Schema(
  {
    orderCode: { type: String, required: true, unique: true },
    listing: ref('Listing'),
    buyer: ref('User', { index: true }),
    seller: ref('User', { index: true }),
    listingSnapshot: {
      title: { type: String, required: true },
      type: { type: String, enum: LISTING_TYPES, required: true },
      price: { type: Number, required: true },
      priceUnit: { type: String, enum: PRICE_UNITS, required: true },
    },
    quantity: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 1 },
    note: text(500),
    status: { type: String, enum: ORDER_STATUSES, default: 'PENDING_PAYMENT' },
    statusHistory: [history],
  },
  { timestamps: true },
);

export default model('Order', schema);
