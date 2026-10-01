"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/lib/useSettings";

export default function Header() {
  const { count, setOpen } = useCart();
  const s = useSettings();
  const msgs = [
    s.announcement || "preloved with love",
    "bayar pakai QRIS",
    s.shipping_info || "ongkir otomatis sesuai provinsi",
    "konfirmasi pesanan via WhatsApp",
    "barang dicek & dikemas rapi",
  ];

  return (
    <>
      <div className="strip" aria-label="Info toko">
        <div className="strip-track">
          {[...msgs, ...msgs].map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>
      <header className="site-header">
        <div className="container header-row">
          <Link href="/" className="brand" aria-label="Avobloom beranda">
            <img src="/logo.png" alt="" />
            <span className="brand-word">
              avobloom
              <small>preloved ✿ with love</small>
            </span>
          </Link>
          <nav className="nav" aria-label="Menu utama">
            <Link href="/">
              <span className="ico">🏠</span>home
            </Link>
            <Link href="/#katalog">
              <span className="ico">🛍️</span>katalog
            </Link>
            <Link href="/#cara-beli">
              <span className="ico">📖</span>cara beli
            </Link>
            <Link href="/pesanan">
              <span className="ico">📦</span>cek pesanan
            </Link>
            <button type="button" onClick={() => setOpen(true)}>
              <span className="ico">🧺</span>keranjang
              {count > 0 && <span className="badge">{count}</span>}
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
