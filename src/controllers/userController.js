import User from '../models/User.js';
import Vouch from '../models/Vouch.js';
import { assertId, HttpError, ok, pick } from '../utils/http.js';

export async function updateMe(req, res) {
  req.user.set(pick(req.body, ['name', 'district', 'email', 'avatarUrl']));
  await req.user.save();
  ok(res, req.user);
}

export async function publicProfile(req, res) {
  assertId(req.params.id);
  // Nomor HP dan email sengaja tidak diambil.
  const user = await User.findById(req.params.id).select('name district avatarUrl createdAt');
  if (!user) throw new HttpError(404, 'Pengguna tidak ditemukan');
  const vouchCount = await Vouch.countDocuments({ vouchee: user._id });
  ok(res, { ...user.toJSON(), vouchCount });
}
