"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Win from "@/components/Win";
import { isDemo, supabase } from "@/lib/supabase";
import OrdersTab from "@/components/admin/OrdersTab";
import ProductsTab from "@/components/admin/ProductsTab";
import ShippingTab from "@/components/admin/ShippingTab";
import SettingsTab from "@/components/admin/SettingsTab";

type Tab = "pesanan" | "produk" | "ongkir" | "pengaturan";
const TABS: { id: Tab; label: string }[] = [
  { id: "pesanan", label: "📦 Pesanan" },
  { id: "produk", label: "🛍️ Produk" },
  { id: "ongkir", label: "🚚 Ongkir" },
  { id: "pengaturan", label: "⚙️ Pengaturan" },
];

export default function AdminPage() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ok" | "notadmin">("loading");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<Tab>("pesanan");

  useEffect(() => {
    if (isDemo) return;
    const sb = supabase();
    (async () => {
      const { data } = await sb.auth.getSession();
      if (!data.session) return router.replace("/admin/login");
      setEmail(data.session.user.email || "");
      const { data: ok } = await sb.rpc("is_admin");
      setState(ok ? "ok" : "notadmin");
    })();
    const saved = sessionStorage.getItem("avobloom-admin-tab") as Tab | null;
    if (saved) setTab(saved);
  }, [router]);

  const pick = (t: Tab) => {
    setTab(t);
    sessionStorage.setItem("avobloom-admin-tab", t);
  };

  async function logout() {
    await supabase().auth.signOut();
    router.replace("/admin/login");
  }

  if (isDemo) {
    return (
      <div className="login-wrap">
        <div style={{ maxWidth: 480 }}>
          <Win title="admin.exe" icon="⚙️">
            <p>
              Halaman admin butuh database Supabase. Isi <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di Vercel, lalu deploy ulang. Langkah lengkapnya ada di README.
            </p>
            <Link href="/" className="btn">← balik ke toko</Link>
          </Win>
        </div>
      </div>
    );
  }

  if (state === "loading") return <div className="login-wrap pixel" style={{ fontSize: 24 }}>loading… ▓▓▓░░░</div>;

  if (state === "notadmin") {
    return (
      <div className="login-wrap">
        <div style={{ maxWidth: 460 }}>
          <Win title="akses ditolak" icon="⛔">
            <p>
              Akun <b>{email}</b> belum terdaftar sebagai admin. Tambahkan email ini ke tabel <code>admins</code> di Supabase
              (lihat README langkah 2).
            </p>
            <button className="btn" onClick={logout}>keluar</button>
          </Win>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="strip"><div className="strip-track"><span>avobloom admin panel</span><span>jangan lupa update stok</span><span>cek pesanan masuk tiap hari</span><span>avobloom admin panel</span><span>jangan lupa update stok</span><span>cek pesanan masuk tiap hari</span></div></div>
      <div className="container admin-shell">
        <div className="header-row" style={{ marginBottom: 16, flexWrap: "wrap" }}>
          <Link href="/" className="brand">
            <img src="/logo.png" alt="" />
            <span className="brand-word">avobloom<small>admin panel</small></span>
          </Link>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span className="small muted">{email}</span>
            <Link href="/" className="btn sm white" target="_blank">lihat toko ↗</Link>
            <button className="btn sm lav" onClick={logout}>keluar</button>
          </div>
        </div>

        <div className="admin-tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" className={tab === t.id ? "on" : ""} onClick={() => pick(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="win" style={{ borderTopLeftRadius: 0 }}>
          <div className="win-body">
            {tab === "pesanan" && <OrdersTab />}
            {tab === "produk" && <ProductsTab />}
            {tab === "ongkir" && <ShippingTab />}
            {tab === "pengaturan" && <SettingsTab />}
          </div>
        </div>
      </div>
    </>
  );
}
