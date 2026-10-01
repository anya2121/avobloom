export type Category = "barang" | "skincare" | "pakaian";

export type Product = {
  id: string;
  name: string;
  category: Category;
  brand: string | null;
  price: number;
  original_price: number | null;
  condition: string | null;
  size: string | null;
  description: string | null;
  images: string[];
  weight_grams: number;
  stock: number;
  is_active: boolean;
  created_at: string;
};

export type Zone = {
  id: number;
  province: string;
  rate_per_kg: number;
  eta: string | null;
  sort_order: number;
};

export type Settings = {
  store_name: string;
  whatsapp: string;
  qris_url: string | null;
  payment_note: string | null;
  announcement: string | null;
  shipping_info: string | null;
};

export type OrderItem = { id: string; name: string; price: number; qty: number; image: string };

export type OrderStatus =
  | "menunggu_pembayaran"
  | "dibayar"
  | "dikemas"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export type Order = {
  id?: string;
  code: string;
  buyer_name: string;
  buyer_phone: string;
  address: string;
  province: string;
  city: string;
  district: string | null;
  postal_code: string | null;
  note: string | null;
  items: OrderItem[];
  subtotal: number;
  total_weight: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  courier: string | null;
  tracking_number: string | null;
  created_at: string;
  has_feedback?: boolean;
};

export type Feedback = {
  id: string;
  order_code: string;
  display_name: string;
  rating: number;
  comment: string;
  items: string | null;
  is_published: boolean;
  created_at: string;
};

export type Buyer = {
  name: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  note: string;
};

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "barang", label: "Barang", icon: "🎀" },
  { id: "skincare", label: "Skincare", icon: "🧴" },
  { id: "pakaian", label: "Pakaian", icon: "👗" },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu_pembayaran: "Menunggu pembayaran",
  dibayar: "Sudah dibayar",
  dikemas: "Sedang dikemas",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};
