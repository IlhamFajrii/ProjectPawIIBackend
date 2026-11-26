// Halaman awal (GET /). Semua isinya statis, jadi tidak perlu escape.
const title = 'Uji endpoint yang bisa dilakukan oleh Kelompok 2';

const members = [
  ['Jonathan Immanuel Alexander', '2428240080', 'Ketua'],
  ['Kgs. Muhammad Alialjan', '2428240140'],
  ['Kurniawan', '2428240159'],
  ['M Ilham Fajri', '2428240082'],
  ['Athallah Zaki Cleon Alam', '2428240045'],
];

const endpoints = [
  ['GET', '/api/health', 'publik'],
  ['POST', '/api/auth/register', 'publik'],
  ['POST', '/api/auth/login', 'publik'],
  ['GET', '/api/auth/me', 'token'],
  ['PUT', '/api/users/me', 'token'],
  ['GET', '/api/users/:id', 'publik'],
  ['GET', '/api/listings', 'publik'],
  ['GET', '/api/listings/mine', 'token'],
  ['GET', '/api/listings/:id', 'publik'],
  ['POST', '/api/listings', 'token'],
  ['PUT', '/api/listings/:id', 'pemilik'],
  ['DELETE', '/api/listings/:id', 'pemilik'],
  ['POST', '/api/orders', 'token'],
  ['GET', '/api/orders', 'token'],
  ['GET', '/api/orders/:id', 'pembeli atau penjual'],
  ['POST', '/api/orders/:id/pay', 'pembeli'],
  ['POST', '/api/orders/:id/process', 'penjual'],
  ['POST', '/api/orders/:id/deliver', 'penjual'],
  ['POST', '/api/orders/:id/confirm', 'pembeli'],
  ['POST', '/api/orders/:id/cancel', 'pembeli atau penjual'],
  ['POST', '/api/orders/:id/dispute', 'pembeli atau penjual'],
  ['GET', '/api/disputes', 'token (admin melihat semua)'],
  ['GET', '/api/disputes/:id', 'peserta atau admin'],
  ['PUT', '/api/disputes/:id/resolve', 'admin'],
  ['POST', '/api/circles', 'token'],
  ['GET', '/api/circles/mine', 'token'],
  ['POST', '/api/circles/join', 'token'],
  ['GET', '/api/circles/:id', 'anggota'],
  ['DELETE', '/api/circles/:id/members/me', 'anggota'],
  ['POST', '/api/circles/:id/vouches', 'anggota'],
  ['DELETE', '/api/circles/:id/vouches/:userId', 'anggota'],
  ['POST', '/api/conversations', 'token'],
  ['GET', '/api/conversations', 'token'],
  ['GET', '/api/conversations/:id/messages', 'peserta'],
  ['POST', '/api/conversations/:id/messages', 'peserta'],
  ['POST', '/api/ai/draft-listing', 'token'],
  ['POST', '/api/uploads', 'token'],
];

// Hanya GET publik tanpa parameter yang bisa dicoba langsung dari browser.
const path = ([method, url, access]) =>
  method === 'GET' && access === 'publik' && !url.includes(':')
    ? `<a href="${url}"><code>${url}</code></a>`
    : `<code>${url}</code>`;

export default `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${title}</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 1rem/1.5 system-ui, sans-serif; max-width: 45rem; margin: 0 auto; padding: 2rem 1rem; }
  h1 { line-height: 1.2; text-wrap: balance; }
  h2 { margin-top: 2rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; vertical-align: top; padding: .4rem .5rem .4rem 0; border-bottom: 1px solid color-mix(in srgb, currentColor 20%, transparent); }
  code { overflow-wrap: anywhere; font-size: .85rem; }
</style>
</head>
<body>
<main>
<h1>${title}</h1>

<h2>Anggota</h2>
<ol>
${members.map(([name, nim, role]) => `<li>${name} (${nim})${role ? ` &ndash; ${role}` : ''}</li>`).join('\n')}
</ol>

<h2 id="endpoint">Daftar endpoint</h2>
<p>Endpoint bertautan bisa dibuka langsung di browser. Sisanya diuji lewat Postman. Akses selain publik memerlukan header <code>Authorization: Bearer &lt;token&gt;</code>.</p>
<p><code>/api/health</code> dipakai untuk mengecek apakah server terhubung ke database. Kalau terhubung, statusnya 200 dan respons berisi <code>"database": "connected"</code>. Kalau tidak, statusnya 500 dengan pesan "Database tidak terhubung".</p>
<table aria-labelledby="endpoint">
<thead><tr><th scope="col">Method</th><th scope="col">URL</th><th scope="col">Akses</th></tr></thead>
<tbody>
${endpoints.map((e) => `<tr><td>${e[0]}</td><td>${path(e)}</td><td>${e[2]}</td></tr>`).join('\n')}
</tbody>
</table>
</main>
</body>
</html>
`;
