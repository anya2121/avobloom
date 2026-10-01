"use client";

import { BUCKET, supabase } from "./supabase";

/** Kecilkan foto di browser sebelum upload (hemat kuota storage & bikin web cepat). */
export async function resizeImage(file: File, max = 1600, quality = 0.85): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  const type = file.type === "image/png" && file.size < 400_000 ? "image/png" : "image/jpeg";
  return new Promise((res) => canvas.toBlob((b) => res(b || file), type, quality));
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const blob = await resizeImage(file);
  const ext = blob.type === "image/png" ? "png" : blob.type === "image/gif" ? "gif" : "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const sb = supabase();
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error("Upload gagal: " + error.message);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Hapus file dari storage berdasarkan URL publiknya (diam-diam kalau gagal). */
export async function removeImages(urls: string[]) {
  const marker = `/object/public/${BUCKET}/`;
  const paths = urls.map((u) => (u.includes(marker) ? decodeURIComponent(u.split(marker)[1]) : "")).filter(Boolean);
  if (paths.length) await supabase().storage.from(BUCKET).remove(paths).catch(() => {});
}
