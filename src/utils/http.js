import { isValidObjectId } from 'mongoose';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

export function assertId(id) {
  if (typeof id !== 'string' || id.length !== 24 || !isValidObjectId(id)) {
    throw new HttpError(400, 'ID tidak valid');
  }
}

// Allow-list: hanya field yang disebut yang diambil dari body.
export const pick = (body, fields) =>
  Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

export function queryString(query, name) {
  const value = query[name];
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string') throw new HttpError(400, `Parameter ${name} tidak valid`);
  return value;
}

export function queryInt(query, name) {
  const value = queryString(query, name);
  if (value === undefined) return undefined;
  if (!/^\d{1,10}$/.test(value)) throw new HttpError(400, `Parameter ${name} harus bilangan bulat`);
  return Number(value);
}

export function paginate(query) {
  const page = Math.max(queryInt(query, 'page') ?? 1, 1);
  const limit = Math.min(Math.max(queryInt(query, 'limit') ?? 20, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

export async function findPage(Model, filter, query, { sort = { createdAt: -1, _id: -1 }, populate = [] } = {}) {
  const { page, limit, skip } = paginate(query);
  const [items, total] = await Promise.all([
    Model.find(filter).sort(sort).skip(skip).limit(limit).populate(populate),
    Model.countDocuments(filter),
  ]);
  return { items, page, limit, total };
}
