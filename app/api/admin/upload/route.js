import { handleUploadPresigned } from "@vercel/blob/client";
import { put, list, issueSignedToken, BlobStoreSuspendedError, BlobAccessError, BlobStoreNotFoundError } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { TIPOS_IMAGEM, TIPOS_VIDEO, MAX_IMAGEM, MAX_VIDEO, eVideo } from "@/lib/uploadTipos";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SESSAO = "A tua sessão expirou. Entra noutra janela e volta a guardar.";
// Ficheiros que podem passar por esta função (a Vercel corta pedidos acima de 4,5 MB).
const MAX_PELO_SERVIDOR = 4 * 1024 * 1024;
const NOME_VALIDO = /^[A-Za-z0-9_-]{1,100}\.(jpg|png|webp|avif|gif|mp4|webm|mov)$/;

/**
 * Uploads do backoffice para o Vercel Blob. Dois caminhos:
 * 1. JSON "blob.generate-presigned-url": o browser envia o ficheiro direto para
 *    o Blob com um URL pré-assinado (sem limite de 4,5 MB). O token sai de
 *    issueSignedToken, que usa a autenticação OIDC da Vercel — não depende do
 *    BLOB_READ_WRITE_TOKEN.
 * 2. multipart/form-data: o ficheiro passa por aqui e grava-se com put() (também
 *    por OIDC). Rede de segurança para imagens pequenas se o 1 falhar.
 */
export async function POST(request) {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false, erro: SESSAO }, { status: 401 });

  if ((request.headers.get("content-type") || "").startsWith("multipart/form-data"))
    return peloServidor(request);

  const body = await request.json().catch(() => null);
  if (!body?.type) return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });

  try {
    const r = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!(await isAdmin())) throw new Error("Não autorizado.");
        if (!NOME_VALIDO.test(pathname)) throw new Error("Nome de ficheiro inválido.");
        const video = eVideo(pathname);
        const limites = {
          allowedContentTypes: video ? TIPOS_VIDEO : TIPOS_IMAGEM,
          maximumSizeInBytes: video ? MAX_VIDEO : MAX_IMAGEM,
        };
        const token = await issueSignedToken({ pathname, operations: ["put"], ...limites });
        return { token, urlOptions: { ...limites, addRandomSuffix: false } };
      },
    });
    return NextResponse.json(r);
  } catch (e) {
    console.error("upload pré-assinado:", e?.message || e);
    return NextResponse.json({ ok: false, erro: e?.message || "Falha no upload." }, { status: 400 });
  }
}

async function peloServidor(request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const nome = String(form.get("nome") || "");
    if (!file || typeof file === "string")
      return NextResponse.json({ ok: false, erro: "Sem ficheiro." }, { status: 400 });
    if (!NOME_VALIDO.test(nome) || eVideo(nome) || !TIPOS_IMAGEM.includes(file.type))
      return NextResponse.json({ ok: false, erro: "Só imagens JPG, PNG, WebP, AVIF ou GIF." }, { status: 400 });
    if (file.size > MAX_PELO_SERVIDOR)
      return NextResponse.json({ ok: false, erro: "Imagem demasiado grande." }, { status: 413 });
    const blob = await put(nome, file, { access: "public", contentType: file.type, addRandomSuffix: false });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    console.error("upload pelo servidor:", e?.message || e);
    return NextResponse.json({ ok: false, erro: e?.message || "Falha no upload." }, { status: 500 });
  }
}

/**
 * Usado pelo uploader quando um envio falha: distingue "sessão expirada" de
 * problemas do Vercel Blob (sem credenciais, store suspensa ou apagada).
 */
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false, erro: SESSAO }, { status: 401 });
  try {
    await list({ limit: 1 });
    return NextResponse.json({ ok: true, blob: "ok" });
  } catch (e) {
    const erro =
      e instanceof BlobStoreSuspendedError
        ? "A Blob store da Vercel está suspensa (limite do plano ultrapassado?). Ver Vercel → Storage → Blob → Usage."
        : e instanceof BlobAccessError || e instanceof BlobStoreNotFoundError
          ? "O site não consegue aceder à Blob store da Vercel (store desligada do projeto ou apagada). Ver Vercel → Storage."
          : `O Vercel Blob respondeu com erro: ${e?.message || "desconhecido"}`;
    console.error("diagnóstico Blob:", e?.message || e);
    return NextResponse.json({ ok: false, blob: "erro", erro });
  }
}
