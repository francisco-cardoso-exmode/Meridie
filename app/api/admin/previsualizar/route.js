import { NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { isAdmin } from "@/lib/adminAuth";
import { caminhoSeguro } from "@/lib/previsualizacao";

export const dynamic = "force-dynamic";

// Liga a pré-visualização (Draft Mode) e abre a página pedida.
export async function GET(request) {
  const url = caminhoSeguro(new URL(request.url).searchParams.get("url"));
  if (!url) return NextResponse.json({ ok: false, erro: "Endereço inválido." }, { status: 400 });
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", request.url));
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(url, request.url));
}
