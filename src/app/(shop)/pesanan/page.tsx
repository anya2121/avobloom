"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Win from "@/components/Win";

export default function TrackPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [last, setLast] = useState("");

  useEffect(() => {
    try {
      setLast(localStorage.getItem("avobloom-last-order") || "");
    } catch {}
  }, []);

  return (
    <div className="container page" style={{ maxWidth: 520 }}>
      <Win title="cek_pesanan.exe" icon="📦" tone="sky">
        <h2 className="section-title" style={{ fontSize: 26 }}>cek pesanan</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) router.push(`/pesanan/${encodeURIComponent(code.trim().toUpperCase())}`);
          }}
        >
          <div className="field">
            <label htmlFor="code">Kode pesanan</label>
            <input id="code" className="input" placeholder="AVB-XXXXXXXX" value={code} onChange={(e) => setCode(e.target.value)} />
            <span className="hint">Kodenya ada di halaman setelah checkout dan di pesan WhatsApp kamu.</span>
          </div>
          <button className="btn block">cek status →</button>
        </form>
        {last && (
          <p className="small" style={{ marginBottom: 0 }}>
            Pesanan terakhirmu di perangkat ini:{" "}
            <a href={`/pesanan/${last}`}><b>{last}</b></a>
          </p>
        )}
      </Win>
    </div>
  );
}
