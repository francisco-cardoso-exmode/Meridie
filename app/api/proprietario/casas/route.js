import { NextResponse, after } from "next/server";
import { getProprietario } from "@/lib/al/auth";
import { criarCasa } from "@/lib/al/casas";
import { limparCasa } from "@/lib/al/validacao";
import { traduzirEmFundo } from "@/lib/traducao";
import { dentroDoLimite } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });

// Nova casa do proprietário com sessão (fica em rascunho).
export async function POST(request) {
  const p = await getProprietario();
  if (!p) return erro("A tua sessão expirou. Entra de novo.", 401);
  if (!(await dentroDoLimite(`al-casa-nova:${p.email}`, 20, 24 * 60 * 60))) return erro("Demasiadas casas criadas hoje.", 429);
  const dados = limparCasa(await request.json().catch(() => null));
  if (!dados?.titulo) return erro("Dá um título à casa.");
  try {
    const slug = await criarCasa({ plano: p.plano || "gestao", ...dados }, p.id);
    after(() => traduzirEmFundo("al_casas", slug));
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    console.error("criar casa:", e);
    return erro("Não foi possível criar a casa. Tenta de novo.", 500);
  }
}
