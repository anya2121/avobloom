"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { rupiah } from "@/lib/format";
import Win from "./Win";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, count } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="overlay drawer-wrap" onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} style={{ height: "100%" }}>
        <Win title={`keranjang.exe — ${count} item`} icon="🧺" className="drawer" onClose={() => setOpen(false)}
          footer={items.length > 0 && (
          <div className="drawer-foot">
            <div className="sum-row total" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>
              <span>Subtotal</span>
              <span>{rupiah(subtotal)}</span>
            </div>
            <p className="small muted" style={{ margin: "2px 0 10px" }}>Ongkir dihitung di halaman checkout sesuai provinsi.</p>
            <Link href="/checkout" className="btn block green" onClick={() => setOpen(false)}>
              checkout →
            </Link>
          </div>
        )}
        >
          {items.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 48 }}>🥑</div>
              Keranjangmu masih kosong.
              <br />
              <button className="btn sm" style={{ marginTop: 12 }} onClick={() => setOpen(false)}>
                lihat-lihat dulu
              </button>
            </div>
          ) : (
            items.map((i) => (
              <div key={i.id} className="line-item">
                {i.image ? <img className="mini" src={i.image} alt="" /> : <div className="mini">🎀</div>}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{i.name}</div>
                  <div className="price" style={{ fontSize: 13 }}>{rupiah(i.price)}</div>
                  <button className="link-btn" onClick={() => remove(i.id)}>hapus</button>
                </div>
                <div className="qty" aria-label="Jumlah">
                  <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Kurangi">−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Tambah" disabled={i.qty >= i.stock}>+</button>
                </div>
              </div>
            ))
          )}
        </Win>
      </div>
    </div>
  );
}
