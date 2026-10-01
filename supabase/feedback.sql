-- ============================================================
--  AVOBLOOM — fitur ULASAN PEMBELI
--  Jalankan file ini di Supabase → SQL Editor → New query → Run.
--  Aman di-run ulang. (Isi file ini juga sudah ada di schema.sql,
--  jadi kalau kamu setup dari awal pakai schema.sql, nggak perlu lagi.)
-- ============================================================

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  order_code text not null,
  display_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  items text,                          -- ringkasan nama barang yang dibeli
  is_published boolean not null default false,  -- tampil di web setelah disetujui admin
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;

drop policy if exists "feedback: public read published" on public.feedback;
create policy "feedback: public read published" on public.feedback
  for select using (is_published or public.is_admin());

drop policy if exists "feedback: admin all" on public.feedback;
create policy "feedback: admin all" on public.feedback
  for all using (public.is_admin()) with check (public.is_admin());

-- Pembeli kirim ulasan pakai kode pesanannya.
-- Hanya pesanan yang sudah DIKIRIM / SELESAI, dan cuma 1x per pesanan.
create or replace function public.submit_feedback(
  p_code text, p_rating integer, p_comment text, p_name text
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  o public.orders%rowtype;
  v_name text;
begin
  select * into o from public.orders where code = upper(trim(p_code));
  if not found then
    raise exception 'Pesanan tidak ditemukan';
  end if;
  if o.status not in ('dikirim', 'selesai') then
    raise exception 'Ulasan bisa dikirim setelah pesanan dikirim ya';
  end if;
  if exists (select 1 from public.feedback where order_id = o.id) then
    raise exception 'Kamu sudah kasih ulasan untuk pesanan ini, makasih! 💕';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Pilih bintang 1 sampai 5';
  end if;
  if length(trim(coalesce(p_comment, ''))) < 3 then
    raise exception 'Tulis ulasannya sedikit lagi ya';
  end if;

  v_name := left(trim(coalesce(nullif(trim(p_name), ''), split_part(o.buyer_name, ' ', 1))), 40);

  insert into public.feedback (order_id, order_code, display_name, rating, comment, items)
  values (
    o.id, o.code, v_name, p_rating, left(trim(p_comment), 1000),
    (select string_agg(x ->> 'name', ', ') from jsonb_array_elements(o.items) x)
  );
end;
$$;

-- get_order sekarang juga memberi tahu apakah pesanan sudah diulas
create or replace function public.get_order(p_code text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select (to_jsonb(o) - 'id')
         || jsonb_build_object('has_feedback', exists (select 1 from public.feedback f where f.order_id = o.id))
  from public.orders o
  where o.code = upper(trim(p_code));
$$;

grant execute on function public.submit_feedback(text, integer, text, text) to anon, authenticated;
grant execute on function public.get_order(text) to anon, authenticated;
