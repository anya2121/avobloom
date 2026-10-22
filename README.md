# 🥑 Avobloom

Website toko online untuk barang preloved (pakaian, skincare, dan barang lainnya), lengkap dengan halaman pembeli dan halaman admin. Dibangun sendiri dari desain sampai deploy.

🔗 **Live demo:** [avobloom.vercel.app](https://avobloom.vercel.app/)

<!-- Tambahkan screenshot di sini, misalnya:
![Beranda](docs/beranda.png)
![Checkout](docs/checkout.png)
![Admin](docs/admin.png)
-->

## Fitur

**Halaman pembeli**
- Katalog produk dengan filter kategori dan detail produk multi-foto
- Keranjang belanja
- Checkout dengan ongkir otomatis berdasarkan provinsi tujuan dan berat paket
- Pembayaran QRIS dan konfirmasi pesanan via WhatsApp
- Cek status pesanan menggunakan kode pesanan
- Form ulasan dan testimoni pembeli

**Halaman admin** (`/admin`)
- Login khusus admin
- Kelola produk dan upload banyak foto
- Kelola pesanan: ubah status, isi nomor resi, dan tombol WhatsApp siap pakai untuk menghubungi pembeli
- Atur tarif ongkir per provinsi
- Atur nomor WhatsApp toko dan gambar QRIS
- Moderasi ulasan pembeli

## Teknologi

| Bagian | Teknologi |
|---|---|
| Front-end | Next.js 15 (App Router), React 19, TypeScript |
| Back-end & database | Supabase (PostgreSQL, Auth, Storage, RPC function) |
| Deployment | Vercel |
| Desain | Figma |

## Keamanan

- **Harga, stok, dan ongkir dihitung ulang di database** melalui fungsi `create_order` saat checkout, sehingga tidak bisa dimanipulasi dari browser.
- **Row Level Security (RLS)** di setiap tabel: data pesanan seperti alamat dan nomor HP pembeli hanya bisa dibaca admin, sedangkan pembeli hanya bisa melihat pesanannya sendiri lewat kode pesanan.
- Stok otomatis berkurang saat pesanan dibuat dan kembali saat pesanan dibatalkan.
- Kunci Supabase disimpan sebagai environment variable, tidak ditulis di kode.

## Struktur Folder

```
src/
├── app/
│   ├── (shop)/        # halaman pembeli: beranda, checkout, cek pesanan
│   └── admin/         # halaman dan login admin
├── components/        # komponen UI (keranjang, kartu produk, tab admin, dll.)
└── lib/               # koneksi Supabase, API, keranjang, helper format
supabase/
└── schema.sql         # tabel, RLS policy, dan fungsi database
```

## Menjalankan di Lokal

Buat file `.env.local` di folder utama:

```
NEXT_PUBLIC_SUPABASE_URL=isi_project_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_key_supabase
```

Lalu jalankan:

```bash
npm install
npm run dev    # buka http://localhost:3000
```

Database disiapkan dengan menjalankan `supabase/schema.sql` di SQL Editor Supabase.
