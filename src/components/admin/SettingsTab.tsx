"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { removeImages, uploadImage } from "@/lib/upload";
import { waNumber } from "@/lib/format";
import { DEFAULT_SETTINGS } from "@/lib/api";
import type { Settings } from "@/lib/types";

export default function SettingsTab() {
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    supabase()
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        setS({ ...DEFAULT_SETTINGS, ...(data || {}) });
      });
  }, []);

  if (!s) return <p className="pixel" style={{ fontSize: 20 }}>loading…</p>;

  const set = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value });

  async function persist(next: Settings) {
    const { error } = await supabase()
      .from("settings")
      .update({
        store_name: next.store_name.trim() || "Avobloom",
        whatsapp: waNumber(next.whatsapp),
        qris_url: next.qris_url,
        payment_note: next.payment_note,
        announcement: next.announcement,
        shipping_info: next.shipping_info,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) throw error;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await persist(s!);
      setS({ ...s!, whatsapp: waNumber(s!.whatsapp) });
      setMsg("✓ pengaturan tersimpan");
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  }

  async function onQris(file?: File) {
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const old = s!.qris_url;
      const url = await uploadImage(file, "qris");
      const next = { ...s!, qris_url: url };
      await persist(next);
      setS(next);
      if (old) await removeImages([old]);
      setMsg("✓ QRIS baru tersimpan");
    } catch (e) {
      setErr((e as Error).message);
    }
    setUploading(false);
  }

  async function resetQris() {
    if (!confirm("Kembali ke gambar QRIS bawaan (public/qris.png)?")) return;
    const old = s!.qris_url;
    const next = { ...s!, qris_url: null };
    await persist(next);
    setS(next);
    if (old) await removeImages([old]);
  }

  return (
    <form onSubmit={save} className="two-col">
      <div>
        <div className="field">
          <label htmlFor="sn">Nama toko</label>
          <input id="sn" className="input" value={s.store_name} onChange={set("store_name")} />
        </div>
        <div className="field">
          <label htmlFor="sw">Nomor WhatsApp toko</label>
          <input id="sw" className="input" inputMode="tel" value={s.whatsapp} onChange={set("whatsapp")} placeholder="08xxxxxxxxxx" />
          <span className="hint">Pesanan pembeli dikirim ke nomor ini. Format 08… otomatis diubah ke 628…</span>
        </div>
        <div className="field">
          <label htmlFor="sa">Teks pengumuman (strip atas)</label>
          <input id="sa" className="input" value={s.announcement || ""} onChange={set("announcement")} />
        </div>
        <div className="field">
          <label htmlFor="si">Info pengiriman (tampil di checkout)</label>
          <input id="si" className="input" value={s.shipping_info || ""} onChange={set("shipping_info")} placeholder="Dikirim via J&T Express dari …" />
        </div>
        <div className="field">
          <label htmlFor="sp">Catatan pembayaran (tampil di halaman QRIS)</label>
          <textarea id="sp" className="textarea" value={s.payment_note || ""} onChange={set("payment_note")} />
        </div>
        {err && <div className="alert err">{err}</div>}
        {msg && <div className="alert ok">{msg}</div>}
        <button className="btn green" disabled={busy}>{busy ? "menyimpan…" : "simpan pengaturan"}</button>
      </div>
      <div>
        <div className="field">
          <label>Gambar QRIS</label>
          <div className="qris-box">
            <img src={s.qris_url || "/qris.png"} alt="QRIS" style={{ maxWidth: 240 }} />
          </div>
          <span className="hint">
            {s.qris_url ? "Pakai QRIS yang kamu upload." : "Masih pakai QRIS bawaan (public/qris.png)."} Pastikan nama merchant di QRIS sesuai rekening yang mau dipakai.
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label className="btn white">
            {uploading ? "upload…" : "ganti gambar QRIS"}
            <input type="file" accept="image/*" hidden onChange={(e) => onQris(e.target.files?.[0])} />
          </label>
          {s.qris_url && (
            <button type="button" className="btn white" onClick={resetQris}>pakai bawaan</button>
          )}
        </div>
      </div>
    </form>
  );
}
