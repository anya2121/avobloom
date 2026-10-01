-- ============================================================
--  Jalankan file ini HANYA kalau schema.sql sudah pernah kamu run
--  sebelumnya. Isinya: ganti tarif ongkir ke perkiraan J&T EZ dari
--  Purwomartani (Sleman) + tambah info pengiriman.
--  ⚠️ Tarif yang sudah kamu edit di admin akan ditimpa.
-- ============================================================

alter table public.settings add column if not exists shipping_info text
  default 'Dikirim via J&T Express (EZ) dari Purwomartani, Sleman';
update public.settings
  set shipping_info = 'Dikirim via J&T Express (EZ) dari Purwomartani, Sleman'
  where id = 1 and shipping_info is null;

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
on conflict (province) do update
  set rate_per_kg = excluded.rate_per_kg,
      eta = excluded.eta,
      sort_order = excluded.sort_order;
