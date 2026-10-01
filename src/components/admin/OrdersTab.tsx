"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Win from "@/components/Win";
import { supabase } from "@/lib/supabase";
import { formatDate, rupiah, waLink } from "@/lib/format";
import { STATUS_LABEL, type Order, type OrderStatus } from "@/lib/types";
import { useSettings } from "@/lib/useSettings";

const STATUSES = Object.keys(STATUS_LABEL) as OrderStatus[];

export default function OrdersTab() {
  const [list, setList] = useState<Order[] | null>(null);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "aktif" | "semua">("aktif");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase().from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) setErr(error.message);
    else setList(data as Order[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const l = list || [];
    const paid = l.filter((o) => !["menunggu_pembayaran", "dibatalkan"].includes(o.status));
    return {
      waiting: l.filter((o) => o.status === "menunggu_pembayaran").length,
      toShip: l.filter((o) => o.status === "dibayar" || o.status === "dikemas").length,
      revenue: paid.reduce((s, o) => s + o.subtotal, 0),
      count: paid.length,
    };
  }, [list]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (list || []).filter((o) => {
      if (filter === "aktif" && ["selesai", "dibatalkan"].includes(o.status)) return false;
      if (filter !== "aktif" && filter !== "semua" && o.status !== filter) return false;
      if (t && !`${o.code} ${o.buyer_name} ${o.buyer_phone} ${o.city}`.toLowerCase().includes(t)) return false;
      return true;
    });
  }, [list, filter, q]);

  return (
    <>
      <div className="stats">
        <div className="win stat"><b>{stats.waiting}</b><span>menunggu pembayaran</span></div>
        <div className="win stat"><b>{stats.toShip}</b><span>perlu dikirim</span></div>
        <div className="win stat"><b>{stats.count}</b><span>pesanan terbayar</span></div>
        <div className="win stat"><b>{rupiah(stats.revenue)}</b><span>penjualan (tanpa ongkir)</span></div>
      </div>
      <div className="toolbar">
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="aktif">pesanan aktif</option>
          <option value="semua">semua pesanan</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <input className="input search" placeholder="cari kode, nama, no. HP, kota…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn sm white" onClick={load}>↻ refresh</button>
      </div>
      {err && <div className="alert err">{err}</div>}
      {!list ? (
        <p className="pixel" style={{ fontSize: 20 }}>loading…</p>
      ) : shown.length === 0 ? (
        <div className="empty">Belum ada pesanan di sini 🥑</div>
      ) : (
        shown.map((o) => <OrderCard key={o.id} o={o} onChanged={load} />)
      )}
    </>
  );
}

