import mongoose from 'mongoose';
import Dispute from '../models/Dispute.js';
import Order from '../models/Order.js';
import { DISPUTE_RESOLUTIONS } from '../utils/constants.js';
import { assertId, findPage, HttpError, ok, pick, queryString } from '../utils/http.js';
import { applyTransition, loadOwnOrder } from './orderController.js';

const isParty = (order, userId) => order.buyer.equals(userId) || order.seller.equals(userId);

export async function open(req, res) {
  const { order, actor } = await loadOwnOrder(req);
  let dispute;
  await mongoose.connection.transaction(async (session) => {
    await applyTransition(order, 'dispute', actor, req.user._id, session);
    [dispute] = await Dispute.create(
      [{ ...pick(req.body, ['reason', 'description', 'evidence']), order: order._id, openedBy: req.user._id }],
      { session },
    );
  });
  ok(res, dispute, 201);
}

export async function list(req, res) {
  const filter = {};
  if (req.user.role !== 'admin') {
    const me = req.user._id;
    const orderIds = await Order.find({ $or: [{ buyer: me }, { seller: me }] }).distinct('_id');
    filter.order = mongoose.trusted({ $in: orderIds });
  }
  const status = queryString(req.query, 'status');
  if (status) filter.status = status;
  ok(res, await findPage(Dispute, filter, req.query, { populate: 'order' }));
}

export async function detail(req, res) {
  assertId(req.params.id);
  const dispute = await Dispute.findById(req.params.id).populate('order');
  if (!dispute) throw new HttpError(404, 'Sengketa tidak ditemukan');
  if (req.user.role !== 'admin' && !isParty(dispute.order, req.user._id)) {
    throw new HttpError(403, 'Anda bukan peserta sengketa ini');
  }
  ok(res, dispute);
}

export async function resolve(req, res) {
  assertId(req.params.id);
  const { resolution, adminNote } = req.body;
  if (!DISPUTE_RESOLUTIONS.includes(resolution)) throw new HttpError(400, 'resolution harus RELEASE atau REFUND');

  const found = await Dispute.findById(req.params.id).populate('order');
  if (!found) throw new HttpError(404, 'Sengketa tidak ditemukan');
  if (isParty(found.order, req.user._id)) {
    throw new HttpError(403, 'Admin tidak boleh memutus sengketa pesanannya sendiri');
  }

  let dispute;
  await mongoose.connection.transaction(async (session) => {
    dispute = await Dispute.findOneAndUpdate(
      { _id: found._id, status: 'OPEN' },
      { status: 'RESOLVED', resolution, adminNote, resolvedBy: req.user._id, resolvedAt: new Date() },
      { session, returnDocument: 'after', runValidators: true },
    );
    if (!dispute) throw new HttpError(409, 'Sengketa sudah diputuskan');
    await applyTransition(found.order, resolution.toLowerCase(), 'admin', req.user._id, session);
  });
  ok(res, dispute);
}
