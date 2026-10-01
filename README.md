# 🥑 Avobloom — toko preloved

Website jualan preloved (barang, skincare, pakaian) dengan:

- **Halaman pembeli** — katalog + filter kategori, detail produk multi-foto, keranjang, checkout isi alamat, ongkir otomatis per provinsi, bayar QRIS, konfirmasi via WhatsApp, cek status pesanan pakai kode.
- **Halaman admin** (`/admin`) — kelola produk (upload banyak foto), kelola pesanan (ubah status, isi resi, tombol WA ke pembeli), atur tarif ongkir per provinsi, ganti nomor WA & gambar QRIS.

Teknologi: Next.js + Supabase (database, login admin, penyimpanan foto) + Vercel. Sama kayak project Fontes.

---

## Cara pasang (±15 menit)

### 1. Bikin project Supabase baru
1. Buka [supabase.com](https://supabase.com) → **New project** (nama bebas, mis. `avobloom`). Simpan password database-nya.
2. Tunggu sampai project siap.

### 2. Jalankan schema database
1. Buka file `supabase/schema.sql`, **ganti** `GANTI_DENGAN_EMAIL_ADMIN@gmail.com` dengan email yang mau kamu pakai buat login admin.
2. Di Supabase: **SQL Editor → New query** → paste seluruh isi `schema.sql` → **Run**.
   Ini bikin tabel produk, pesanan, ongkir (sudah terisi 38 provinsi contoh), pengaturan, dan tempat simpan foto.

### 3. Bikin akun admin
1. Supabase → **Authentication → Users → Add user → Create new user**.
2. Isi email (yang sama dengan langkah 2) + password, centang **Auto Confirm User**.
3. Supaya orang lain nggak bisa daftar: **Authentication → Sign In / Providers → Email** → matikan **Allow new users to sign up**.

> Lupa ganti email di langkah 2? Jalankan di SQL Editor:
> `insert into admins (email) values ('emailkamu@gmail.com');`

### 4. Upload kode ke GitHub
1. Bikin repo baru di GitHub (mis. `avobloom`).
2. Klik **uploading an existing file**, drag **isi** folder ini (bukan folder luarnya). Folder `node_modules` dan `.next` jangan ikut (di zip memang sudah nggak ada).
3. **Commit changes**.

### 5. Deploy di Vercel
1. [vercel.com](https://vercel.com) → **Add New → Project** → pilih repo `avobloom` → **Import**.
2. Buka **Environment Variables**, tambahkan dua ini (ambil dari Supabase → **Project Settings → API**):
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
3. **Deploy**. Selesai! Web kamu ada di `avobloom.vercel.app` (atau nama lain yang dikasih Vercel).

> Kalau env variable lupa diisi, web tetap jalan dalam **mode demo** (produk contoh). Isi env-nya lalu **Redeploy**.

### 6. Atur toko dari admin
Buka `/admin` → login, lalu:
1. **⚙️ Pengaturan** → isi **nomor WhatsApp** kamu (wajib, pesanan dikirim ke sini). Ganti gambar QRIS kalau perlu.
2. **🚚 Ongkir** → sesuaikan tarif per kg tiap provinsi (lihat di bawah).
3. **🛍️ Produk** → tambah produk + foto.

---

## Soal ongkir

Ongkir dihitung otomatis: **tarif per kg provinsi tujuan × berat paket** (dibulatkan ke atas, minimal 1 kg) — sama seperti cara kurir menghitung.

- Berat paket = jumlah **berat kirim** semua produk di keranjang, jadi isi berat tiap produk (termasuk kira-kira berat packing).
- Tarif bawaan = **perkiraan J&T EZ dari Purwomartani, Sleman**. Cocokkan dulu: buka Cek Tarif di aplikasi/web J&T, asal **Kalasan, Sleman**, berat **1 kg**, tujuan ibu kota tiap provinsi, lalu ubah di tab Ongkir kalau beda. Ada tombol "naikkan/turunkan semua x%" biar cepat.
- Sudah terlanjur menjalankan `schema.sql` versi lama? Jalankan `supabase/update-tarif-jnt.sql` di SQL Editor untuk ganti tarifnya ke versi J&T.
- Teks "Dikirim via J&T…" yang tampil di checkout bisa diubah di admin → Pengaturan.
- Karena tarifnya per provinsi, ongkir ke kota yang jauh di provinsi besar bisa sedikit beda dari aslinya — pakai tarif yang sedikit di atas rata-rata biar aman.

## Alur pesanan

1. Pembeli checkout → pesanan tersimpan dengan status **Menunggu pembayaran**, stok produk langsung berkurang (barang "dikunci").
2. Pembeli scan QRIS, bayar sesuai total, klik **Konfirmasi via WhatsApp** → chat berisi detail pesanan + alamat otomatis terkirim ke WA kamu, pembeli lampirkan bukti bayar.
3. Kamu cek mutasi, lalu di admin ubah status → **Sudah dibayar** → **Dikemas** → **Dikirim** (isi kurir + resi) → **Selesai**. Ada tombol WA siap pakai untuk kabari pembeli.
4. Kalau pembeli nggak jadi bayar, ubah status ke **Dibatalkan** → stok otomatis balik.

Pembeli bisa cek status kapan saja di menu **cek pesanan** pakai kodenya.

## Keamanan singkat
- Harga, stok, dan ongkir dihitung ulang di database saat checkout, jadi nggak bisa diakali dari browser.
- Data pesanan (alamat & HP pembeli) hanya bisa dibaca admin; pembeli cuma bisa lihat pesanannya sendiri lewat kode.
- Jangan pernah upload file `.env.local` ke GitHub.

## Ganti tampilan
- Logo: `public/logo.png` (dan ikon tab: `src/app/icon.png`).
- QRIS bawaan: `public/qris.png` (bisa juga diganti dari admin).
- Warna & gaya: `src/app/globals.css` (variabel warna di paling atas).
- Teks beranda: `src/app/(shop)/Home.tsx`.

## Jalankan di laptop (opsional)
```bash
npm install
cp .env.example .env.local   # lalu isi
npm run dev                  # buka http://localhost:3000
```

