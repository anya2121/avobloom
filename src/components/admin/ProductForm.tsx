"use client";

import { useRef, useState } from "react";
import Win from "@/components/Win";
import { supabase } from "@/lib/supabase";
import { removeImages, uploadImage } from "@/lib/upload";
import { CATEGORIES, type Category, type Product } from "@/lib/types";

type Draft = {
  name: string;
  category: Category;
  brand: string;
  price: string;
  original_price: string;
  condition: string;
  size: string;
  description: string;
  images: string[];
  weight_grams: string;
  stock: string;
  is_active: boolean;
};

const toDraft = (p?: Product): Draft => ({
  name: p?.name || "",
  category: p?.category || "pakaian",
  brand: p?.brand || "",
  price: p ? String(p.price) : "",
  original_price: p?.original_price ? String(p.original_price) : "",
  condition: p?.condition || "",
  size: p?.size || "",
  description: p?.description || "",
  images: p?.images || [],
  weight_grams: p ? String(p.weight_grams) : "500",
  stock: p ? String(p.stock) : "1",
  is_active: p ? p.is_active : true,
});

const WEIGHT_HINT: Record<Category, string> = {
  pakaian: "kaos ±200g · kemeja ±300g · celana jeans ±600g · sepatu ±1000g",
  skincare: "serum/toner kecil ±150-250g · botol besar ±400g",
  barang: "aksesoris ±100g · tas ±500-800g",
};

