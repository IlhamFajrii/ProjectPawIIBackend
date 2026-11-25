import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import Circle from '../models/Circle.js';
import Vouch from '../models/Vouch.js';
import { assertId, HttpError, ok } from '../utils/http.js';

const isMember = (circle, userId) => circle.members.some((m) => m.user.equals(userId));

async function findMemberCircle(req) {
  assertId(req.params.id);
  const circle = await Circle.findById(req.params.id);
  if (!circle) throw new HttpError(404, 'Circle tidak ditemukan');
  if (!isMember(circle, req.user._id)) throw new HttpError(403, 'Anda bukan anggota circle ini');
  return circle;
}

export async function create(req, res) {
  const circle = await Circle.create({
    name: req.body.name,
    owner: req.user._id,
    inviteCode: randomBytes(5).toString('hex').toUpperCase(),
    members: [{ user: req.user._id }],
  });
  ok(res, circle, 201);
}

export async function mine(req, res) {
  ok(res, await Circle.find({ 'members.user': req.user._id }).sort({ createdAt: -1 }));
}

export async function detail(req, res) {
  const circle = await findMemberCircle(req);
  const counts = await Vouch.aggregate([
    { $match: { vouchee: { $in: circle.members.map((m) => m.user) } } },
    { $group: { _id: '$vouchee', total: { $sum: 1 } } },
  ]);
  const totals = new Map(counts.map((c) => [String(c._id), c.total]));

  await circle.populate('members.user', 'name district avatarUrl');
  const data = circle.toJSON();
  data.members = data.members.map((m) => ({ ...m, vouchCount: totals.get(String(m.user._id)) ?? 0 }));
  ok(res, data);
}

export async function join(req, res) {
  const { inviteCode } = req.body;
  if (typeof inviteCode !== 'string' || !inviteCode.trim()) throw new HttpError(400, 'inviteCode wajib diisi');
  const code = inviteCode.trim().toUpperCase();

  const circle = await Circle.findOneAndUpdate(
    { inviteCode: code, 'members.user': mongoose.trusted({ $ne: req.user._id }) },
    { $push: { members: { user: req.user._id } } },
    { returnDocument: 'after' },
  );
  if (circle) return ok(res, circle);
  if (await Circle.exists({ inviteCode: code })) throw new HttpError(409, 'Anda sudah menjadi anggota');
  throw new HttpError(404, 'Kode undangan tidak ditemukan');
}

export async function leave(req, res) {
  const { _id } = await findMemberCircle(req);
  const me = req.user._id;
  await mongoose.connection.transaction(async (session) => {
    await Circle.updateOne({ _id }, { $pull: { members: { user: me } } }, { session });
    // Vouch di circle ini ikut dicabut. Kalau tertinggal, tidak bisa dicabut lagi dan memblokir vouch baru.
    await Vouch.deleteMany({ circle: _id, $or: [{ voucher: me }, { vouchee: me }] }, { session });
    await Circle.deleteOne({ _id, members: mongoose.trusted({ $size: 0 }) }, { session });
  });
  ok(res, { left: true });
}

export async function vouch(req, res) {
  const circle = await findMemberCircle(req);
  const { userId } = req.body;
  assertId(userId);
  if (req.user._id.equals(userId)) throw new HttpError(400, 'Tidak bisa memberi vouch ke diri sendiri');
  if (!isMember(circle, userId)) throw new HttpError(404, 'Pengguna bukan anggota circle ini');
  ok(res, await Vouch.create({ circle: circle._id, voucher: req.user._id, vouchee: userId }), 201);
}

export async function unvouch(req, res) {
  const circle = await findMemberCircle(req);
  assertId(req.params.userId);
  const { deletedCount } = await Vouch.deleteOne({
    circle: circle._id,
    voucher: req.user._id,
    vouchee: req.params.userId,
  });
  if (!deletedCount) throw new HttpError(404, 'Vouch tidak ditemukan');
  ok(res, { revoked: true });
}
