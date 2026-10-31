"use client";

import { upload } from "@vercel/blob/client";
import { MSG_SESSAO } from "@/lib/adminCliente";
import {
  TIPOS_IMAGEM,
  TIPOS_VIDEO,
  MAX_IMAGEM,
  MAX_VIDEO,
  EXTENSAO,
} from "@/lib/uploadTipos";

const MB = 1024 * 1024;

// Nome limpo para o Blob, com a extensão certa para o tipo do ficheiro.
function nomeSeguro(nome, tipo) {
  const base =
    (nome || "ficheiro")
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "ficheiro";
  return `${base}.${EXTENSAO[tipo]}`;
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
  try {
    const blob = await upload(nomeSeguro(nome, tipo), file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
      contentType: tipo,
      multipart: file.size > 20 * MB,
    });
    return blob.url;
  } catch (e) {
    // O cliente do Blob não diz o código HTTP: confirma se foi a sessão.
    const sessao = await fetch("/api/admin/upload").then((r) => r.status !== 401, () => true);
    if (!sessao) throw new Error(MSG_SESSAO);
    const m = e?.message || "";
    throw new Error(
      /token/i.test(m)
        ? "O servidor recusou o upload (falta configurar o Vercel Blob — BLOB_READ_WRITE_TOKEN — ou o ficheiro não é permitido)."
        : m || "Falha no upload."
    );
  }
}
