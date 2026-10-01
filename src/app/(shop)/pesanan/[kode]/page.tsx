"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Win from "@/components/Win";
import { getOrder } from "@/lib/api";
import { formatDate, orderMessage, rupiah, waLink } from "@/lib/format";
import { STATUS_LABEL, type Order, type OrderStatus } from "@/lib/types";
import { qrisSrc, useSettings } from "@/lib/useSettings";

const FLOW: OrderStatus[] = ["menunggu_pembayaran", "dibayar", "dikemas", "dikirim", "selesai"];

export default function OrderPage() {
  const { kode } = useParams<{ kode: string }>();
  const code = decodeURIComponent(kode || "").toUpperCase();
  const s = useSettings();
  const [o, setO] = useState<Order | null | undefined>(undefined);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getOrder(code).then(setO).catch((e) => setErr(e.message));
  }, [code]);

  if (err) return <Shell><div className="alert err">{err}</div></Shell>;
  if (o === undefined) return <Shell><div className="empty pixel" style={{ fontSize: 22 }}>loading… ▓▓▓░░░</div></Shell>;
  if (o === null)
    return (
      <Shell>
        <div className="empty">
          <div style={{ fontSize: 48 }}>🔍</div>
          Pesanan <b>{code}</b> nggak ketemu. Cek lagi kodenya ya.
          <br />
          <Link href="/pesanan" className="btn" style={{ marginTop: 12 }}>cari lagi</Link>
        </div>
      </Shell>
    );

  const waiting = o.status === "menunggu_pembayaran";
  const stepIdx = FLOW.indexOf(o.status);
  const msg = orderMessage({
    code: o.code,
    items: o.items,
    subtotal: o.subtotal,
    shipping_cost: o.shipping_cost,
    total: o.total,
    storeName: s.store_name,
    buyer: {
      name: o.buyer_name,
      phone: o.buyer_phone,
      address: o.address,
      district: o.district || "",
      city: o.city,
      province: o.province,
      postal_code: o.postal_code || "",
      note: o.note || "",
    },
    pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
  });

  return (
    <div className="container page">
      <div className="two-col">
        <Win title={`pesanan_${o.code}.txt`} icon="📦">
          <p className="small muted" style={{ margin: 0 }}>Kode pesanan</p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span className="code-tag">{o.code}</span>
            <button
              className="btn sm white"
              onClick={() => {
                navigator.clipboard?.writeText(o.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "✓ tersalin" : "salin"}
            </button>
          </div>
          <p className="small muted">Simpan kode ini buat cek status pesanan. Dibuat {formatDate(o.created_at)}.</p>

          <div className="timeline">
            {o.status === "dibatalkan" ? (
              <span className="cancel">✕ {STATUS_LABEL.dibatalkan}</span>
            ) : (
              FLOW.map((st, i) => (
                <span key={st} className={i <= stepIdx ? "on" : ""}>{STATUS_LABEL[st]}</span>
              ))
            )}
          </div>

          {o.tracking_number && (
            <div className="alert ok">
              🚚 Dikirim pakai <b>{o.courier || "kurir"}</b> — resi <b>{o.tracking_number}</b>
            </div>
          )}

          <h3 style={{ fontSize: 14, marginBottom: 4 }}>Isi pesanan</h3>
          {o.items.map((i) => (
            <div key={i.id} className="line-item" style={{ gridTemplateColumns: "48px 1fr auto" }}>
              {i.image ? <img className="mini" src={i.image} alt="" style={{ width: 48, height: 48 }} /> : <div className="mini" style={{ width: 48, height: 48 }}>🎀</div>}
              <span>{i.name} ×{i.qty}</span>
              <span>{rupiah(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="sum-row" style={{ marginTop: 8 }}><span>Subtotal</span><span>{rupiah(o.subtotal)}</span></div>
          <div className="sum-row"><span>Ongkir ke {o.province} ({Math.max(1, Math.ceil(o.total_weight / 1000))} kg)</span><span>{rupiah(o.shipping_cost)}</span></div>
          <div className="sum-row total"><span>Total</span><span>{rupiah(o.total)}</span></div>

          <h3 style={{ fontSize: 14, marginBottom: 4 }}>Dikirim ke</h3>
          <p className="small" style={{ margin: 0 }}>
            <b>{o.buyer_name}</b> · {o.buyer_phone}
            <br />
            {[o.address, o.district, o.city, o.province, o.postal_code].filter(Boolean).join(", ")}
            {o.note && (<><br /><i>Catatan: {o.note}</i></>)}
          </p>
        </Win>

        <div className="sticky">
          {waiting ? (
            <Win title="bayar_qris.exe" icon="💳" tone="green">
              <p className="small" style={{ margin: 0 }}>Total yang harus dibayar</p>
              <div className="amount-big">{rupiah(o.total)}</div>
              <div className="qris-box">
                <img src={qrisSrc(s)} alt="Kode QRIS pembayaran" />
              </div>
              <a className="btn white block sm" style={{ marginTop: 8 }} href={qrisSrc(s)} download="qris-avobloom.png">
                ⬇ simpan gambar QRIS
              </a>
              {s.payment_note && <div className="alert" style={{ marginTop: 12 }}>{s.payment_note}</div>}
              <ol className="small" style={{ paddingLeft: 18, margin: "0 0 12px" }}>
                <li>Buka e-wallet / m-banking, pilih scan QRIS (atau upload gambar QRIS).</li>
                <li>Masukkan nominal <b>{rupiah(o.total)}</b>.</li>
                <li>Screenshot bukti bayar, lalu klik tombol di bawah.</li>
              </ol>
              <a className="btn wa block" href={waLink(s.whatsapp, msg)} target="_blank" rel="noreferrer">
                💬 konfirmasi via WhatsApp
              </a>
            </Win>
          ) : (
            <Win title="status.exe" icon="💌" tone="sky">
              <div className="center">
                <div style={{ fontSize: 48 }}>{o.status === "dibatalkan" ? "🥲" : "🥑"}</div>
                <b>{STATUS_LABEL[o.status]}</b>
                <p className="small muted">
                  {o.status === "dibatalkan"
                    ? "Pesanan ini dibatalkan. Hubungi kami kalau ada pertanyaan."
                    : "Makasih udah belanja! Pesananmu lagi kami proses."}
                </p>
                <a
                  className="btn wa block"
                  href={waLink(s.whatsapp, `Halo ${s.store_name}! Aku mau tanya soal pesanan ${o.code} 🥑`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  💬 chat WhatsApp
                </a>
              </div>
            </Win>
          )}
        </div>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container page">
      <Win title="pesanan.exe" icon="📦">{children}</Win>
    </div>
  );
}
