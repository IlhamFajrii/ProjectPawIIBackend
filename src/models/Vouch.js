import { model, Schema } from 'mongoose';
import { ref } from './fields.js';

const schema = new Schema(
  { circle: ref('Circle'), voucher: ref('User'), vouchee: ref('User', { index: true }) },
  { timestamps: true },
);

schema.index({ voucher: 1, vouchee: 1 }, { unique: true });

export default model('Vouch', schema);
