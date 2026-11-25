import { model, Schema } from 'mongoose';
import { ref } from './fields.js';

const schema = new Schema(
  {
    listing: ref('Listing'),
    participants: [ref('User')],
    // "<listingId>:<peminatId>", unik agar satu peminat hanya punya satu percakapan per listing.
    participantKey: { type: String, required: true, unique: true },
    lastMessage: String,
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

schema.index({ participants: 1, lastMessageAt: -1 });

export default model('Conversation', schema);
