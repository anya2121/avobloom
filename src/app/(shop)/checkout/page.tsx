"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Win from "@/components/Win";
import { useCart } from "@/lib/cart";
import { createOrder, fetchZones } from "@/lib/api";
import { kg, rupiah, shippingCost } from "@/lib/format";
import type { Buyer, Zone } from "@/lib/types";
import { useSettings } from "@/lib/useSettings";

const EMPTY: Buyer = { name: "", phone: "", address: "", province: "", city: "", district: "", postal_code: "", note: "" };
const SAVED = "avobloom-buyer";

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const settings = useSettings();
  const [zones, setZones] = useState<Zone[]>([]);
  const [b, setB] = useState<Buyer>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchZones().then(setZones).catch((e) => setErr(e.message));
    try {
      const raw = localStorage.getItem(SAVED);
      if (raw) setB({ ...EMPTY, ...JSON.parse(raw), note: "" });
    } catch {}
  }, []);

  const zone = useMemo(() => zones.find((z) => z.province === b.province), [zones, b.province]);
  const ongkir = zone ? shippingCost(zone.rate_per_kg, cart.weight) : 0;
  const total = cart.subtotal + ongkir;
  const set = (k: keyof Buyer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setB({ ...b, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!zone) return setErr("Pilih provinsi tujuan dulu ya.");
    if (b.phone.replace(/\D/g, "").length < 9) return setErr("Nomor WhatsApp kayaknya belum benar.");
    if (b.address.trim().length < 10) return setErr("Alamat lengkapnya ditulis lebih detail ya (jalan, nomor rumah, RT/RW).");
    setBusy(true);
    try {
      const code = await createOrder(cart.items.map((i) => ({ id: i.id, qty: i.qty })), b);
      try {
        const { note: _n, ...keep } = b;
        localStorage.setItem(SAVED, JSON.stringify(keep));
        localStorage.setItem("avobloom-last-order", code);
      } catch {}
      cart.clear();
      router.push(`/pesanan/${code}`);
    } catch (e) {
      setErr((e as Error).message || "Gagal membuat pesanan, coba lagi.");
      setBusy(false);
    }
  }

  if (cart.items.length === 0 && !busy) {
    return (
      <div className="container page">
        <Win title="checkout.exe" icon="🧾">
          <div className="empty">
            <div style={{ fontSize: 48 }}>🧺</div>
            Keranjangmu kosong.
            <br />
            <Link href="/#katalog" className="btn" style={{ marginTop: 12 }}>pilih barang dulu</Link>
          </div>
        </Win>
      </div>
    );
  }

  return (
    <div className="container page">
      <form className="two-col" onSubmit={submit}>
        <Win title="alamat_pengiriman.txt" icon="📮">
          <h2 className="section-title" style={{ fontSize: 26 }}>checkout</h2>
          <p className="small muted" style={{ marginTop: 0 }}>Isi data penerima. Data ini dipakai buat label paket.</p>
          <div className="row2">
            <div className="field">
              <label htmlFor="name">Nama penerima *</label>
              <input id="name" className="input" required value={b.name} onChange={set("name")} autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="phone">No. WhatsApp *</label>
              <input id="phone" className="input" required inputMode="tel" placeholder="08xxxxxxxxxx" value={b.phone} onChange={set("phone")} autoComplete="tel" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="address">Alamat lengkap *</label>
            <textarea id="address" className="textarea" required placeholder="Nama jalan, nomor rumah, RT/RW, patokan" value={b.address} onChange={set("address")} autoComplete="street-address" />
          </div>
          <div className="row2">
            <div className="field">
              <label htmlFor="province">Provinsi *</label>
              <select id="province" className="select" required value={b.province} onChange={set("province")}>
                <option value="">— pilih provinsi —</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.province}>{z.province}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Kota / kabupaten *</label>
              <input id="city" className="input" required value={b.city} onChange={set("city")} autoComplete="address-level2" />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label htmlFor="district">Kecamatan</label>
              <input id="district" className="input" value={b.district} onChange={set("district")} />
            </div>
            <div className="field">
              <label htmlFor="postal">Kode pos</label>
              <input id="postal" className="input" inputMode="numeric" value={b.postal_code} onChange={set("postal_code")} autoComplete="postal-code" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="note">Catatan (opsional)</label>
            <input id="note" className="input" placeholder="mis. titip ke satpam, request bubble wrap tebal" value={b.note} onChange={set("note")} />
          </div>
        </Win>

        <div className="sticky">
          <Win title="ringkasan.exe" icon="🧾" tone="green">
            {cart.items.map((i) => (
              <div key={i.id} className="sum-row">
                <span>{i.name} ×{i.qty}</span>
                <span>{rupiah(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="sum-row" style={{ borderTop: "1px dashed rgba(63,42,54,.3)", marginTop: 6, paddingTop: 8 }}>
              <span>Subtotal</span>
              <span>{rupiah(cart.subtotal)}</span>
            </div>
            <div className="sum-row">
              <span>
                Ongkir {zone ? `(${kg(cart.weight)} kg × ${rupiah(zone.rate_per_kg)})` : ""}
              </span>
              <span>{zone ? rupiah(ongkir) : "pilih provinsi"}</span>
            </div>
            {settings.shipping_info && <div className="small muted">🚚 {settings.shipping_info}</div>}
            {zone?.eta && <div className="small muted">Estimasi sampai {zone.eta}</div>}
            <div className="sum-row total">
              <span>Total bayar</span>
              <span>{rupiah(total)}</span>
            </div>
            {err && <div className="alert err" style={{ marginTop: 10 }}>{err}</div>}
            <button className="btn green block" style={{ marginTop: 12 }} disabled={busy || !zone}>
              {busy ? "memproses…" : "buat pesanan & bayar QRIS →"}
            </button>
            <p className="small muted" style={{ marginBottom: 0 }}>
              Setelah ini kamu dapat kode pesanan + QRIS. Barang dikunci buat kamu, lalu konfirmasi via WhatsApp.
            </p>
          </Win>
        </div>
      </form>
    </div>
  );
}
