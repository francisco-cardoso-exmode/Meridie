import { NextResponse } from "next/server";
import { novoDesafio } from "@/lib/provaTrabalho";

export const dynamic = "force-dynamic";

// Desafio anti-bot para o formulário de contacto (ver lib/provaTrabalho.js).
export function GET() {
  return NextResponse.json(novoDesafio(), { headers: { "Cache-Control": "no-store" } });
}
