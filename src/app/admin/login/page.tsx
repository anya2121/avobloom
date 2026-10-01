"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Win from "@/components/Win";
import { isDemo, supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (isDemo) return setErr("Supabase belum disambungkan. Isi environment variable dulu (lihat README).");
    setBusy(true);
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message === "Invalid login credentials" ? "Email atau password salah." : error.message);
      setBusy(false);
      return;
    }
    router.replace("/admin");
  }

  return (
    <div className="login-wrap">
      <div style={{ width: "100%", maxWidth: 380 }}>
        <Win title="admin_login.exe" icon="🔐">
          <div className="center" style={{ marginBottom: 12 }}>
            <img src="/logo.png" alt="Avobloom" width={96} height={96} style={{ margin: "0 auto" }} />
            <b className="pixel" style={{ fontSize: 22 }}>avobloom admin</b>
          </div>
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div className="field">
              <label htmlFor="pw">Password</label>
              <input id="pw" type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {err && <div className="alert err">{err}</div>}
            <button className="btn green block" disabled={busy}>{busy ? "masuk…" : "masuk →"}</button>
          </form>
          <p className="small center" style={{ marginBottom: 0 }}>
            <Link href="/">← balik ke toko</Link>
          </p>
        </Win>
      </div>
    </div>
  );
}
