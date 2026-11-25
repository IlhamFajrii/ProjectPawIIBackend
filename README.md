# PUNYA Backend

REST API untuk PUNYA, marketplace lokal Palembang (barang, sewa, jasa, bantuan) dengan Rekber simulasi. Dibuat dengan Express 5, MongoDB (Mongoose), dan JWT, untuk di-deploy ke Vercel.

## Menjalankan di lokal

Butuh Node.js 24.

```bash
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
# isi .env
npm run dev               # http://localhost:3000/api/health
```

`MONGODB_URI` harus mengarah ke MongoDB Atlas atau replica set lain karena pesanan dan sengketa memakai transaksi. MongoDB lokal tanpa replica set tidak cukup.

| Variabel | Wajib | Keterangan |
|---|---|---|
| `MONGODB_URI` | ya | Connection string, sertakan nama database `/punya` |
| `JWT_SECRET` | ya | Acak dan panjang. Buat dengan `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | tidak | Default `7d` |
| `CORS_ORIGIN` | untuk web | Origin web, pisahkan dengan koma, tanpa garis miring di akhir |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | untuk AI draft | Kalau salah satu kosong, endpoint AI menjawab 500 |
| `PORT` | tidak | Hanya untuk lokal, default `3000` |

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server dengan reload otomatis |
| `npm run seed` | Menambah 4 listing contoh, aman diulang |
| `npm run make-admin -- 081234567890` | Menjadikan akun terdaftar sebagai admin |

## Endpoint

"Token" berarti request harus membawa header `Authorization: Bearer <token>`.

| Method | URL | Akses |
|---|---|---|
| GET | `/api/health` | publik |
| POST | `/api/auth/register` | publik |
| POST | `/api/auth/login` | publik |
| GET | `/api/auth/me` | token |
| PUT | `/api/users/me` | token |
| GET | `/api/users/:id` | publik |
| GET | `/api/listings` | publik |
| GET | `/api/listings/mine` | token |
| GET | `/api/listings/:id` | publik |
| POST | `/api/listings` | token |
| PUT | `/api/listings/:id` | pemilik |
| DELETE | `/api/listings/:id` | pemilik |
| POST | `/api/orders` | token |
| GET | `/api/orders` | token |
| GET | `/api/orders/:id` | pembeli atau penjual |
| POST | `/api/orders/:id/pay` | pembeli |
| POST | `/api/orders/:id/process` | penjual |
| POST | `/api/orders/:id/deliver` | penjual |
| POST | `/api/orders/:id/confirm` | pembeli |
| POST | `/api/orders/:id/cancel` | pembeli atau penjual |
| POST | `/api/orders/:id/dispute` | pembeli atau penjual |
| GET | `/api/disputes` | token (admin melihat semua) |
| GET | `/api/disputes/:id` | peserta atau admin |
| PUT | `/api/disputes/:id/resolve` | admin |
| POST | `/api/circles` | token |
| GET | `/api/circles/mine` | token |
| POST | `/api/circles/join` | token |
| GET | `/api/circles/:id` | anggota |
| DELETE | `/api/circles/:id/members/me` | anggota |
| POST | `/api/circles/:id/vouches` | anggota |
| DELETE | `/api/circles/:id/vouches/:userId` | anggota |
| POST | `/api/conversations` | token |
| GET | `/api/conversations` | token |
| GET | `/api/conversations/:id/messages` | peserta |
| POST | `/api/conversations/:id/messages` | peserta |
| POST | `/api/ai/draft-listing` | token |

Contoh body tiap request ada di koleksi Postman.

## Format request dan response

- Response sukses: `{ "success": true, "data": ... }`. Response gagal: `{ "success": false, "message": "...", "errors": [] }`.
- Login: `{ "identifier": "<nomor HP atau email>", "password": "..." }`.
- Daftar berpaginasi mengembalikan `{ items, page, limit, total }`.
- Filter `GET /api/listings`: `q`, `type`, `category`, `district`, `minPrice`, `maxPrice`, `page`, `limit`.
- Filter `GET /api/orders`: `role` (`buyer` atau `seller`) dan `status`.
- Pesan baru diambil dengan `GET /api/conversations/:id/messages?after=<waktu ISO 8601>`.
- AI draft: `{ "imageBase64": "<tanpa awalan data:>", "mimeType": "image/jpeg", "note": "opsional" }`, foto maksimal 3 MB.

## Status pesanan

| Dari | Aksi | Menjadi |
|---|---|---|
| `PENDING_PAYMENT` | `pay` | `HELD_IN_ESCROW` |
| `PENDING_PAYMENT` | `cancel` | `CANCELLED` |
| `HELD_IN_ESCROW` | `process` | `IN_PROGRESS` |
| `IN_PROGRESS` | `deliver` | `DELIVERED` |
| `DELIVERED` | `confirm` | `COMPLETED` |
| `HELD_IN_ESCROW`, `IN_PROGRESS`, `DELIVERED` | `dispute` | `DISPUTED` |
| `DISPUTED` | admin memilih `RELEASE` | `COMPLETED` |
| `DISPUTED` | admin memilih `REFUND` | `REFUNDED` |

## Uji dengan Postman

1. Import `postman/punya.postman_collection.json`.
2. Isi variabel koleksi `baseUrl` (default `http://localhost:3000`).
3. Untuk putusan sengketa, daftarkan satu akun, jalankan `npm run make-admin`, lalu isi `adminPhone` dan `adminPassword`. Kalau kosong, dua request admin dilewati.
4. Jalankan seluruh koleksi lewat Collection Runner sesuai urutan, karena request memakai ID dan token dari request sebelumnya.

