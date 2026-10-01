-- ============================================================
--  AVOBLOOM — schema database Supabase
--  Cara pakai: Supabase → SQL Editor → New query → paste SEMUA
--  isi file ini → Run. Aman di-run ulang.
--
--  ⚠️ PENTING: ganti email di bagian "1. ADMIN" di bawah dengan
--  email akun admin kamu (yang nanti dibuat di Authentication).
-- ============================================================

-- ---------- 1. ADMIN ----------
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;

-- 👇 GANTI dengan email admin kamu
insert into public.admins (email) values ('GANTI_DENGAN_EMAIL_ADMIN@gmail.com')
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- 2. PRODUK ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('barang', 'skincare', 'pakaian')),
  brand text,
  price integer not null check (price >= 0),
  original_price integer check (original_price is null or original_price >= 0),
  condition text,          -- contoh: "Like new", "Sisa 80%", "Dipakai 2x"
  size text,               -- contoh: "M", "30ml", "Lingkar dada 90cm"
  description text,
  images text[] not null default '{}',
  weight_grams integer not null default 500 check (weight_grams > 0),
  stock integer not null default 1 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;

drop policy if exists "products: public read" on public.products;
create policy "products: public read" on public.products
  for select using (is_active or public.is_admin());

drop policy if exists "products: admin write" on public.products;
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 3. ONGKIR PER WILAYAH ----------
create table if not exists public.shipping_zones (
  id serial primary key,
  province text not null unique,
  rate_per_kg integer not null default 0 check (rate_per_kg >= 0),
  eta text,                -- contoh: "2-3 hari"
  sort_order integer not null default 0
);
alter table public.shipping_zones enable row level security;

drop policy if exists "zones: public read" on public.shipping_zones;
create policy "zones: public read" on public.shipping_zones for select using (true);

drop policy if exists "zones: admin write" on public.shipping_zones;
create policy "zones: admin write" on public.shipping_zones
  for all using (public.is_admin()) with check (public.is_admin());

-- Tarif per kg = PERKIRAAN J&T EZ (reguler) dari Purwomartani, Sleman.
-- Cocokkan dengan aplikasi J&T, lalu ubah di halaman admin → Ongkir.
insert into public.shipping_zones (province, rate_per_kg, eta, sort_order) values
  ('DI Yogyakarta', 8000, '1-2 hari', 1),
  ('Jawa Tengah', 10000, '1-3 hari', 2),
  ('Jawa Timur', 12000, '2-3 hari', 3),
  ('Jawa Barat', 13000, '2-3 hari', 4),
  ('DKI Jakarta', 14000, '2-3 hari', 5),
  ('Banten', 15000, '2-4 hari', 6),
  ('Bali', 19000, '2-4 hari', 7),
  ('Nusa Tenggara Barat', 26000, '3-5 hari', 8),
  ('Nusa Tenggara Timur', 38000, '4-7 hari', 9),
  ('Lampung', 21000, '3-4 hari', 10),
  ('Sumatera Selatan', 25000, '3-5 hari', 11),
  ('Bengkulu', 28000, '3-5 hari', 12),
  ('Jambi', 27000, '3-5 hari', 13),
  ('Kepulauan Bangka Belitung', 29000, '3-6 hari', 14),
  ('Riau', 30000, '3-5 hari', 15),
  ('Sumatera Barat', 30000, '3-5 hari', 16),
  ('Kepulauan Riau', 33000, '3-6 hari', 17),
  ('Sumatera Utara', 33000, '3-6 hari', 18),
  ('Aceh', 39000, '4-7 hari', 19),
  ('Kalimantan Barat', 33000, '3-6 hari', 20),
  ('Kalimantan Tengah', 37000, '3-6 hari', 21),
  ('Kalimantan Selatan', 33000, '3-5 hari', 22),
  ('Kalimantan Timur', 38000, '3-6 hari', 23),
  ('Kalimantan Utara', 48000, '4-8 hari', 24),
  ('Sulawesi Selatan', 36000, '3-6 hari', 25),
  ('Sulawesi Barat', 42000, '4-7 hari', 26),
  ('Sulawesi Tenggara', 44000, '4-7 hari', 27),
  ('Sulawesi Tengah', 46000, '4-8 hari', 28),
  ('Gorontalo', 48000, '4-8 hari', 29),
  ('Sulawesi Utara', 48000, '4-8 hari', 30),
  ('Maluku', 60000, '5-9 hari', 31),
  ('Maluku Utara', 62000, '5-9 hari', 32),
  ('Papua Barat', 85000, '6-12 hari', 33),
  ('Papua Barat Daya', 85000, '6-12 hari', 34),
  ('Papua', 90000, '6-12 hari', 35),
  ('Papua Tengah', 100000, '7-14 hari', 36),
  ('Papua Selatan', 100000, '7-14 hari', 37),
  ('Papua Pegunungan', 120000, '7-14 hari', 38)