function OrderCard({ o, onChanged }: { o: Order; onChanged: () => void }) {
  const s = useSettings();
  const [status, setStatus] = useState<OrderStatus>(o.status);
  const initCourier = o.courier || "J&T";
  const [courier, setCourier] = useState(initCourier);
  const [resi, setResi] = useState(o.tracking_number || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const dirty = status !== o.status || courier !== initCourier || resi !== (o.tracking_number || "");
  const fullAddress = [o.address, o.district, o.city, o.province, o.postal_code].filter(Boolean).join(", ");

  async function save() {
    if (status === "dibatalkan" && o.status !== "dibatalkan" && !confirm("Batalkan pesanan ini? Stok produknya akan dikembalikan.")) return;
    setBusy(true);
    setMsg("");
    const { error } = await supabase().rpc("admin_update_order", {
      p_id: o.id,
      p_status: status,
      p_courier: courier,
      p_tracking: resi,
    });
    setBusy(false);
    if (error) return setMsg("❌ " + error.message);
    setMsg("✓ tersimpan");
    onChanged();
  }

  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/pesanan/${o.code}` : "";
  const templates: Record<string, string> = {
    paid: `Halo ${o.buyer_name}! 🌸 Pembayaran pesanan ${o.code} sebesar ${rupiah(o.total)} sudah kami terima. Pesanan segera dikemas ya. Makasih banyak udah belanja di ${s.store_name} 🥑\n\nCek status: ${pageUrl}`,
    shipped: `Halo ${o.buyer_name}! 📦 Pesanan ${o.code} sudah dikirim pakai ${courier || "kurir"}, nomor resi: ${resi || "-"}.\n\nCek status: ${pageUrl}\n\nSemoga suka ya! 🥑🌸`,
    remind: `Halo ${o.buyer_name}! 🌸 Pesanan ${o.code} (total ${rupiah(o.total)}) masih menunggu pembayaran ya. Link QRIS-nya di sini: ${pageUrl}\n\nKalau nggak jadi, kabarin aja biar barangnya bisa dilepas ke yang lain 🥑`,
  };

  return (
    <Win
      className="order-card"
      title={
        <>
          <b>{o.code}</b> · {formatDate(o.created_at)}
        </>
      }
      icon="📦"
      tone={o.status === "selesai" ? "green" : o.status === "dikirim" ? "sky" : "pink"}
    >
      <div className="order-grid">
        <div>
          <h5>
            {o.buyer_name} <span className={`pill ${o.status}`}>{STATUS_LABEL[o.status]}</span>
          </h5>
          <div>{o.buyer_phone}</div>
          <div style={{ margin: "4px 0" }}>{fullAddress}</div>
          {o.note && <div><i>📝 {o.note}</i></div>}
          <button
            className="link-btn"
            onClick={() => navigator.clipboard?.writeText(`${o.buyer_name}\n${o.buyer_phone}\n${fullAddress}`)}
          >
            salin alamat buat label
          </button>
        </div>
        <div>
          <h5>Isi pesanan</h5>
          {o.items.map((i) => (
            <div key={i.id}>• {i.name} ×{i.qty} — {rupiah(i.price * i.qty)}</div>
          ))}
          <div style={{ marginTop: 4 }}>Ongkir {o.province}: {rupiah(o.shipping_cost)} ({o.total_weight} g)</div>
          <div><b>Total: {rupiah(o.total)}</b></div>
        </div>
        <div>
          <h5>Update</h5>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} disabled={o.status === "dibatalkan"} style={{ marginBottom: 6 }}>
            {STATUSES.map((st) => (
              <option key={st} value={st}>{STATUS_LABEL[st]}</option>
            ))}
          </select>
          <div className="row2" style={{ gap: 6 }}>
            <input className="input" placeholder="kurir" list="kurir" value={courier} onChange={(e) => setCourier(e.target.value)} />
            <input className="input" placeholder="no. resi" value={resi} onChange={(e) => setResi(e.target.value)} />
          </div>
          <datalist id="kurir">
            {["J&T", "JNE", "SiCepat", "AnterAja", "Pos Indonesia", "Shopee Express", "Lion Parcel", "GoSend", "GrabExpress"].map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6, alignItems: "center" }}>
            <button className="btn sm green" onClick={save} disabled={!dirty || busy}>{busy ? "…" : "simpan"}</button>
            {msg && <span className="small">{msg}</span>}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {o.status === "menunggu_pembayaran" && (
              <a className="btn sm wa" target="_blank" rel="noreferrer" href={waLink(o.buyer_phone, templates.remind)}>💬 ingatkan bayar</a>
            )}
            {(o.status === "dibayar" || o.status === "dikemas") && (
              <a className="btn sm wa" target="_blank" rel="noreferrer" href={waLink(o.buyer_phone, templates.paid)}>💬 info lunas</a>
            )}
            {(o.status === "dikirim" || resi) && (
              <a className="btn sm wa" target="_blank" rel="noreferrer" href={waLink(o.buyer_phone, templates.shipped)}>💬 kirim resi</a>
            )}
            <a className="btn sm white" target="_blank" rel="noreferrer" href={waLink(o.buyer_phone, `Halo ${o.buyer_name}! `)}>chat</a>
          </div>
        </div>
      </div>
    </Win>
  );
}
