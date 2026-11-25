import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Listing from '../models/Listing.js';
import Message from '../models/Message.js';
import { isOffPlatform } from '../utils/chatWarning.js';
import { assertId, findPage, HttpError, ok, queryString } from '../utils/http.js';

const PAGE_SIZE = 50;

async function findOwnConversation(req) {
  assertId(req.params.id);
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new HttpError(404, 'Percakapan tidak ditemukan');
  if (!conversation.participants.some((p) => p.equals(req.user._id))) {
    throw new HttpError(403, 'Anda bukan peserta percakapan ini');
  }
  return conversation;
}

export async function start(req, res) {
  const { listingId } = req.body;
  assertId(listingId);
  const listing = await Listing.findById(listingId);
  if (!listing || listing.status === 'INACTIVE') throw new HttpError(404, 'Listing tidak ditemukan');
  if (listing.owner.equals(req.user._id)) throw new HttpError(403, 'Ini listing milik Anda sendiri');

  const result = await Conversation.findOneAndUpdate(
    { participantKey: `${listing.id}:${req.user.id}` },
    {
      $setOnInsert: {
        listing: listing._id,
        participants: [req.user._id, listing.owner],
        lastMessageAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after', includeResultMetadata: true },
  );
  ok(res, result.value, result.lastErrorObject.updatedExisting ? 200 : 201);
}

export async function list(req, res) {
  ok(res, await findPage(Conversation, { participants: req.user._id }, req.query, {
    sort: { lastMessageAt: -1, _id: -1 },
    populate: [
      { path: 'listing', select: 'title type status' },
      { path: 'participants', select: 'name avatarUrl' },
    ],
  }));
}

export async function messages(req, res) {
  const { _id } = await findOwnConversation(req);
  const after = queryString(req.query, 'after');
  const filter = { conversation: _id };
  if (after) {
    const date = new Date(after);
    if (Number.isNaN(date.getTime())) throw new HttpError(400, 'after harus tanggal ISO 8601');
    filter.createdAt = mongoose.trusted({ $gt: date });
  }

  // shortcut: kursor waktu bisa melewatkan pesan yang tersimpan bersamaan, pakai nomor urut dari server bila chat ramai.
  const items = await Message.find(filter)
    .sort({ createdAt: after ? 1 : -1, _id: after ? 1 : -1 })
    .limit(PAGE_SIZE);
  if (!after) items.reverse();

  await Message.updateMany(
    {
      _id: mongoose.trusted({ $in: items.map((m) => m._id) }),
      sender: mongoose.trusted({ $ne: req.user._id }),
      readAt: null,
    },
    { readAt: new Date() },
  );
  ok(res, items);
}

export async function send(req, res) {
  const { _id } = await findOwnConversation(req);
  const message = new Message({ conversation: _id, sender: req.user._id, text: req.body.text });
  await message.validate();
  message.warning = isOffPlatform(message.text);
  await message.save();
  // Syarat waktu: pesan yang lebih lama tidak menimpa yang lebih baru.
  await Conversation.updateOne(
    { _id, lastMessageAt: mongoose.trusted({ $lte: message.createdAt }) },
    { lastMessage: message.text, lastMessageAt: message.createdAt },
  );
  ok(res, message, 201);
}
