// shortcut: deteksi kata kunci, mudah diakali. Tingkatkan bila penipuan nyata lolos.
const PATTERNS = [
  /\b(transfer|tf)\s+(langsung|aja|saja)\b/i,
  /\b(di\s*)?luar\s+(rekber|aplikasi|punya)\b/i,
  /\btanpa\s+rekber\b/i,
  /\b(no\.?|nomor)\s*rek(ening)?(nya|ku|mu)?\b/i,
  // Nomor rekening, boleh dipisah spasi, titik, atau strip. "Rekening bersama" adalah Rekber, bukan pelanggaran.
  /\b(rek(ening)?(nya|ku|mu)?(?!\s*bersama)|bca|bri|bni|bsi|mandiri)\b\D{0,20}\d[\d\s.-]{7,}/i,
  // E-wallet ditandai hanya bila diikuti nomor HP, karena "dana" juga kata sehari-hari.
  /\b(dana|ovo|gopay)(nya|ku|mu)?\b\D{0,20}(\+?62|0)[\s.-]?8[\d\s.-]{7,}/i,
];

export const isOffPlatform = (text) => PATTERNS.some((pattern) => pattern.test(text));
