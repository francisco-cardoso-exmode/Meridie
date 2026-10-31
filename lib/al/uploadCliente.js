"use client";

import { upload } from "@vercel/blob/client";
import { TIPOS_IMAGEM, MAX_IMAGEM } from "@/lib/uploadTipos";

/**
 * Upload de fotos nas apps do Alojamento Local (telemóvel): reduz no browser
 * (máx. 1600 px, JPEG) e envia direto para o Vercel Blob, autorizado pela
 * rota `rota` (sessão do proprietário/equipa, ou token do hóspede em
 * `payload`). O caminho começa por "al/<pasta>/" e o Blob junta um sufixo
 * aleatório. Devolve o URL.
 */

async function reduzir(file, maxW = 1600, q = 0.8) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const escala = Math.min(1, maxW / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", q));
    return blob && blob.type === "image/jpeg" ? new File([blob], "foto.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export async function enviarFotoAl(file, { rota, pasta = "fotos", payload } = {}) {
  const f = await reduzir(file);
  if (!TIPOS_IMAGEM.includes(f.type)) throw new Error("Formato não suportado. Usa JPG, PNG ou WebP.");
  if (f.size > MAX_IMAGEM) throw new Error("Foto demasiado grande.");
  const ext = f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
  const p = String(pasta).toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60) || "fotos";
  const blob = await upload(`al/${p}/foto.${ext}`, f, {
    access: "public",
    handleUploadUrl: rota,
    contentType: f.type,
    clientPayload: payload ? JSON.stringify(payload) : undefined,
  });
  return blob.url;
}
