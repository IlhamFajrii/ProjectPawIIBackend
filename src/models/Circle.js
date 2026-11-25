import { model, Schema } from 'mongoose';
import { ref, text } from './fields.js';

const member = new Schema(
  { user: ref('User'), joinedAt: { type: Date, default: Date.now } },
  { _id: false },
);

const schema = new Schema(
  {
    name: text(80, { required: true }),
    owner: ref('User'),
    inviteCode: { type: String, required: true, unique: true },
    members: [member],
  },
  { timestamps: true },
);

schema.index({ 'members.user': 1 });

export default model('Circle', schema);
