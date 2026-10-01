import { isDemo, supabase } from "./supabase";
import type { Buyer, Order, Product, Settings, Zone } from "./types";
import { shippingCost } from "./format";

export const DEFAULT_SETTINGS: Settings = {
  store_name: "Avobloom",
  whatsapp: "6281234567890",
  qris_url: null,
  payment_note:
    "Scan QRIS, masukkan nominal PERSIS sesuai total, lalu kirim bukti bayar lewat WhatsApp ya 🌸",
  announcement: "preloved with love 🥑 cek koleksi terbaru tiap minggu",
  shipping_info: "Dikirim via J&T Express (EZ) dari Purwomartani, Sleman",
};

// ---------- data contoh (dipakai kalau Supabase belum disambungkan) ----------
const now = new Date().toISOString();
const demo = (p: Partial<Product> & Pick<Product, "id" | "name" | "category" | "price">): Product => ({
  brand: null,
  original_price: null,
  condition: null,
  size: null,
  description: null,
  images: [],
  weight_grams: 500,
  stock: 1,
  is_active: true,
  created_at: now,
  ...p,
});

export const DEMO_PRODUCTS: Product[] = [
  demo({ id: "d1", name: "Mini shoulder bag pink", category: "barang", brand: "Charles & Keith", price: 185000, original_price: 699000, condition: "Like new", description: "Dipakai 2x ke kondangan, mulus tanpa lecet. Dapat dust bag.", weight_grams: 700 }),
  demo({ id: "d2", name: "Niacinamide serum 30ml", category: "skincare", brand: "Somethinc", price: 55000, original_price: 115000, condition: "Sisa 85%", size: "30ml", description: "Exp. 2027. Cocok buat kulit berminyak, aku ganti karena purging.", weight_grams: 200 }),
  demo({ id: "d3", name: "Cardigan rajut lilac", category: "pakaian", price: 75000, condition: "Dipakai 3x", size: "All size fit L", description: "Bahan halus, nggak gatal. LD 100cm, panjang 55cm.", weight_grams: 400 }),
  demo({ id: "d4", name: "Phone strap beads", category: "barang", price: 25000, condition: "Baru", weight_grams: 100, stock: 3 }),
  demo({ id: "d5", name: "Sunscreen gel SPF 50", category: "skincare", brand: "Azarine", price: 30000, original_price: 65000, condition: "Sisa 70%", size: "50ml", weight_grams: 150 }),
  demo({ id: "d6", name: "Babydoll dress floral", category: "pakaian", price: 95000, condition: "Like new", size: "S", weight_grams: 350, stock: 0 }),
  demo({ id: "d7", name: "Lip tint set (3 shade)", category: "skincare", brand: "Peripera", price: 80000, condition: "Swatch 1x", weight_grams: 150 }),
  demo({ id: "d8", name: "Platform sneakers putih", category: "pakaian", price: 210000, original_price: 550000, condition: "Dipakai 5x", size: "38", weight_grams: 1100 }),
];

