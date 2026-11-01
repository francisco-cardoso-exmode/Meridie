import { NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { caminhoSeguro } from "@/lib/previsualizacao";

export const dynamic = "force-dynamic";

// Desliga a pré-visualização e volta à página (ou à Home).
export async function GET(request) {
  (await draftMode()).disable();
  const url = caminhoSeguro(new URL(request.url).searchParams.get("url")) || "/";
  return NextResponse.redirect(new URL(url, request.url));
}
