import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import {
  getDestinatariosGuardados,
  setDestinatarios,
  destinatariosPorDefeito,
} from "@/lib/config";
import { revalidaSite } from "@/lib/revalida";

export const dynamic = "force-dynamic";

const SESSAO = "A tua sessão expirou. Entra noutra janela e volta a guardar.";
const emailValido = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, erro: SESSAO }, { status: 401 });
  return NextResponse.json({
    ok: true,
    destinatarios: await getDestinatariosGuardados({ estrito: true }),
    porDefeito: destinatariosPorDefeito(),
  });
}

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, erro: SESSAO }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const recebidos = (Array.isArray(body?.destinatarios) ? body.destinatarios : [])
    .map((s) => String(s).trim())
    .filter(Boolean);
  const invalidos = recebidos.filter((s) => !emailValido(s));
  if (invalidos.length)
    return NextResponse.json(
      { ok: false, erro: `Email(s) inválido(s): ${invalidos.join(", ")}` },
      { status: 400 }
    );
  await setDestinatarios(recebidos);
  revalidaSite();
  return NextResponse.json({ ok: true, destinatarios: recebidos, porDefeito: destinatariosPorDefeito() });
}
