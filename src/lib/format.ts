import type { Buyer, OrderItem } from "./types";

export const rupiah = (n: number) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");

export const kg = (grams: number) => Math.max(1, Math.ceil((grams || 0) / 1000));

export const shippingCost = (ratePerKg: number, grams: number) => ratePerKg * kg(grams);

/** 0812-3456-7890 / +62812... → 62812... (format wa.me) */
export function waNumber(raw: string) {
  let d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  if (d.startsWith("8")) d = "62" + d;
  return d;
}

export const waLink = (phone: string, text: string) =>
  `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;

export function orderMessage(o: {
  code: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  buyer: Pick<Buyer, "name" | "phone" | "address" | "district" | "city" | "province" | "postal_code" | "note">;
  storeName: string;
  pageUrl?: string;
}) {
  const b = o.buyer;
  const lines = [
    `Halo ${o.storeName}! 🥑🌸`,
    `Aku udah pesan dan bayar lewat QRIS, ini detailnya ya:`,
    ``,
    `*Kode pesanan:* ${o.code}`,
    ...o.items.map((i) => `• ${i.name} x${i.qty} — ${rupiah(i.price * i.qty)}`),
    ``,
    `Subtotal: ${rupiah(o.subtotal)}`,
    `Ongkir: ${rupiah(o.shipping_cost)}`,
    `*Total: ${rupiah(o.total)}*`,
    ``,
    `*Kirim ke:*`,
    `${b.name} (${b.phone})`,
    [b.address, b.district, b.city, b.province, b.postal_code].filter(Boolean).join(", "),
  ];
  if (b.note) lines.push(`Catatan: ${b.note}`);
  lines.push(``, `Bukti bayar QRIS aku kirim di chat ini ya 💕`);
  if (o.pageUrl) lines.push(`Cek pesanan: ${o.pageUrl}`);
  return lines.join("\n");
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
