"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Product } from "./types";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  weight_grams: number;
  stock: number;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  weight: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "avobloom-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    return {
      items,
      count,
      subtotal: items.reduce((s, i) => s + i.price * i.qty, 0),
      weight: items.reduce((s, i) => s + i.weight_grams * i.qty, 0),
      open,
      setOpen,
      add: (p) => {
        setItems((prev) => {
          const found = prev.find((i) => i.id === p.id);
          if (found) {
            return prev.map((i) => (i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i));
          }
          return [
            ...prev,
            { id: p.id, name: p.name, price: p.price, image: p.images[0] || "", weight_grams: p.weight_grams, stock: p.stock, qty: 1 },
          ];
        });
        setOpen(true);
      },
      setQty: (id, qty) =>
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i))
        ),
      remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      clear: () => setItems([]),
    };
  }, [items, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart harus di dalam CartProvider");
  return c;
}