on conflict (province) do nothing;

-- ---------- 4. PENGATURAN TOKO ----------
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'Avobloom',
  whatsapp text not null default '6281234567890',
  qris_url text,                       -- kosong = pakai /qris.png bawaan
  payment_note text default 'Scan QRIS, masukkan nominal PERSIS sesuai total, lalu kirim bukti bayar lewat WhatsApp ya 🌸',
  announcement text default 'preloved with love 🥑 cek koleksi terbaru tiap minggu',
  shipping_info text default 'Dikirim via J&T Express (EZ) dari Purwomartani, Sleman',
  updated_at timestamptz not null default now()
);
alter table public.settings add column if not exists shipping_info text
  default 'Dikirim via J&T Express (EZ) dari Purwomartani, Sleman';
alter table public.settings enable row level security;
insert into public.settings (id) values (1) on conflict do nothing;

drop policy if exists "settings: public read" on public.settings;
create policy "settings: public read" on public.settings for select using (true);

drop policy if exists "settings: admin update" on public.settings;
create policy "settings: admin update" on public.settings
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------- 5. PESANAN ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  buyer_name text not null,
  buyer_phone text not null,
  address text not null,
  province text not null,
  city text not null,
  district text,
  postal_code text,
  note text,
  items jsonb not null,                -- snapshot: [{id,name,price,qty,image}]
  subtotal integer not null,
  total_weight integer not null,
  shipping_cost integer not null,
  total integer not null,
  status text not null default 'menunggu_pembayaran'
    check (status in ('menunggu_pembayaran','dibayar','dikemas','dikirim','selesai','dibatalkan')),
  courier text,
  tracking_number text,
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;