export default function ProductForm({ product, onClose, onSaved }: { product?: Product; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Draft>(toDraft(product));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const added = useRef<string[]>([]); // foto yang diupload di sesi ini (buat dibersihkan kalau batal)

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setD({ ...d, [k]: e.target.value });

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setErr("");
    const list = Array.from(files).slice(0, 10);
    setUploading(list.length);
    for (const f of list) {
      try {
        const url = await uploadImage(f, "products");
        added.current.push(url);
        setD((prev) => ({ ...prev, images: [...prev.images, url] }));
      } catch (e) {
        setErr((e as Error).message);
      }
      setUploading((n) => n - 1);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  const move = (i: number, dir: -1 | 1) => {
    const imgs = [...d.images];
    const j = i + dir;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    setD({ ...d, images: imgs });
  };

  async function cancel() {
    if (added.current.length) await removeImages(added.current);
    onClose();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const price = parseInt(d.price.replace(/\D/g, ""), 10);
    if (!d.name.trim() || isNaN(price)) return setErr("Nama dan harga wajib diisi.");
    setBusy(true);
    const row = {
      name: d.name.trim(),
      category: d.category,
      brand: d.brand.trim() || null,
      price,
      original_price: d.original_price ? parseInt(d.original_price.replace(/\D/g, ""), 10) || null : null,
      condition: d.condition.trim() || null,
      size: d.size.trim() || null,
      description: d.description.trim() || null,
      images: d.images,
      weight_grams: Math.max(1, parseInt(d.weight_grams, 10) || 500),
      stock: Math.max(0, parseInt(d.stock, 10) || 0),
      is_active: d.is_active,
    };
    const sb = supabase();
    const { error } = product
      ? await sb.from("products").update(row).eq("id", product.id)
      : await sb.from("products").insert(row);
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    // foto lama yang dihapus dari daftar → hapus juga dari storage
    if (product) {
      const gone = product.images.filter((u) => !d.images.includes(u));
      if (gone.length) await removeImages(gone);
    }
    onSaved();
  }

  return (
    <div className="overlay">
      <div style={{ width: "100%", maxWidth: 720 }}>
        <Win title={product ? `edit — ${product.name}` : "produk_baru.exe"} icon="✏️" className="modal" onClose={cancel}>
          <form onSubmit={save}>
            <div className="field">
              <label>Foto (bisa banyak, foto pertama jadi cover)</label>
              <div className="img-grid">
                {d.images.map((src, i) => (
                  <div key={src} className={`img-slot ${i === 0 ? "first" : ""}`}>
                    <img src={src} alt="" />
                    <button type="button" className="x" onClick={() => setD({ ...d, images: d.images.filter((x) => x !== src) })} aria-label="Hapus foto">✕</button>
                    <div className="mv">
                      <button type="button" onClick={() => move(i, -1)} aria-label="Geser kiri">◀</button>
                      <button type="button" onClick={() => move(i, 1)} aria-label="Geser kanan">▶</button>
                    </div>
                  </div>
                ))}
                {Array.from({ length: uploading }).map((_, i) => (
                  <div key={"u" + i} className="img-slot upload-slot pixel" style={{ fontSize: 16 }}>upload…</div>
                ))}
                <label className="img-slot upload-slot">
                  <span>＋<br />tambah foto</span>
                  <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
                </label>
              </div>
              <span className="hint">Foto otomatis dikecilkan sebelum diupload. Maks 10 sekali pilih.</span>
            </div>

            <div className="row2">
              <div className="field">
                <label htmlFor="pn">Nama produk *</label>
                <input id="pn" className="input" required value={d.name} onChange={set("name")} />
              </div>
              <div className="field">
                <label htmlFor="pc">Kategori *</label>
                <select id="pc" className="select" value={d.category} onChange={set("category")}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row3">
              <div className="field">
                <label htmlFor="pp">Harga jual (Rp) *</label>
                <input id="pp" className="input" inputMode="numeric" required value={d.price} onChange={set("price")} placeholder="75000" />
              </div>
              <div className="field">
                <label htmlFor="po">Harga asli (opsional)</label>
                <input id="po" className="input" inputMode="numeric" value={d.original_price} onChange={set("original_price")} placeholder="dicoret" />
              </div>
              <div className="field">
                <label htmlFor="ps">Stok</label>
                <input id="ps" className="input" type="number" min={0} value={d.stock} onChange={set("stock")} />
              </div>
            </div>
            <div className="row3">
              <div className="field">
                <label htmlFor="pb">Brand</label>
                <input id="pb" className="input" value={d.brand} onChange={set("brand")} />
              </div>
              <div className="field">
                <label htmlFor="pk">Kondisi</label>
                <input id="pk" className="input" list="kondisi" value={d.condition} onChange={set("condition")} placeholder="Like new" />
                <datalist id="kondisi">
                  <option value="Baru (BNIB)" />
                  <option value="Like new" />
                  <option value="Dipakai 1-2x" />
                  <option value="Bekas pakai, mulus" />
                  <option value="Ada minus (cek foto)" />
                  <option value="Sisa 90%" />
                  <option value="Sisa 70%" />
                  <option value="Swatch only" />
                </datalist>
              </div>
              <div className="field">
                <label htmlFor="pz">Ukuran / isi</label>
                <input id="pz" className="input" value={d.size} onChange={set("size")} placeholder="M / 30ml / 38" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="pw">Berat kirim (gram) — dipakai hitung ongkir</label>
              <input id="pw" className="input" type="number" min={1} value={d.weight_grams} onChange={set("weight_grams")} />
              <span className="hint">Kira-kira termasuk packing: {WEIGHT_HINT[d.category]}</span>
            </div>
            <div className="field">
              <label htmlFor="pd">Deskripsi</label>
              <textarea id="pd" className="textarea" rows={5} value={d.description} onChange={set("description")} placeholder="Detail kondisi, ukuran (LD/panjang), expired date skincare, alasan dijual, minus kalau ada…" />
            </div>
            <label className="check" style={{ marginBottom: 14 }}>
              <input type="checkbox" checked={d.is_active} onChange={(e) => setD({ ...d, is_active: e.target.checked })} />
              Tampilkan di toko
            </label>
            {err && <div className="alert err">{err}</div>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" className="btn white" onClick={cancel}>batal</button>
              <button className="btn green" disabled={busy || uploading > 0}>{busy ? "menyimpan…" : "simpan"}</button>
            </div>
          </form>
        </Win>
      </div>
    </div>
  );
}
