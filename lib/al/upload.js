import { handleUploadPresigned } from "@vercel/blob/client";
import { put, issueSignedToken } from "@vercel/blob";
import { NextResponse } from "next/server";
import { TIPOS_IMAGEM, MAX_IMAGEM } from "@/lib/uploadTipos";

const CAMINHO = /^al\/[a-z0-9-]{1,60}\/[a-z0-9]{16,40}\.(jpg|png|webp)$/;
const MAX_PELO_SERVIDOR = 4 * 1024 * 1024; // a Vercel corta pedidos acima de 4,5 MB

/**
 * Upload de fotos nas apps do Alojamento Local (proprietário, equipa, hóspede)
 * — como /api/admin/upload, mas:
 * - só imagens;
 * - o caminho é "al/<pasta>/<aleatório>.<ext>" (os URLs do Blob são públicos:
 *   não se adivinham e nunca são listados);
 * - `autorizado(clientPayload)` decide (sessão do papel ou token do hóspede).
 * JSON → URL pré-assinado (issueSignedToken, por OIDC da Vercel, sem
 * BLOB_READ_WRITE_TOKEN); multipart/form-data → grava pelo servidor (rede de segurança).
 */
export async function tratarUploadAl(request, autorizado) {
  if ((request.headers.get("content-type") || "").startsWith("multipart/form-data"))
    return peloServidor(request, autorizado);

  const body = await request.json().catch(() => null);
  if (!body?.type) return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
  try {
    const r = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname, clientPayload) => {
        if (!CAMINHO.test(pathname)) throw new Error("Caminho inválido.");
        if (!(await autorizado(clientPayload))) throw new Error("Não autorizado.");
        const limites = { allowedContentTypes: TIPOS_IMAGEM, maximumSizeInBytes: MAX_IMAGEM };
        const token = await issueSignedToken({ pathname, operations: ["put"], ...limites });
        return { token, urlOptions: { ...limites, addRandomSuffix: false } };
      },
    });
    return NextResponse.json(r);
  } catch (e) {
    console.error("upload AL pré-assinado:", e?.message || e);
    return NextResponse.json({ ok: false, erro: e?.message || "Falha no upload." }, { status: 400 });
  }
}

async function peloServidor(request, autorizado) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const pathname = String(form.get("nome") || "");
    const payload = form.get("payload");
    if (!file || typeof file === "string" || !CAMINHO.test(pathname) || !TIPOS_IMAGEM.includes(file.type))
      return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
    if (!(await autorizado(typeof payload === "string" && payload ? payload : null)))
      return NextResponse.json({ ok: false, erro: "Não autorizado." }, { status: 401 });
    if (file.size > MAX_PELO_SERVIDOR)
      return NextResponse.json({ ok: false, erro: "Foto demasiado grande." }, { status: 413 });
    const blob = await put(pathname, file, { access: "public", contentType: file.type, addRandomSuffix: false });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    console.error("upload AL pelo servidor:", e?.message || e);
    return NextResponse.json({ ok: false, erro: e?.message || "Falha no upload." }, { status: 500 });
  }
}
