# PUNYA Backend

REST API untuk PUNYA, marketplace lokal Palembang (barang, sewa, jasa, bantuan) dengan Rekber simulasi.

![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.3-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-9.13-880000?logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-9.0-000000?logo=jsonwebtokens&logoColor=white)
![Vercel Blob](https://img.shields.io/badge/Vercel%20Blob-2.9-000000?logo=vercel&logoColor=white)
![Gemini API](https://img.shields.io/badge/Gemini%20API-REST-8E75B2?logo=googlegemini&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-Newman-FF6C37?logo=postman&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-hosting-000000?logo=vercel&logoColor=white)

| Layanan | Alamat |
|---|---|
| API production | https://project-paw-ii-backend.vercel.app |
| Status | https://project-paw-ii-backend.vercel.app/api/health |
| Aplikasi web | https://project-paw-ii-frontend.vercel.app |

## Teknologi

Versi di bawah adalah yang terpasang saat README ini ditulis.

| Teknologi | Versi | Kegunaan |
|---|---|---|
| Node.js | 24 | Runtime, modul ES |
| Express | 5.3 | Framework REST API |
| MongoDB Atlas | | Database |
| Mongoose | 9.13 | Skema, query, dan transaksi |
| JSON Web Token (`jsonwebtoken`) | 9.0 | Autentikasi Bearer token |
| bcryptjs | 3.0 | Hash password |
| cors | 2.8 | Pembatasan origin |
| Vercel Blob (`@vercel/blob`) | 2.9 | Penyimpanan foto |
| Google Gemini API | | Draft listing dari foto, dipanggil lewat REST |
| Postman dan Newman | | Pengujian endpoint |
| Vercel | | Hosting |

## Menjalankan di lokal

Butuh Node.js 24.

```bash
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
# isi .env
npm run dev               # http://localhost:3000/api/health
```

`MONGODB_URI` harus mengarah ke MongoDB Atlas atau replica set lain karena pesanan dan sengketa memakai transaksi. MongoDB lokal tanpa replica set tidak cukup.

## Variabel

| Variabel | Wajib | Keterangan |
|---|---|---|
| `MONGODB_URI` | ya | Connection string, sertakan nama database `/punya` |
| `JWT_SECRET` | ya | Acak dan panjang. Buat dengan `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | tidak | Default `7d` |
| `CORS_ORIGIN` | bila browser memanggil API langsung | Origin web, pisahkan dengan koma, tanpa garis miring di akhir. Frontend di Vercel meneruskan `/api` sehingga tidak memerlukannya |
| `BLOB_READ_WRITE_TOKEN` | untuk unggah foto | Dibuat otomatis saat store Vercel Blob (public) dihubungkan ke project. Untuk lokal: `npx vercel env pull .env.local`, lalu salin barisnya ke `.env` |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | untuk draft AI | Kalau salah satu kosong, endpoint AI menjawab 500 |
| `PORT` | tidak | Hanya untuk lokal, default `3000` |

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server dengan reload otomatis |
| `npm run seed` | Menambah 4 listing contoh, aman diulang |
| `npm run make-admin -- 081234567890` | Menjadikan akun terdaftar sebagai admin |

## Struktur

```
ProjectPawIIBackend/
  postman/          koleksi Postman
  scripts/          seed.js, make-admin.js
  src/
    app.js          aplikasi Express, CORS, dan pemasangan rute
    home.js         halaman utama (GET /) berisi daftar endpoint
    server.js       server untuk lokal
    config/         koneksi database
    controllers/    logika tiap endpoint
    middleware/     autentikasi dan penanganan error
    models/         skema Mongoose
    routes/         definisi rute
    utils/          konstanta, respons HTTP, status pesanan, Gemini
```

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
| POST | `/api/uploads` | token |

Contoh body request ada di koleksi Postman. Selain endpoint di atas, `GET /` menampilkan halaman HTML berisi daftar endpoint.

## Format request dan response

- Response sukses: `{ "success": true, "data": ... }`. Response gagal: `{ "success": false, "message": "...", "errors": [] }`.
- Login: `{ "identifier": "<nomor HP atau email>", "password": "..." }`.
- Daftar berpaginasi mengembalikan `{ items, page, limit, total }`.
- Filter `GET /api/listings`: `q`, `type`, `category`, `district`, `minPrice`, `maxPrice`, `page`, `limit`.
- Filter `GET /api/orders`: `role` (`buyer` atau `seller`) dan `status`.
- Filter `GET /api/disputes`: `status` (`OPEN` atau `RESOLVED`).
- Pesan baru diambil dengan `GET /api/conversations/:id/messages?after=<waktu ISO 8601>`.
- Draft AI: `{ "imageBase64": "<tanpa awalan data:>", "mimeType": "image/jpeg", "note": "opsional" }`, foto maksimal 3 MB.

## Unggah foto

`/api/uploads` dipakai oleh `upload()` dari `@vercel/blob/client`. Responsnya izin sekali pakai (tanpa amplop `success`) untuk satu file JPEG maksimal 3 MB di `listings/<id pengguna>/`, `avatars/<id pengguna>/`, atau `evidence/<id pengguna>/` (bukti sengketa). Izin berlaku 5 menit, dan file dikirim langsung dari browser ke Vercel Blob.

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
2. Isi variabel koleksi `baseUrl` (default `http://localhost:3000`). Untuk production, isi URL Vercel.
3. Untuk putusan sengketa, daftarkan satu akun, jalankan `npm run make-admin`, lalu isi `adminPhone` dan `adminPassword`. Kalau kosong, request admin dan yang bergantung padanya dilewati.
4. Folder unggah foto membutuhkan `BLOB_READ_WRITE_TOKEN` di backend yang diuji. Yang diuji hanya izin unggah, tidak ada file yang dikirim.
5. Draft AI dari foto dilewati. Isi variabel `runAiDraft` bila `GEMINI_API_KEY` sudah terpasang.
6. Jalankan seluruh koleksi lewat Collection Runner sesuai urutan, karena request memakai ID dan token dari request sebelumnya.

Setiap kali dijalankan, akun, pesanan, sengketa, circle, dan chat uji baru masuk ke database. Listing uji dinonaktifkan di akhir. Password akun uji dibuat acak. Jangan commit koleksi yang sudah berisi `adminPassword`.

## Deploy ke Vercel

Database memakai MongoDB Atlas (`punya`), fungsi Vercel berjalan di region Singapura (`sin1`), dan production di-deploy dari branch `main`.

1. Di Atlas, buat cluster (region Singapura) dan user database `readWrite` untuk `punya`, lalu izinkan `0.0.0.0/0` pada IP Access List.
2. Di Vercel, import repository. `src/app.js` terdeteksi sebagai aplikasi Express.
3. Di tab **Storage**, buat store Blob dengan akses public dan hubungkan ke project. `BLOB_READ_WRITE_TOKEN` ditambahkan otomatis.
4. Isi environment variable lain di dashboard Vercel (semua variabel di atas kecuali `PORT`). Nilai diisi tanpa awalan `NAMA=` dan tanpa tanda kutip.
5. Di **Settings > Functions > Function Region**, pilih Singapura (`sin1`).
6. Redeploy setiap kali environment variable atau region diubah.
7. Buka `/api/health`, lalu jalankan koleksi Postman dengan `baseUrl` berisi URL Vercel (tanpa garis miring di akhir).

Kalau `/api/health` menjawab 500, lihat tab **Logs** di Vercel. `MongoParseError` berarti format `MONGODB_URI` salah.

## Hasil pengujian

Koleksi Postman dijalankan dengan Newman pada 27 November 2026:

| Target | Request | Assertion | Gagal |
|---|---|---|---|
| Lokal dengan Atlas (`punya_test`) | 82 | 93 | 0 |
| Production | 82 | 93 | 0 |

- Putusan sengketa `REFUND` dan `RELEASE` keduanya diuji.
- Draft AI dari foto dilewati karena `GEMINI_API_KEY` belum diisi.

Lewat aplikasi web, putusan sengketa, unggah foto, dan foto bukti sengketa juga sudah dicoba.

## Keterbatasan

- Login, register, kode undangan, draft AI, dan unggah foto belum dibatasi jumlah percobaannya, sehingga satu akun bisa menghabiskan kuota Gemini atau Blob. Pembatasan perlu firewall Vercel atau penyimpanan bersama, karena penghitung di memori tidak berlaku antar-instance.
- Foto di Vercel Blob tidak ikut terhapus saat listing atau foto profil diubah.
- Polling chat dengan `after` bisa melewatkan pesan yang tersimpan hampir bersamaan. Client sebaiknya mengambil ulang dengan rentang yang sedikit tumpang-tindih, lalu membuang duplikat berdasarkan `_id`.
- Logout tidak membatalkan token. Token berlaku sampai kedaluwarsa.
- Chat memakai polling, belum Socket.IO.
- Pencarian memakai regex tanpa index.
