import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import Order from '../models/Order.js';
import { ORDER_STATUSES } from '../utils/constants.js';
import { assertId, findPage, HttpError, ok, queryString } from '../utils/http.js';
import { LISTING_STATUS_AFTER, nextStatus } from '../utils/orderStatus.js';

const PARTIES = { path: 'buyer seller', select: 'name district avatarUrl' };

export async function loadOwnOrder(req) {
  assertId(req.params.id);
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Pesanan tidak ditemukan');
  const actor = (order.buyer.equals(req.user._id) && 'buyer') || (order.seller.equals(req.user._id) && 'seller');
  if (!actor) throw new HttpError(403, 'Anda bukan peserta pesanan ini');
  return { order, actor };
}

// Dipanggil di dalam transaksi agar status pesanan dan status listing berubah bersama.
export async function applyTransition(order, action, actor, userId, session) {
  const status = nextStatus(action, order.status, actor);
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    { $set: { status }, $push: { statusHistory: { status, by: userId, at: new Date() } } },
    { session, returnDocument: 'after' },
  );
  if (!updated) throw new HttpError(409, 'Status pesanan sudah berubah, muat ulang data');

  const listingStatus = LISTING_STATUS_AFTER[status];
  if (listingStatus && updated.listingSnapshot.type === 'BARANG') {
    await Listing.updateOne({ _id: updated.listing, status: 'RESERVED' }, { status: listingStatus }, { session });
  }
  return updated;
}

export async function create(req, res) {
  const { listingId, quantity = 1, note } = req.body;
  assertId(listingId);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 365) {
    throw new HttpError(400, 'quantity harus bilangan bulat 1 sampai 365');
  }

  let order;
  await mongoose.connection.transaction(async (session) => {
    const listing = await Listing.findById(listingId).session(session);
    if (!listing || listing.status === 'INACTIVE') throw new HttpError(404, 'Listing tidak ditemukan');
    if (listing.owner.equals(req.user._id)) throw new HttpError(403, 'Tidak bisa memesan listing milik sendiri');
    if (listing.status !== 'ACTIVE') throw new HttpError(409, 'Listing tidak tersedia');

    if (listing.type === 'BARANG') {
      if (quantity !== 1) throw new HttpError(400, 'quantity untuk BARANG harus 1');
      const reserved = await Listing.findOneAndUpdate(
        { _id: listing._id, status: 'ACTIVE' },
        { status: 'RESERVED' },
        { session },
      );
      if (!reserved) throw new HttpError(409, 'Listing tidak tersedia');
    }

    [order] = await Order.create(
      [{
        orderCode: `PNY-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`,
        listing: listing._id,
        buyer: req.user._id,
        seller: listing.owner,
        listingSnapshot: {
          title: listing.title,
          type: listing.type,
          price: listing.price,
          priceUnit: listing.priceUnit,
        },
        quantity,
        amount: listing.price * quantity,
        note,
        statusHistory: [{ status: 'PENDING_PAYMENT', by: req.user._id }],
      }],
      { session },
    );
  });
  ok(res, order, 201);
}

export async function list(req, res) {
  const me = req.user._id;
  const role = queryString(req.query, 'role');
  if (role && role !== 'buyer' && role !== 'seller') throw new HttpError(400, 'role harus buyer atau seller');
  const filter = role ? { [role]: me } : { $or: [{ buyer: me }, { seller: me }] };

  const status = queryString(req.query, 'status');
  if (status) {
    if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'status tidak valid');
    filter.status = status;
  }
  ok(res, await findPage(Order, filter, req.query, { populate: PARTIES }));
}

export async function detail(req, res) {
  const { order } = await loadOwnOrder(req);
  ok(res, await order.populate(PARTIES));
}

export const transition = (action) => async (req, res) => {
  const { order, actor } = await loadOwnOrder(req);
  let updated;
  await mongoose.connection.transaction(async (session) => {
    updated = await applyTransition(order, action, actor, req.user._id, session);
  });
  ok(res, updated);
};