## Deploy ke Vercel

URL production: https://project-paw-ii-backend.vercel.app

Cek status: https://project-paw-ii-backend.vercel.app/api/health

Database memakai MongoDB Atlas (`punya`), fungsi Vercel berjalan di region Singapura (`sin1`), dan production di-deploy dari branch `main`.

Langkah deploy:

1. Di Atlas, buat cluster (region Singapura) dan user database `readWrite` untuk `punya`, lalu izinkan `0.0.0.0/0` pada IP Access List.
2. Di Vercel, import repository. `src/app.js` terdeteksi sebagai aplikasi Express.
3. Isi environment variable di dashboard Vercel (semua variabel di atas kecuali `PORT`). Nilai diisi tanpa awalan `NAMA=` dan tanpa tanda kutip.
4. Di **Settings → Functions → Function Region**, pilih Singapura (`sin1`).
5. Redeploy setiap kali environment variable atau region diubah.
6. Buka `/api/health`, lalu jalankan koleksi Postman dengan `baseUrl` berisi URL Vercel (tanpa garis miring di akhir).

Kalau `/api/health` menjawab 500, lihat tab **Logs** di Vercel. `MongoParseError` berarti format `MONGODB_URI` salah.

### Hasil pengujian

Koleksi Postman dijalankan dengan Newman pada 25 November 2026:

| Target | Request | Assertion | Gagal |
|---|---|---|---|
| Lokal dengan Atlas (`punya_test`) | 66 | 71 | 0 |
| Production | 66 | 71 | 0 |

- Tes draft AI dari foto dilewati karena `GEMINI_API_KEY` belum diisi.
- Putusan sengketa yang diuji hanya `REFUND`, belum `RELEASE`.
- Setelah koleksi dijalankan di production, `MONGODB_URI` di Vercel diubah dan sempat salah format. Setelah diperbaiki, yang dicek ulang hanya `/api/health`, `/api/listings`, URL tidak dikenal (404), dan `/api/auth/me` tanpa token (401).

## Keterbatasan

- Login, register, kode undangan, dan AI draft belum dibatasi jumlah percobaannya, sehingga satu akun bisa menghabiskan kuota Gemini. Pembatasan perlu firewall Vercel atau penyimpanan bersama, karena penghitung di memori tidak berlaku antar-instance.
- Polling chat dengan `after` bisa melewatkan pesan yang tersimpan hampir bersamaan. Client sebaiknya mengambil ulang dengan rentang yang sedikit tumpang-tindih, lalu membuang duplikat berdasarkan `_id`.
- Logout tidak membatalkan token. Token berlaku sampai kedaluwarsa.
- Chat memakai polling, belum Socket.IO.
- Pencarian memakai regex tanpa index.
