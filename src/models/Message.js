import { model, Schema } from 'mongoose';
import { ref, text } from './fields.js';

const schema = new Schema(
  {
    conversation: ref('Conversation'),
    sender: ref('User'),
    text: text(2000, { required: true }),
    warning: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true },
);

schema.index({ conversation: 1, createdAt: 1 });

export default model('Message', schema);
