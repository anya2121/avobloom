"use client";

import { useState } from "react";
import Win from "./Win";
import { submitFeedback } from "@/lib/api";

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? "on" : ""} aria-hidden>
          ★
        </span>
      ))}
    </span>
  );
}

const LABEL = ["", "kurang 😢", "lumayan", "oke", "suka! 💕", "suka banget!! 🥰"];

export default function FeedbackForm({
  code,
  defaultName,
  onDone,
}: {
  code: string;
  defaultName: string;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!rating) return setErr("Pilih bintangnya dulu ya ⭐");
    if (comment.trim().length < 3) return setErr("Tulis ulasannya sedikit lagi ya");
    setBusy(true);
    try {
      await submitFeedback(code, rating, comment, name);
      onDone();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  const shown = hover || rating;

  return (
    <Win title="ulasan.exe" icon="💬" tone="green" style={{ marginTop: 16 }}>
      <b>Barangnya udah sampai? Ceritain dong!</b>
      <p className="small muted" style={{ marginTop: 2 }}>Ulasanmu bantu pembeli lain & bikin {"avobloom"} makin semangat 🥑</p>
      <form onSubmit={send}>
        <div className="star-input" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={rating === i}
              aria-label={`${i} bintang`}
              className={i <= shown ? "on" : ""}
              onMouseEnter={() => setHover(i)}
              onClick={() => setRating(i)}
            >
              ★
            </button>
          ))}
          <span className="small muted" style={{ marginLeft: 8 }}>{LABEL[shown]}</span>
        </div>
        <div className="field">
          <label htmlFor="fb-c">Ulasan</label>
          <textarea
            id="fb-c"
            className="textarea"
            maxLength={1000}
            placeholder="Kondisi barang sesuai? Packing-nya gimana? 💌"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="fb-n">Nama yang ditampilkan</label>
          <input id="fb-n" className="input" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
          <span className="hint">Boleh nama panggilan aja. Ulasan tampil di web setelah dicek admin.</span>
        </div>
        {err && <div className="alert err">{err}</div>}
        <button className="btn green block" disabled={busy}>{busy ? "mengirim…" : "kirim ulasan 💌"}</button>
      </form>
    </Win>
  );
}
