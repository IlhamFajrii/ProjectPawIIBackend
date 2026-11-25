import { model, Schema } from 'mongoose';
import { DISPUTE_REASONS, DISPUTE_RESOLUTIONS } from '../utils/constants.js';
import { ref, text, urlList } from './fields.js';

const schema = new Schema(
  {
    order: ref('Order', { unique: true }),
    openedBy: ref('User'),
    reason: { type: String, required: true, enum: DISPUTE_REASONS },
    description: text(2000, { required: true }),
    evidence: urlList,
    status: { type: String, enum: ['OPEN', 'RESOLVED'], default: 'OPEN' },
    resolution: { type: String, enum: DISPUTE_RESOLUTIONS },
    adminNote: text(2000),
    resolvedBy: ref('User', { required: false }),
    resolvedAt: Date,
  },
  { timestamps: true },
);

export default model('Dispute', schema);