const DEMO_ZONES: Zone[] = [
  ["DI Yogyakarta", 8000, "1-2 hari"],
  ["Jawa Tengah", 10000, "1-3 hari"],
  ["Jawa Timur", 12000, "2-3 hari"],
  ["Jawa Barat", 13000, "2-3 hari"],
  ["DKI Jakarta", 14000, "2-3 hari"],
  ["Banten", 15000, "2-4 hari"],
  ["Bali", 19000, "2-4 hari"],
  ["Nusa Tenggara Barat", 26000, "3-5 hari"],
  ["Nusa Tenggara Timur", 38000, "4-7 hari"],
  ["Lampung", 21000, "3-4 hari"],
  ["Sumatera Selatan", 25000, "3-5 hari"],
  ["Bengkulu", 28000, "3-5 hari"],
  ["Jambi", 27000, "3-5 hari"],
  ["Kepulauan Bangka Belitung", 29000, "3-6 hari"],
  ["Riau", 30000, "3-5 hari"],
  ["Sumatera Barat", 30000, "3-5 hari"],
  ["Kepulauan Riau", 33000, "3-6 hari"],
  ["Sumatera Utara", 33000, "3-6 hari"],
  ["Aceh", 39000, "4-7 hari"],
  ["Kalimantan Barat", 33000, "3-6 hari"],
  ["Kalimantan Tengah", 37000, "3-6 hari"],
  ["Kalimantan Selatan", 33000, "3-5 hari"],
  ["Kalimantan Timur", 38000, "3-6 hari"],
  ["Kalimantan Utara", 48000, "4-8 hari"],
  ["Sulawesi Selatan", 36000, "3-6 hari"],
  ["Sulawesi Barat", 42000, "4-7 hari"],
  ["Sulawesi Tenggara", 44000, "4-7 hari"],
  ["Sulawesi Tengah", 46000, "4-8 hari"],
  ["Gorontalo", 48000, "4-8 hari"],
  ["Sulawesi Utara", 48000, "4-8 hari"],
  ["Maluku", 60000, "5-9 hari"],
  ["Maluku Utara", 62000, "5-9 hari"],
  ["Papua Barat", 85000, "6-12 hari"],
  ["Papua Barat Daya", 85000, "6-12 hari"],
  ["Papua", 90000, "6-12 hari"],
  ["Papua Tengah", 100000, "7-14 hari"],
  ["Papua Selatan", 100000, "7-14 hari"],
  ["Papua Pegunungan", 120000, "7-14 hari"],
].map(([province, rate, eta], i) => ({ id: i + 1, province: province as string, rate_per_kg: rate as number, eta: eta as string, sort_order: i }));

// ---------- pembeli ----------
export async function fetchProducts(): Promise<Product[]> {
  if (isDemo) return DEMO_PRODUCTS;
  const { data, error } = await supabase()
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
}

export async function fetchZones(): Promise<Zone[]> {
  if (isDemo) return DEMO_ZONES;
  const { data, error } = await supabase()
    .from("shipping_zones")
    .select("*")
    .order("sort_order")
    .order("province");
  if (error) throw error;
  return data as Zone[];
}

export async function fetchSettings(): Promise<Settings> {
  if (isDemo) return DEFAULT_SETTINGS;
  const { data } = await supabase().from("settings").select("*").eq("id", 1).maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data || {}) };
}

export async function createOrder(items: { id: string; qty: number }[], buyer: Buyer): Promise<string> {
  if (isDemo) {
    const products = items.map((i) => ({ p: DEMO_PRODUCTS.find((d) => d.id === i.id)!, qty: i.qty }));
    const subtotal = products.reduce((s, x) => s + x.p.price * x.qty, 0);
    const weight = products.reduce((s, x) => s + x.p.weight_grams * x.qty, 0);
    const zone = DEMO_ZONES.find((z) => z.province === buyer.province)!;
    const ship = shippingCost(zone.rate_per_kg, weight);
    const code = "AVB-DEMO" + Math.floor(Math.random() * 9000 + 1000);
    const order: Order = {
      code,
      buyer_name: buyer.name,
      buyer_phone: buyer.phone,
      address: buyer.address,
      province: buyer.province,
      city: buyer.city,
      district: buyer.district,
      postal_code: buyer.postal_code,
      note: buyer.note,
      items: products.map((x) => ({ id: x.p.id, name: x.p.name, price: x.p.price, qty: x.qty, image: x.p.images[0] || "" })),
      subtotal,
      total_weight: weight,
      shipping_cost: ship,
      total: subtotal + ship,
      status: "menunggu_pembayaran",
      courier: null,
      tracking_number: null,
      created_at: new Date().toISOString(),
    };
    sessionStorage.setItem("demo-order:" + code, JSON.stringify(order));
    return code;
  }
  const { data, error } = await supabase().rpc("create_order", { p_items: items, p_buyer: buyer });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function getOrder(code: string): Promise<Order | null> {
  if (isDemo) {
    const raw = sessionStorage.getItem("demo-order:" + code);
    return raw ? (JSON.parse(raw) as Order) : null;
  }
  const { data, error } = await supabase().rpc("get_order", { p_code: code });
  if (error) throw new Error(error.message);
  return (data as Order) || null;
}
