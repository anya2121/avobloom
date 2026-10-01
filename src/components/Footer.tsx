"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/lib/useSettings";
import { waLink } from "@/lib/format";
import { Heart } from "./Deco";

export default function Footer() {
  const s = useSettings();
  const { count, setOpen } = useCart();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div className="strip checker" aria-hidden />
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/logo.png" alt="" width={48} height={48} />
              <b style={{ fontSize: 18 }}>{s.store_name}</b>
              <Heart size={22} />
            </div>
            <p className="small muted" style={{ maxWidth: 280 }}>
              Barang kesayangan yang siap mekar lagi di tangan baru. Semua item dicek dan difoto apa adanya.
            </p>
          </div>
          <div>
            <h4>belanja</h4>
            <Link href="/#katalog">semua produk</Link>
            <Link href="/?k=barang#katalog">barang</Link>
            <Link href="/?k=skincare#katalog">skincare</Link>
            <Link href="/?k=pakaian#katalog">pakaian</Link>
          </div>
          <div>
            <h4>bantuan</h4>
            <Link href="/#cara-beli">cara beli</Link>
            <Link href="/pesanan">cek pesanan</Link>
            <a href={waLink(s.whatsapp, `Halo ${s.store_name}! Aku mau tanya-tanya dulu 🥑`)} target="_blank" rel="noreferrer">
              chat WhatsApp
            </a>
          </div>
          <div>
            <h4>toko</h4>
            <Link href="/admin">masuk admin</Link>
            <span className="small muted">© {new Date().getFullYear()} {s.store_name}</span>
          </div>
        </div>
      </footer>

      <div className="taskbar" role="navigation" aria-label="Taskbar">
        <Link href="/" className="start">
          <img src="/logo.png" alt="" />
          start
        </Link>
        <a href="/#katalog" className="task hide-sm">🛍️ katalog.exe</a>
        <button type="button" className="task" onClick={() => setOpen(true)}>
          🧺 keranjang ({count})
        </button>
        <div className="tray">
          <span aria-hidden>🔊 🌸</span>
          {now && (
            <span>
              <span className="clock-date">{now.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} · </span>
              {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
