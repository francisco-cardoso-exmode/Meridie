import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { TIPOS_IMAGEM, MAX_IMAGEM } from "@/lib/uploadTipos";

/**
 * Upload direto do browser para o Vercel Blob nas apps do Alojamento Local
 * (proprietário, equipa, hóspede) — como /api/admin/upload, mas:
 * - só imagens;
 * - o caminho tem de começar por "al/" e leva sempre um sufixo aleatório
 *   (os URLs do Blob são públicos: não se adivinham e nunca são listados);
 * - `autorizado(clientPayload)` decide (sessão do papel ou token do hóspede).
 */
export async function tratarUploadAl(request, autorizado) {
  const body = await request.json().catch(() => null);
  if (!body?.type) return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
  try {
    const r = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!/^al\/[a-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(pathname)) throw new Error("Caminho inválido.");
        if (!(await autorizado(clientPayload))) throw new Error("Não autorizado.");
        return { allowedContentTypes: TIPOS_IMAGEM, maximumSizeInBytes: MAX_IMAGEM, addRandomSuffix: true };
      },
    });
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ ok: false, erro: e?.message || "Falha no upload." }, { status: 400 });
  }
}
