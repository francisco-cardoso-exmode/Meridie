import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { TIPOS_IMAGEM, TIPOS_VIDEO, MAX_IMAGEM, MAX_VIDEO, eVideo } from "@/lib/uploadTipos";

export const dynamic = "force-dynamic";

const SESSAO = "A tua sessão expirou. Entra noutra janela e volta a guardar.";

/**
 * Upload direto do browser para o Vercel Blob (@vercel/blob/client): o
 * ficheiro NÃO passa por esta função (que tem limite de 4,5 MB na Vercel) —
 * aqui só se autoriza e se gera um token de uso único, limitado a imagens e
 * vídeos e a um tamanho máximo. Só usa BLOB_READ_WRITE_TOKEN (sem webhook).
 */
export async function POST(request) {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false, erro: SESSAO }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.type) return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });

  try {
    const r = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAdmin())) throw new Error("Não autorizado.");
        const video = eVideo(pathname);
        return {
          allowedContentTypes: video ? TIPOS_VIDEO : TIPOS_IMAGEM,
          maximumSizeInBytes: video ? MAX_VIDEO : MAX_IMAGEM,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ ok: false, erro: e?.message || "Falha no upload." }, { status: 400 });
  }
}

// Usado pelo uploader para distinguir "sessão expirada" de outras falhas.
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false, erro: SESSAO }, { status: 401 });
  return NextResponse.json({ ok: true });
}
