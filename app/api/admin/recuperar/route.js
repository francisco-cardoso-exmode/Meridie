import { NextResponse } from "next/server";
import { criarTokenAcesso } from "@/lib/acessoAdmin";
import { enviarLinkAcesso } from "@/lib/mailer";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Resposta sempre igual — não revela se o email é ou não autorizado.
const RESPOSTA = {
  ok: true,
  msg: "Se este email estiver autorizado, vais receber um link de acesso dentro de instantes.",
};

export async function POST(request) {
  const { email } = await request.json().catch(() => ({}));
  try {
    const token = await criarTokenAcesso(email);
    if (token) {
      await enviarLinkAcesso({ email, link: `${SITE_URL}/api/admin/acesso?t=${token}` });
    }
  } catch (e) {
    console.error("recuperar acesso:", e);
  }
  return NextResponse.json(RESPOSTA);
}
