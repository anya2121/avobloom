"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/format";
import type { Feedback } from "@/lib/types";
import { Stars } from "@/components/FeedbackForm";

export default function FeedbackTab() {
  const [list, setList] = useState<Feedback[] | null>(null);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<"baru" | "tampil" | "semua">("baru");

  const load = useCallback(async () => {
    const { data, error } = await supabase().from("feedback").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message.includes("feedback") ? "Tabel ulasan belum ada. Jalankan supabase/feedback.sql di SQL Editor dulu ya." : error.message);
    else setList(data as Feedback[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(
    () => (list || []).filter((f) => (filter === "baru" ? !f.is_published : filter === "tampil" ? f.is_published : true)),
    [list, filter]
  );
  const avg = list?.length ? list.reduce((s, f) => s + f.rating, 0) / list.length : 0;

  async function publish(f: Feedback, v: boolean) {
    setList((l) => l && l.map((x) => (x.id === f.id ? { ...x, is_published: v } : x)));
    const { error } = await supabase().from("feedback").update({ is_published: v }).eq("id", f.id);
    if (error) {
      setErr(error.message);
      load();
    }
  }

  async function del(f: Feedback) {
    if (!confirm(`Hapus ulasan dari ${f.display_name}? Pembeli nggak bisa kirim ulasan lagi untuk pesanan ${f.order_code} kecuali ulasan ini dihapus.`)) return;
    const { error } = await supabase().from("feedback").delete().eq("id", f.id);
    if (error) return setErr(error.message);
    load();
  }

  return (
    <>
      <div className="stats">
        <div className="win stat"><b>{list?.filter((f) => !f.is_published).length ?? "…"}</b><span>menunggu dicek</span></div>
        <div className="win stat"><b>{list?.filter((f) => f.is_published).length ?? "…"}</b><span>tampil di web</span></div>
        <div className="win stat"><b>{avg ? avg.toFixed(1) : "–"} ★</b><span>rata-rata rating</span></div>
        <div className="win stat"><b>{list?.length ?? "…"}</b><span>total ulasan</span></div>
      </div>
      <div className="toolbar">
        <div className="tabs">
          {(["baru", "tampil", "semua"] as const).map((t) => (
            <button key={t} className={`tab ${filter === t ? "on" : ""}`} onClick={() => setFilter(t)}>
              {t === "baru" ? "perlu dicek" : t === "tampil" ? "tampil" : "semua"}
            </button>
          ))}
        </div>
        <button className="btn sm white" onClick={load}>↻ refresh</button>
      </div>
      <p className="small muted" style={{ marginTop: 0 }}>
        Ulasan baru masuk ke “perlu dicek” dulu. Klik <b>tampilkan</b> supaya muncul di beranda. Minta ulasan lewat tombol WA di tab Pesanan.
      </p>
      {err && <div className="alert err">{err}</div>}
      {!list ? (
        <p className="pixel" style={{ fontSize: 20 }}>loading…</p>
      ) : shown.length === 0 ? (
        <div className="empty">Belum ada ulasan di sini 🥑</div>
      ) : (
        <div className="reviews">
          {shown.map((f) => (
            <figure key={f.id} className="review" style={{ transform: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <Stars value={f.rating} />
                <span className={`pill ${f.is_published ? "selesai" : "menunggu_pembayaran"}`}>{f.is_published ? "tampil" : "belum tampil"}</span>
              </div>
              <blockquote>{f.comment}</blockquote>
              <figcaption>
                <b>— {f.display_name}</b> <span className="muted">· {f.order_code} · {formatDate(f.created_at)}</span>
                {f.items && <div className="muted">beli: {f.items}</div>}
              </figcaption>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {f.is_published ? (
                  <button className="btn sm white" onClick={() => publish(f, false)}>sembunyikan</button>
                ) : (
                  <button className="btn sm green" onClick={() => publish(f, true)}>✓ tampilkan</button>
                )}
                <button className="btn sm danger" onClick={() => del(f)} aria-label="Hapus ulasan">🗑</button>
              </div>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