-- Pembeli TIDAK bisa baca/tulis tabel ini langsung — cuma lewat fungsi di bawah.
drop policy if exists "orders: admin all" on public.orders;
create policy "orders: admin all" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 6. FUNGSI: BUAT PESANAN ----------
-- Harga, stok dan ongkir dihitung DI SERVER, jadi pembeli
-- nggak bisa ngakalin harga dari browser.
create or replace function public.create_order(p_items jsonb, p_buyer jsonb)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  it jsonb;
  prod public.products%rowtype;
  qty integer;
  v_items jsonb := '[]'::jsonb;
  v_subtotal integer := 0;
  v_weight integer := 0;
  v_rate integer;
  v_shipping integer;
  v_code text;
  v_province text := trim(coalesce(p_buyer ->> 'province', ''));
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang masih kosong';
  end if;
  if jsonb_array_length(p_items) > 30 then
    raise exception 'Kebanyakan item dalam satu pesanan';
  end if;
  if length(trim(coalesce(p_buyer ->> 'name', ''))) < 2
     or length(regexp_replace(coalesce(p_buyer ->> 'phone', ''), '\D', '', 'g')) < 9
     or length(trim(coalesce(p_buyer ->> 'address', ''))) < 10
     or length(trim(coalesce(p_buyer ->> 'city', ''))) < 2 then
    raise exception 'Data pembeli belum lengkap';
  end if;

  select rate_per_kg into v_rate from public.shipping_zones where province = v_province;
  if v_rate is null then
    raise exception 'Provinsi tujuan belum tersedia';
  end if;

  for it in select * from jsonb_array_elements(p_items) loop
    qty := greatest(1, coalesce((it ->> 'qty')::integer, 1));
    select * into prod from public.products
      where id = (it ->> 'id')::uuid and is_active
      for update;
    if not found then
      raise exception 'Ada produk yang sudah tidak tersedia';
    end if;
    if prod.stock < qty then
      raise exception 'Yah, "%" sudah keburu dibeli orang lain 🥲', prod.name;
    end if;

    update public.products set stock = stock - qty where id = prod.id;

    v_subtotal := v_subtotal + prod.price * qty;
    v_weight := v_weight + prod.weight_grams * qty;
    v_items := v_items || jsonb_build_object(
      'id', prod.id, 'name', prod.name, 'price', prod.price, 'qty', qty,
      'image', coalesce(prod.images[1], '')
    );
  end loop;

  -- ongkir = tarif/kg × berat dibulatkan ke atas (min 1 kg), seperti kurir
  v_shipping := v_rate * greatest(1, ceil(v_weight / 1000.0)::integer);

  loop
    v_code := 'AVB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.orders where code = v_code);
  end loop;

  insert into public.orders (
    code, buyer_name, buyer_phone, address, province, city, district, postal_code, note,
    items, subtotal, total_weight, shipping_cost, total
  ) values (
    v_code,
    left(trim(p_buyer ->> 'name'), 100),
    left(trim(p_buyer ->> 'phone'), 20),
    left(trim(p_buyer ->> 'address'), 500),
    v_province,
    left(trim(p_buyer ->> 'city'), 100),
    left(trim(coalesce(p_buyer ->> 'district', '')), 100),
    left(trim(coalesce(p_buyer ->> 'postal_code', '')), 10),
    left(trim(coalesce(p_buyer ->> 'note', '')), 500),
    v_items, v_subtotal, v_weight, v_shipping, v_subtotal + v_shipping
  );

  return v_code;
end;
$$;

-- ---------- 7. FUNGSI: LIHAT PESANAN (pakai kode) ----------
create or replace function public.get_order(p_code text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select to_jsonb(o) - 'id'
  from public.orders o
  where o.code = upper(trim(p_code));
$$;

-- ---------- 8. FUNGSI ADMIN: UBAH STATUS ----------
-- Kalau dibatalkan, stok produk otomatis dikembalikan.
create or replace function public.admin_update_order(
  p_id uuid, p_status text, p_courier text, p_tracking text
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  o public.orders%rowtype;
  it jsonb;
begin
  if not public.is_admin() then
    raise exception 'Bukan admin';
  end if;
  select * into o from public.orders where id = p_id for update;
  if not found then raise exception 'Pesanan tidak ditemukan'; end if;
  if o.status = 'dibatalkan' and p_status <> 'dibatalkan' then
    raise exception 'Pesanan yang sudah dibatalkan tidak bisa diaktifkan lagi';
  end if;

  if p_status = 'dibatalkan' and o.status <> 'dibatalkan' then
    for it in select * from jsonb_array_elements(o.items) loop
      update public.products
        set stock = stock + coalesce((it ->> 'qty')::integer, 1)
        where id = (it ->> 'id')::uuid;
    end loop;
  end if;

  update public.orders
    set status = p_status,
        courier = nullif(trim(coalesce(p_courier, '')), ''),
        tracking_number = nullif(trim(coalesce(p_tracking, '')), '')
    where id = p_id;
end;
$$;

grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;
grant execute on function public.get_order(text) to anon, authenticated;
grant execute on function public.admin_update_order(uuid, text, text, text) to authenticated;

-- ---------- 9. STORAGE FOTO ----------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "images: public read" on storage.objects;
create policy "images: public read" on storage.objects
  for select using (bucket_id = 'images');

drop policy if exists "images: admin insert" on storage.objects;
create policy "images: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'images' and public.is_admin());

drop policy if exists "images: admin update" on storage.objects;
create policy "images: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'images' and public.is_admin());

drop policy if exists "images: admin delete" on storage.objects;
create policy "images: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'images' and public.is_admin());
