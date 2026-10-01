"use client";

import type { Product } from "@/lib/types";
import { rupiah } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { CATEGORY_EMOJI } from "./Deco";

const fileName = (p: Product) =>
  p.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 18) + ".jpg";

export default function ProductCard({ p, onOpen }: { p: Product; onOpen: () => void }) {
  const { add, items } = useCart();
  const sold = p.stock <= 0;
  const inCart = items.find((i) => i.id === p.id)?.qty || 0;
  const tone = p.category === "skincare" ? "sky" : p.category === "pakaian" ? "" : "green";

  return (
    <article className={`win card ${tone}`} onClick={onOpen}>
      <div className="win-title">
        <span className="t">{fileName(p)}</span>
        <div className="win-btns" aria-hidden>
          <span>_</span>
          <span>✕</span>
        </div>
      </div>
      <div className="thumb">
        {p.images[0] ? (
          <img src={p.images[0]} alt={p.name} loading="lazy" />
        ) : (
          <span className="ph" aria-hidden>{CATEGORY_EMOJI[p.category]}</span>
        )}
        {p.condition && <span className="sticker">{p.condition}</span>}
        {p.images.length > 1 && <span className="sticker right">📷 {p.images.length}</span>}
        {sold && (
          <div className="sold-over">
            <span>SOLD</span>
          </div>
        )}
      </div>
      <div className="card-info">
        <div className="name">{p.name}</div>
        <div className="meta">
          {[p.brand, p.size].filter(Boolean).join(" · ") || CATEGORY_EMOJI[p.category] + " " + p.category}
        </div>
        <div className="price">
          {rupiah(p.price)}
          {p.original_price ? <s>{rupiah(p.original_price)}</s> : null}
        </div>
        <button
          className={`btn sm block ${inCart ? "white" : ""}`}
          disabled={sold || inCart >= p.stock}
          onClick={(e) => {
            e.stopPropagation();
            add(p);
          }}
        >
          {sold ? "sudah terjual" : inCart >= p.stock ? "✓ di keranjang" : "+ keranjang"}
        </button>
      </div>
    </article>
  );
}
