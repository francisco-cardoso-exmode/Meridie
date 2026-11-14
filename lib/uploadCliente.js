"use client";

import { uploadPresigned } from "@vercel/blob/client";
import { MSG_SESSAO } from "@/lib/adminCliente";
import {
  TIPOS_IMAGEM,
  TIPOS_VIDEO,
  MAX_IMAGEM,
  MAX_VIDEO,
  EXTENSAO,
} from "@/lib/uploadTipos";

const MB = 1024 * 1024;
const MAX_PELO_SERVIDOR = 4 * MB; // a Vercel corta pedidos acima de 4,5 MB

// Nome limpo e único para o Blob (sufixo aleatório: nunca substitui outro
// ficheiro), com a extensão certa para o tipo do ficheiro.
function nomeSeguro(nome, tipo) {
  const sufixo = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const base =
    (nome || "ficheiro")
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "ficheiro";
  return `${base}-${sufixo}.${EXTENSAO[tipo]}`;
}

/**
 * Envia um ficheiro (imagem ou vídeo) diretamente do browser para o Vercel
 * Blob — sem o limite de 4,5 MB das funções da Vercel. Devolve o URL público.
 * Lança Error com uma mensagem pronta a mostrar.
 */
export async function enviarParaBlob(file, nome = file?.name) {
  const tipo = file?.type || "";
  const video = TIPOS_VIDEO.includes(tipo);
  if (!video && !TIPOS_IMAGEM.includes(tipo))
    throw new Error(
      `Formato não suportado (${tipo || "desconhecido"}). Usa JPG, PNG, WebP, AVIF, GIF, MP4, WebM ou MOV.`
    );
  const max = video ? MAX_VIDEO : MAX_IMAGEM;
  if (file.size > max)
    throw new Error(
      `Ficheiro demasiado grande (${Math.round(file.size / MB)} MB; máx. ${max / MB} MB)` +
        (video ? " — para vídeos maiores usa um link do YouTube/Vimeo." : ".")
    );
  const pathname = nomeSeguro(nome, tipo);
  let erroDireto;
  try {
    const blob = await uploadPresigned(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
      contentType: tipo,
      multipart: file.size > 20 * MB,
    });
    return blob.url;
  } catch (e) {
    erroDireto = e;
  }
  // Rede de segurança: imagens pequenas (já reduzidas no browser) passam pelo servidor.
  if (!video && file.size <= MAX_PELO_SERVIDOR) {
    const form = new FormData();
    form.append("file", file);
    form.append("nome", pathname);
    const r = await fetch("/api/admin/upload", { method: "POST", body: form }).catch(() => null);
    const json = await r?.json().catch(() => null);
    if (r?.status === 401) throw new Error(MSG_SESSAO);
    if (json?.ok && json.url) return json.url;
    erroDireto = new Error(json?.erro || erroDireto?.message || "Falha no upload.");
  }
  // Pergunta ao servidor a causa (sessão expirada? Blob inacessível ou suspenso?).
  const diag = await fetch("/api/admin/upload")
    .then(async (r) => ({ status: r.status, ...(await r.json().catch(() => ({}))) }))
    .catch(() => null);
  if (diag?.status === 401) throw new Error(MSG_SESSAO);
  if (diag && diag.ok === false && diag.erro) throw new Error(diag.erro);
  throw new Error(`O upload falhou (${erroDireto?.message || "erro desconhecido"}). Envia esta mensagem ao programador.`);
}
