"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { rupiah, waLink } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/lib/useSettings";
import Win from "./Win";
import { CATEGORY_EMOJI } from "./Deco";

export default function ProductModal({ p, onClose }: { p: Product; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const { add, items } = useCart();
  const s = useSettings();
  const sold = p.stock <= 0;
  const inCart = items.find((i) => i.id === p.id)?.qty || 0;
  const n = p.images.length;

  const zoomRef = useRef(false);
  zoomRef.current = zoom;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomRef.current) setZoom(false);
        else onClose();
      }
      if (e.key === "ArrowRight" && n > 1) setIdx((i) => (i + 1) % n);
      if (e.key === "ArrowLeft" && n > 1) setIdx((i) => (i - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [n, onClose]);

  const rows: [string, string | null][] = [
    ["Kategori", `${CATEGORY_EMOJI[p.category]} ${p.category}`],
    ["Brand", p.brand],
    ["Kondisi", p.condition],
    ["Ukuran / isi", p.size],
    ["Berat kirim", `${p.weight_grams} gram`],
    ["Stok", sold ? "habis" : `${p.stock}`],
  ];

  return (
    <div className="overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 820 }}>
        <Win title={p.name} icon="🖼️" onClose={onClose} className="modal">
          <div className="detail">
            <div>
              <div className="gallery-main">
                {n ? (
                  <img
                    src={p.images[idx]}
                    alt={`${p.name} foto ${idx + 1}`}
                    onClick={() => setZoom(true)}
                    style={{ cursor: "zoom-in" }}
                  />
                ) : (
                  <span style={{ fontSize: 96 }} aria-hidden>{CATEGORY_EMOJI[p.category]}</span>
                )}
                {n > 1 && (
                  <>
                    <button className="btn sm white gallery-nav prev" onClick={() => setIdx((idx - 1 + n) % n)} aria-label="Foto sebelumnya">◀</button>
                    <button className="btn sm white gallery-nav next" onClick={() => setIdx((idx + 1) % n)} aria-label="Foto berikutnya">▶</button>
                    <span className="sticker right" style={{ top: "auto", bottom: 8 }}>{idx + 1}/{n}</span>
                  </>
                )}
                {n > 0 && (
                  <button className="btn sm white zoom-btn" onClick={() => setZoom(true)} aria-label="Lihat foto ukuran penuh">⤢ full</button>
                )}
                {sold && <div className="sold-over" style={{ pointerEvents: "none" }}><span>SOLD</span></div>}
              </div>
              {n > 1 && (
                <div className="thumbs">
                  {p.images.map((src, i) => (
                    <button key={src + i} className={i === idx ? "on" : ""} onClick={() => setIdx(i)} aria-label={`Foto ${i + 1}`}>
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="price" style={{ fontSize: 24 }}>
                {rupiah(p.price)}
                {p.original_price ? <s style={{ fontSize: 13 }}>{rupiah(p.original_price)}</s> : null}
              </div>
              <table className="spec">
                <tbody>
                  {rows.filter(([, v]) => v).map(([k, v]) => (
                    <tr key={k}><td>{k}</td><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
              {p.description && <p className="desc">{p.description}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="btn green block" disabled={sold || inCart >= p.stock} onClick={() => { add(p); onClose(); }}>
                  {sold ? "sudah terjual 🥲" : inCart >= p.stock ? "✓ sudah di keranjang" : "🧺 masukkan keranjang"}
                </button>
                <a
                  className="btn wa block"
                  target="_blank"
                  rel="noreferrer"
                  href={waLink(s.whatsapp, `Halo ${s.store_name}! Aku mau tanya soal "${p.name}" (${rupiah(p.price)}) 🥑`)}
                >
                  💬 tanya via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Win>
      </div>
      {zoom && n > 0 && (
        <div className="lightbox" onClick={(e) => { e.stopPropagation(); setZoom(false); }}>
          <img src={p.images[idx]} alt={`${p.name} foto ${idx + 1} ukuran penuh`} onClick={(e) => e.stopPropagation()} />
          <button className="btn sm white lb-close" onClick={(e) => { e.stopPropagation(); setZoom(false); }} aria-label="Tutup">✕</button>
          {n > 1 && (
            <>
              <button className="btn white lb-nav prev" onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + n) % n); }} aria-label="Foto sebelumnya">◀</button>
              <button className="btn white lb-nav next" onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % n); }} aria-label="Foto berikutnya">▶</button>
              <span className="lb-count pixel">{idx + 1}/{n}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
