"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { removeImages } from "@/lib/upload";
import { rupiah } from "@/lib/format";
import { CATEGORIES, type Product } from "@/lib/types";
import { CATEGORY_EMOJI } from "@/components/Deco";
import ProductForm from "./ProductForm";

export default function ProductsTab() {
  const [list, setList] = useState<Product[] | null>(null);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase().from("products").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message);
    else setList(data as Product[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const t = q.toLowerCase();
    return (list || []).filter((p) => (!cat || p.category === cat) && (!t || (p.name + " " + (p.brand || "")).toLowerCase().includes(t)));
  }, [list, q, cat]);

  async function patch(p: Product, row: Partial<Product>) {
    setList((l) => l && l.map((x) => (x.id === p.id ? { ...x, ...row } : x)));
    const { error } = await supabase().from("products").update(row).eq("id", p.id);
    if (error) {
      setErr(error.message);
      load();
    }
  }

  async function del(p: Product) {
    if (!confirm(`Hapus "${p.name}" permanen? Foto-fotonya juga ikut dihapus.\n\nTips: kalau cuma mau sembunyikan, matikan "tampil" aja.`)) return;
    const { error } = await supabase().from("products").delete().eq("id", p.id);
    if (error) return setErr(error.message);
    await removeImages(p.images);
    load();
  }

  return (
    <>
      <div className="toolbar">
        <button className="btn green" onClick={() => setEditing("new")}>＋ produk baru</button>
        <input className="input search" placeholder="cari produk…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">semua kategori</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>
      {err && <div className="alert err">{err}</div>}
      {!list ? (
        <p className="pixel" style={{ fontSize: 20 }}>loading…</p>
      ) : shown.length === 0 ? (
        <div className="empty">Belum ada produk. Klik “＋ produk baru”.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Produk</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Berat</th>
                <th>Tampil</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.images[0] ? <img className="thumb-sm" src={p.images[0]} alt="" /> : <div className="thumb-sm">{CATEGORY_EMOJI[p.category]}</div>}
                  </td>
                  <td>
                    <b>{p.name}</b>
                    <div className="muted">
                      {CATEGORY_EMOJI[p.category]} {p.category}
                      {p.condition ? ` · ${p.condition}` : ""} · {p.images.length} foto
                    </div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{rupiah(p.price)}</td>
                  <td>
                    <div className="qty">
                      <button onClick={() => patch(p, { stock: Math.max(0, p.stock - 1) })} aria-label="Kurangi stok">−</button>
                      <span>{p.stock}</span>
                      <button onClick={() => patch(p, { stock: p.stock + 1 })} aria-label="Tambah stok">+</button>
                    </div>
                    {p.stock === 0 && <div><span className="pill dibatalkan">sold</span></div>}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{p.weight_grams} g</td>
                  <td>
                    <label className="check">
                      <input type="checkbox" checked={p.is_active} onChange={(e) => patch(p, { is_active: e.target.checked })} />
                    </label>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="btn sm white" onClick={() => setEditing(p)}>edit</button>{" "}
                    <button className="btn sm danger" onClick={() => del(p)} aria-label="Hapus">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductForm
          product={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}
