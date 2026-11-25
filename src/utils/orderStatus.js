import { HttpError } from './http.js';

// Aturan Rekber
export const TRANSITIONS = {
  pay: { from: ['PENDING_PAYMENT'], to: 'HELD_IN_ESCROW', by: ['buyer'] },
  cancel: { from: ['PENDING_PAYMENT'], to: 'CANCELLED', by: ['buyer', 'seller'] },
  process: { from: ['HELD_IN_ESCROW'], to: 'IN_PROGRESS', by: ['seller'] },
  deliver: { from: ['IN_PROGRESS'], to: 'DELIVERED', by: ['seller'] },
  confirm: { from: ['DELIVERED'], to: 'COMPLETED', by: ['buyer'] },
  dispute: { from: ['HELD_IN_ESCROW', 'IN_PROGRESS', 'DELIVERED'], to: 'DISPUTED', by: ['buyer', 'seller'] },
  release: { from: ['DISPUTED'], to: 'COMPLETED', by: ['admin'] },
  refund: { from: ['DISPUTED'], to: 'REFUNDED', by: ['admin'] },
};

// Status listing BARANG setelah pesanan mencapai status tertentu.
export const LISTING_STATUS_AFTER = { COMPLETED: 'SOLD', CANCELLED: 'ACTIVE', REFUNDED: 'ACTIVE' };

export function nextStatus(action, status, actor) {
  const rule = TRANSITIONS[action];
  if (!rule.by.includes(actor)) throw new HttpError(403, 'Anda tidak berhak melakukan aksi ini');
  if (!rule.from.includes(status)) throw new HttpError(409, `Aksi tidak bisa dilakukan pada status ${status}`);
  return rule.to;
}
