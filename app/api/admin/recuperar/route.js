import { NextResponse } from "next/server";
import { criarTokenAcesso } from "@/lib/acessoAdmin";
import { enviarLinkAcesso } from "@/lib/mailer";
import { SITE_URL } from "@/lib/site";
import { normalizaEmail } from "@/lib/utilizadores";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Resposta sempre igual — não revela se o email é ou não autorizado (nem se
// o pedido foi travado pelo limite).
const RESPOSTA = {
  ok: true,
  msg: "Se este email estiver autorizado, vais receber um link de acesso dentro de instantes.",
};

// Limite: 5 pedidos em 15 min por IP e 5 por hora por email (além de 1 por
// minuto por email, em lib/acessoAdmin.js).
export async function POST(request) {
  const { email } = (await request.json().catch(() => null)) || {};
  const e = normalizaEmail(email);
  try {
    const okIp = await dentroDoLimite(`recuperar-ip:${ipDe(request)}`, 5, 15 * 60);
    const okEmail = e ? await dentroDoLimite(`recuperar-email:${e}`, 5, 60 * 60) : false;
    if (okIp && okEmail) {
      const token = await criarTokenAcesso(e);
      if (token) {
        await enviarLinkAcesso({ email: e, link: `${SITE_URL}/api/admin/acesso?t=${token}` });
      }
    }
  } catch (err) {
    console.error("recuperar acesso:", err);
  }
  return NextResponse.json(RESPOSTA);
}
