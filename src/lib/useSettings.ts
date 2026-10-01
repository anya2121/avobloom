"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, fetchSettings } from "./api";
import type { Settings } from "./types";

let cache: Promise<Settings> | null = null;

export function useSettings(): Settings {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => {
    if (!cache) cache = fetchSettings().catch(() => DEFAULT_SETTINGS);
    let alive = true;
    cache.then((v) => alive && setS(v));
    return () => {
      alive = false;
    };
  }, []);
  return s;
}

export const qrisSrc = (s: Settings) => s.qris_url || "/qris.png";
