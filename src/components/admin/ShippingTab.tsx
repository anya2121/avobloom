"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { kg, rupiah } from "@/lib/format";
import type { Zone } from "@/lib/types";

type Row = Zone & { _new?: boolean; _del?: boolean };

export default function ShippingTab() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [orig, setOrig] = useState<string>("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [sample, setSample] = useState("1000");
  const [pct, setPct] = useState("10");

  const load = useCallback(async () => {
    const { data, error } = await supabase().from("shipping_zones").select("*").order("sort_order").order("province");
    if (error) return setErr(error.message);
    setRows(data as Row[]);
    setOrig(JSON.stringify(data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upd = (i: number, patch: Partial<Row>) => setRows((r) => r && r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const dirty = rows && JSON.stringify(rows) !== orig;

  function bulk(sign: 1 | -1) {
    const p = (parseFloat(pct) || 0) / 100;
    setRows((r) => r && r.map((x) => ({ ...x, rate_per_kg: Math.max(0, Math.round((x.rate_per_kg * (1 + sign * p)) / 500) * 500) })));
  }

  async function save() {
    if (!rows) return;
    setBusy(true);
    setErr("");
    setMsg("");
    const sb = supabase();
    const del = rows.filter((r) => r._del && !r._new).map((r) => r.id);
    if (del.length) {
      const { error } = await sb.from("shipping_zones").delete().in("id", del);
      if (error) { setBusy(false); return setErr(error.message); }
    }
    const keep = rows.filter((r) => !r._del && r.province.trim());
    const existing = keep.filter((r) => !r._new).map(({ _new, _del, ...r }) => ({ ...r, province: r.province.trim() }));
    const fresh = keep.filter((r) => r._new).map(({ _new, _del, id, ...r }) => ({ ...r, province: r.province.trim() }));
    if (existing.length) {
      const { error } = await sb.from("shipping_zones").upsert(existing);
      if (error) { setBusy(false); return setErr(error.message); }
    }
    if (fresh.length) {
      const { error } = await sb.from("shipping_zones").insert(fresh);
      if (error) { setBusy(false); return setErr(error.message); }
    }
    setBusy(false);
    setMsg("✓ tarif ongkir tersimpan");
    load();
  }

  const w = parseInt(sample, 10) || 1000;

  return (
    <>
      <div className="alert">
        <b>Cara hitung:</b> ongkir = tarif per kg × berat paket (dibulatkan ke atas, minimal 1 kg). Berat paket = jumlah berat
        semua produk di keranjang. Tarif bawaan = perkiraan J&amp;T EZ dari Purwomartani, Sleman. Cocokkan dengan Cek Tarif di aplikasi/web J&amp;T (asal: Kalasan, Sleman · berat 1 kg) ke ibu kota tiap provinsi, lalu isi di sini.
      </div>
      <div className="toolbar">
        <label className="small">
          contoh berat paket{" "}
          <input className="input" style={{ width: 90, display: "inline-block" }} type="number" min={1} value={sample} onChange={(e) => setSample(e.target.value)} /> g
          → {kg(w)} kg
        </label>
        <span style={{ marginLeft: "auto" }} className="small">
          ubah semua{" "}
          <input className="input" style={{ width: 60, display: "inline-block" }} type="number" value={pct} onChange={(e) => setPct(e.target.value)} />%{" "}
          <button className="btn sm white" onClick={() => bulk(1)}>naikkan</button>{" "}
          <button className="btn sm white" onClick={() => bulk(-1)}>turunkan</button>
        </span>
      </div>
      {err && <div className="alert err">{err}</div>}
      {!rows ? (
        <p className="pixel" style={{ fontSize: 20 }}>loading…</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Provinsi</th>
                <th>Tarif / kg (Rp)</th>
                <th>Estimasi</th>
                <th>Ongkir {kg(w)} kg</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} style={r._del ? { opacity: 0.35, textDecoration: "line-through" } : undefined}>
                  <td><input className="input" value={r.province} onChange={(e) => upd(i, { province: e.target.value })} /></td>
                  <td><input className="input" type="number" min={0} step={500} value={r.rate_per_kg} onChange={(e) => upd(i, { rate_per_kg: parseInt(e.target.value, 10) || 0 })} style={{ width: 120 }} /></td>
                  <td><input className="input" value={r.eta || ""} placeholder="2-3 hari" onChange={(e) => upd(i, { eta: e.target.value })} style={{ width: 110 }} /></td>
                  <td style={{ whiteSpace: "nowrap" }}>{rupiah(r.rate_per_kg * kg(w))}</td>
                  <td>
                    <button className="btn sm white" onClick={() => upd(i, { _del: !r._del })} aria-label="Hapus provinsi">{r._del ? "↺" : "🗑"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button
          className="btn white"
          onClick={() =>
            setRows((r) => r && [...r, { id: -Date.now(), province: "", rate_per_kg: 0, eta: "", sort_order: (r.length || 0) + 1, _new: true }])
          }
        >
          ＋ tambah wilayah
        </button>
        <button className="btn green" onClick={save} disabled={!dirty || busy}>{busy ? "menyimpan…" : "simpan semua"}</button>
        {msg && <span className="small">{msg}</span>}
      </div>
    </>
  );
}
