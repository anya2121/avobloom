import type { Metadata, Viewport } from "next";
import "@fontsource/bagel-fat-one/400.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "@fontsource/vt323/400.css";
import "./globals.css";
import { CartProvider } from "@/lib/cart";

const site = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: new URL(site ? `https://${site}` : "http://localhost:3000"),
  title: "Avobloom — preloved with love",
  description: "Preloved barang, skincare & pakaian pilihan. Bayar QRIS, ongkir otomatis, konfirmasi via WhatsApp.",
  openGraph: {
    title: "Avobloom — preloved with love",
    description: "Preloved barang, skincare & pakaian pilihan.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = { themeColor: "#ff9acb" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
