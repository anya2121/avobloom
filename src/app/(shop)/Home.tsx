"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Win from "@/components/Win";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import Testimonials from "@/components/Testimonials";
import { Disc, Flower, Heart, Sparkle, Star } from "@/components/Deco";
import { fetchProducts } from "@/lib/api";
import { isDemo } from "@/lib/supabase";
import { CATEGORIES, type Category, type Product } from "@/lib/types";
import { useSettings } from "@/lib/useSettings";
import { waLink } from "@/lib/format";

type Sort = "baru" | "murah" | "mahal";

export default function Home() {
  const params = useSearchParams();
  const router = useRouter();
  const s = useSettings();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("baru");
  const [hideSold, setHideSold] = useState(false);
  const [open, setOpen] = useState<Product | null>(null);
  const cat = (params.get("k") as Category | null) || null;

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e) => setErr(e.message || "Gagal memuat produk"));
  }, []);

  const setCat = (c: Category | null) => {
    const url = c ? `/?k=${c}#katalog` : "/#katalog";
    router.replace(url, { scroll: false });
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (products || []).forEach((p) => (c[p.category] = (c[p.category] || 0) + (p.stock > 0 ? 1 : 0)));
    return c;
  }, [products]);

  const list = useMemo(() => {
    let l = (products || []).filter((p) => !cat || p.category === cat);
    if (hideSold) l = l.filter((p) => p.stock > 0);
    const term = q.trim().toLowerCase();
    if (term) l = l.filter((p) => [p.name, p.brand, p.description, p.size].join(" ").toLowerCase().includes(term));
    l = [...l].sort((a, b) => {
      if ((a.stock > 0) !== (b.stock > 0)) return a.stock > 0 ? -1 : 1; // yang sold di belakang
      if (sort === "murah") return a.price - b.price;
      if (sort === "mahal") return b.price - a.price;
      return b.created_at.localeCompare(a.created_at);
    });
    return l;
  }, [products, cat, q, sort, hideSold]);

  const available = (products || []).filter((p) => p.stock > 0).length;

  return (
    <div className="container">
      {isDemo && (
        <div className="alert" role="status">
          ✨ <b>Mode demo:</b> Supabase belum disambungkan, jadi yang tampil masih produk contoh. Ikuti README untuk menyambungkan database.
        </div>
      )}

      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="quick-col side-stack">
          <Win title="quick links" icon="🔗" bodyClassName="quick" tone="sky">
            <a href="#katalog" onClick={() => setCat(null)}>✨ semua item <span className="arr">›</span></a>
            {CATEGORIES.map((c) => (
              <a key={c.id} href={`/?k=${c.id}#katalog`} onClick={(e) => { e.preventDefault(); setCat(c.id); document.getElementById("katalog")?.scrollIntoView(); }}>
                {c.icon} {c.label.toLowerCase()} <span className="arr">›</span>
              </a>
            ))}
            <a href="#cara-beli">📖 cara beli <span className="arr">›</span></a>
            <a href="/pesanan">📦 cek pesanan <span className="arr">›</span></a>
          </Win>
          <Win title="welcome.txt" icon="💌">
            <p style={{ margin: 0, fontSize: 12 }}>
              welcome babe! 🌸
              <br />
              makasih udah mampir. semoga nemu barang lucu yang jodoh sama kamu hari ini.
              <br />
              <br />
              xoxo, {s.store_name.toLowerCase()} 🥑
            </p>
          </Win>
        </div>

        <div className="hero-main">
          <Sparkle className="deco twinkle" size={22} style={{ top: 0, left: "6%" }} color="#ffe1ef" />
          <Disc className="deco spin" size={78} style={{ top: -8, right: "4%" }} />
          <Star className="deco twinkle" size={30} style={{ bottom: 60, right: "10%" }} color="#a6d16a" />
          <p className="pixel" style={{ fontSize: 22, margin: "18px 0 0", color: "var(--avo-deep)" }}>
            ✿ preloved shop · est. 2026
          </p>
          <h1 className="headline">
            loved once,
            <br />
            <span className="green">bloom</span> twice
          </h1>
          <p className="hero-sub">
            Barang, skincare &amp; pakaian preloved pilihan — masih cakep, harga jauh lebih ramah. Bayar pakai QRIS, ongkir langsung kehitung.
          </p>
          <div className="hero-cta">
            <a href="#katalog" className="btn">belanja sekarang →</a>
            <a href="#cara-beli" className="btn lav">cara beli</a>
          </div>
          <div className="hero-links">
            <a href="#katalog" onClick={() => setCat("pakaian")}>pakaian</a>
            <a href="#katalog" onClick={() => setCat("skincare")}>skincare</a>
            <a href="#katalog" onClick={() => setCat("barang")}>barang lucu</a>
          </div>
        </div>

        <div className="side-stack">
          <Win title="avobloom.jpg" icon="🖼️" className="photo-win" tone="green">
            <img src="/logo.png" alt="Logo Avobloom" />
            <Flower className="deco" size={34} style={{ top: 40, right: 12 }} />
            <Heart className="deco twinkle" size={26} style={{ bottom: 16, left: 14 }} />
          </Win>
          <Win title="new message!" icon="✉️" tone="sky">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Heart size={30} />
              <div className="small">
                kamu punya <b>({available || "…"})</b> item yang lagi nunggu rumah baru
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <a href="#katalog" className="btn sm lav">lihat</a>
            </div>
          </Win>
          <div className="note">
            <b className="pixel" style={{ fontSize: 18 }}>don&apos;t forget!</b>
            <ul>
              <li className="done">cek kondisi &amp; ukuran</li>
              <li className="done">isi alamat lengkap</li>
              <li>bayar QRIS sesuai total</li>
              <li>kirim bukti ke WA 💕</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- PERKS ---------- */}
      <div className="perks">
        <div className="perk"><span className="ico">🏷️</span><div><b>harga preloved</b><span>jauh di bawah harga baru</span></div></div>
        <div className="perk"><span className="ico">🚚</span><div><b>kirim via J&amp;T</b><span>ongkir otomatis sesuai provinsi &amp; berat</span></div></div>
        <div className="perk"><span className="ico">📱</span><div><b>bayar QRIS</b><span>semua e-wallet &amp; m-banking</span></div></div>
      </div>

      {/* ---------- KATALOG ---------- */}
      <Win id="katalog" title={`katalog.exe — ${list.length} item`} icon="🛍️" style={{ scrollMarginTop: 16, marginBottom: 32 }}>
        <h2 className="section-title">katalog</h2>
        <p className="muted small" style={{ marginTop: 0 }}>Semua foto asli, kondisi ditulis jujur. Klik item buat lihat detail &amp; foto lain.</p>
        <div className="toolbar">
          <div className="tabs" role="tablist">
            <button role="tab" className={`tab ${!cat ? "on" : ""}`} onClick={() => setCat(null)}>semua</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} role="tab" className={`tab ${cat === c.id ? "on" : ""}`} onClick={() => setCat(c.id)}>
                {c.icon} {c.label.toLowerCase()} {counts[c.id] ? `(${counts[c.id]})` : ""}
              </button>
            ))}
          </div>
          <input className="input search" placeholder="cari nama, brand, ukuran…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari produk" />
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Urutkan">
            <option value="baru">terbaru</option>
            <option value="murah">termurah</option>
            <option value="mahal">termahal</option>
          </select>
          <label className="check">
            <input type="checkbox" checked={hideSold} onChange={(e) => setHideSold(e.target.checked)} />
            sembunyikan sold
          </label>
        </div>

        {err && <div className="alert err">{err}</div>}
        {!products && !err && <div className="empty pixel" style={{ fontSize: 22 }}>loading… ▓▓▓▓░░░░</div>}
        {products && list.length === 0 && (
          <div className="empty">
            <div style={{ fontSize: 48 }}>🥑</div>
            {products.length === 0 ? "Belum ada produk. Nantikan ya!" : "Nggak ada item yang cocok."}
          </div>
        )}
        <div className="grid">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} onOpen={() => setOpen(p)} />
          ))}
        </div>
      </Win>

      {/* ---------- ULASAN ---------- */}
      <Testimonials />

      {/* ---------- CARA BELI ---------- */}
      <Win id="cara-beli" title="cara_beli.txt" icon="📖" tone="green" style={{ scrollMarginTop: 16, marginBottom: 32 }}>
        <h2 className="section-title" style={{ color: "var(--pink)" }}>cara beli</h2>
        <div className="steps">
          {[
            ["Pilih & masukkan keranjang", "Cek foto, kondisi, dan ukuran. Item preloved cuma ada 1, siapa cepat dia dapat!"],
            ["Isi alamat di checkout", "Pilih provinsi, ongkir langsung dihitung otomatis dari berat paket."],
            ["Bayar pakai QRIS", "Scan QRIS dari e-wallet atau m-banking apa aja, isi nominal persis sesuai total."],
            ["Konfirmasi via WhatsApp", "Klik tombol WA, pesan pesanan otomatis terisi. Kirim bukti bayar, beres! 💕"],
          ].map(([t, d], i) => (
            <div key={t} className="step">
              <span className="step-num">{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </Win>

      {/* ---------- BANNER ---------- */}
      <section
        className="win"
        style={{
          background: "linear-gradient(180deg, #bfe4ff 0%, #e8f6ff 55%, #ffe1ef 100%)",
          padding: "32px 20px",
          textAlign: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Star className="deco twinkle" size={44} style={{ top: 14, left: "8%" }} color="#ff9acb" />
        <Flower className="deco" size={46} style={{ bottom: 12, right: "8%" }} />
        <Sparkle className="deco twinkle" size={26} style={{ top: 24, right: "18%" }} />
        <h2 className="headline" style={{ fontSize: "clamp(32px, 5vw, 52px)", transform: "rotate(-2deg)", margin: "0 0 8px" }}>
          welcome to the grove
        </h2>
        <p style={{ margin: "0 0 16px" }}>Ada pertanyaan soal ukuran, kondisi, atau mau nego dikit? Chat aja dulu.</p>
        <a className="btn wa" href={waLink(s.whatsapp, `Halo ${s.store_name}! Aku mau tanya-tanya dulu 🥑`)} target="_blank" rel="noreferrer">
          💬 chat WhatsApp
        </a>
      </section>

      {open && <ProductModal p={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
