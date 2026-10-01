"use client";

import { useEffect, useState } from "react";
import Win from "./Win";
import { Stars } from "./FeedbackForm";
import { fetchFeedback } from "@/lib/api";
import type { Feedback } from "@/lib/types";

export default function Testimonials() {
  const [list, setList] = useState<Feedback[]>([]);
  const [all, setAll] = useState(false);

  useEffect(() => {
    fetchFeedback().then(setList).catch(() => {});
  }, []);

  if (list.length === 0) return null;

  const avg = list.reduce((s, f) => s + f.rating, 0) / list.length;
  const shown = all ? list : list.slice(0, 6);

  return (
    <Win id="ulasan" title={`guestbook.exe — ${list.length} ulasan`} icon="💌" tone="sky" style={{ scrollMarginTop: 16, marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <h2 className="section-title" style={{ color: "var(--lav)" }}>kata mereka</h2>
        <span>
          <Stars value={avg} size={20} /> <b>{avg.toFixed(1)}</b>
          <span className="small muted"> / 5 dari {list.length} pembeli</span>
        </span>
      </div>
      <div className="reviews">
        {shown.map((f, i) => (
          <figure key={f.id} className="review" style={{ transform: `rotate(${[-1, 0.8, -0.4, 1.1, -0.9, 0.5][i % 6]}deg)` }}>
            <Stars value={f.rating} />
            <blockquote>{f.comment}</blockquote>
            <figcaption>
              <b>— {f.display_name}</b>
              {f.items && <span className="muted"> · beli {f.items}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      {list.length > 6 && (
        <div className="center" style={{ marginTop: 14 }}>
          <button className="btn sm lav" onClick={() => setAll(!all)}>{all ? "lebih sedikit" : `lihat semua (${list.length})`}</button>
        </div>
      )}
    </Win>
  );
}
