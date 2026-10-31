import { NextResponse } from "next/server";
import { getSessao } from "@/lib/adminAuth";
import { autenticar, definirPassword, temPassword } from "@/lib/utilizadores";
import { dentroDoLimite } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Quem entrou pelo link do email pode definir a password sem saber a atual
// (é para isso que o link serve) — mas só nos primeiros 30 minutos.
const JANELA_LINK_MS = 30 * 60 * 1000;

// Alterar a password do utilizador com sessão. O email vem da sessão no
// servidor; para mudar uma password existente é preciso a password atual.
export async function POST(request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false }, { status: 401 });
  const email = sessao.email;
  if (!email)
    return NextResponse.json(
      { ok: false, erro: "Entraste com a password global — entra com o teu email para mudar a tua password." },
      { status: 400 }
    );
  const { password, atual } = (await request.json().catch(() => null)) || {};

  try {
    const viaLink =
      sessao.origem === "link" && Date.now() - new Date(sessao.criadoEm).getTime() < JANELA_LINK_MS;
    if (!viaLink && (await temPassword(email))) {
      if (!(await dentroDoLimite(`conta:${email}`, 10, 15 * 60)))
        return NextResponse.json(
          { ok: false, erro: "Demasiadas tentativas. Tenta de novo daqui a 15 minutos." },
          { status: 429 }
        );
      if (!(await autenticar(email, typeof atual === "string" ? atual : "")))
        return NextResponse.json({ ok: false, erro: "A password atual não está certa." }, { status: 400 });
    }
    // Termina as outras sessões deste utilizador; a atual mantém-se.
    await definirPassword(email, password, sessao.hash);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: e.message }, { status: 400 });
  }
}
