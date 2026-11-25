import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import { assertId, findPage, HttpError, ok, pick, queryInt, queryString } from '../utils/http.js';

const EDITABLE = ['title', 'description', 'category', 'price', 'priceUnit', 'district', 'images'];
const OWNER = { path: 'owner', select: 'name district avatarUrl createdAt' };

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function findOwned(req) {
  assertId(req.params.id);
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new HttpError(404, 'Listing tidak ditemukan');
  if (!listing.owner.equals(req.user._id)) throw new HttpError(403, 'Hanya pemilik yang boleh mengubah listing');
  return listing;
}

export async function create(req, res) {
  const listing = await Listing.create({ ...pick(req.body, ['type', ...EDITABLE]), owner: req.user._id });
  ok(res, listing, 201);
}

export async function list(req, res) {
  const filter = { status: 'ACTIVE' };
  for (const name of ['type', 'district', 'category']) {
    const value = queryString(req.query, name);
    if (value) filter[name] = name === 'category' ? value.toLowerCase() : value;
  }

  const min = queryInt(req.query, 'minPrice');
  const max = queryInt(req.query, 'maxPrice');
  if (min !== undefined || max !== undefined) {
    filter.price = mongoose.trusted({
      ...(min !== undefined && { $gte: min }),
      ...(max !== undefined && { $lte: max }),
    });
  }

  const q = queryString(req.query, 'q');
  if (q) {
    // shortcut: regex tanpa index, ganti dengan Atlas Search bila data sudah ribuan.
    const pattern = new RegExp(escapeRegex(q.slice(0, 100)), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  ok(res, await findPage(Listing, filter, req.query, { populate: OWNER }));
}

export async function mine(req, res) {
  ok(res, await findPage(Listing, { owner: req.user._id }, req.query));
}

export async function detail(req, res) {
  assertId(req.params.id);
  const listing = await Listing.findById(req.params.id).populate(OWNER);
  if (!listing || listing.status === 'INACTIVE') throw new HttpError(404, 'Listing tidak ditemukan');
  ok(res, listing);
}

export async function update(req, res) {
  const listing = await findOwned(req);
  listing.set(pick(req.body, EDITABLE));
  await listing.save();
  ok(res, listing);
}

export async function remove(req, res) {
  const { _id } = await findOwned(req);
  const listing = await Listing.findOneAndUpdate(
    { _id, status: mongoose.trusted({ $ne: 'RESERVED' }) },
    { status: 'INACTIVE' },
    { returnDocument: 'after' },
  );
  if (!listing) throw new HttpError(409, 'Listing sedang dipesan, selesaikan atau batalkan pesanannya dulu');
  ok(res, listing);
}
