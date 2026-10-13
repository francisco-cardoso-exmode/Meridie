import { NextResponse } from "next/server";
import { isAdmin, utilizadorAtual } from "@/lib/adminAuth";
import { definirPassword } from "@/lib/utilizadores";

export const dynamic = "force-dynamic";

// Alterar a password do utilizador com sessão.
export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const email = await utilizadorAtual();
  if (!email)
    return NextResponse.json(
      { ok: false, erro: "Entraste com a password global — entra com o teu email para mudar a tua password." },
      { status: 400 }
    );
  const { password } = await request.json().catch(() => ({}));
  try {
    await definirPassword(email, password);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: e.message }, { status: 400 });
  }
}
