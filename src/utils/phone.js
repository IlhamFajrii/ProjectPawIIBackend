// "0812-3456-7890", "62812...", "+62812...", "812..." menjadi "+62812..." agar satu nomor satu akun.
export function normalizePhone(input) {
  if (typeof input !== 'string') return null;
  const phone = input.replace(/[\s-]/g, '').replace(/^(\+62|62|0)?/, '+62');
  return /^\+628\d{7,11}$/.test(phone) ? phone : null;
}
