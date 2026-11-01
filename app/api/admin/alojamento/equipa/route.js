import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { criarMembroEquipa, ativarMembroEquipa, definirPasswordAl, criarTokenAcesso, membroEquipa, VALIDADE_CONVITE_MS } from "@/lib/al/contas";
import { emailConviteEquipa } from "@/lib/al/emails";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });

/**
 * Equipa de terreno (app /equipa):
 * { acao: "criar", nome, email } — cria e envia o convite por email (a pessoa
 *   define a password; válido 7 dias) | { acao: "convite", email } — reenvia
 * | { acao: "ativo", email, ativo } | { acao: "password", email, password }
 *   (termina as sessões abertas).
 */
async function enviarConvite(email) {
  const m = await membroEquipa(email);
  const t = m && (await criarTokenAcesso("equipa", m.email, { validadeMs: VALIDADE_CONVITE_MS, limitar: false }));
  if (!t) throw Object.assign(new Error("Pessoa não encontrada ou desativada."), { publico: true });
  await emailConviteEquipa({ para: m.email, nome: m.nome, link: `${SITE_URL}/equipa/repor?t=${t}`, linkEntrar: `${SITE_URL}/equipa` });
}

export async function POST(request) {
  if (!(await isAdmin())) return erro("A tua sessão expirou. Entra noutra janela e volta a guardar.", 401);
  const b = (await request.json().catch(() => null)) || {};
  try {
    if (b.acao === "criar") {
      await criarMembroEquipa({ nome: b.nome, email: b.email, password: b.password });
      try {
        await enviarConvite(b.email);
      } catch (e) {
        console.error("convite equipa:", e?.message || e);
        return NextResponse.json({ ok: true, aviso: "Pessoa criada, mas o email do convite falhou. Usa «Reenviar convite»." });
      }
    } else if (b.acao === "convite") await enviarConvite(b.email);
    else if (b.acao === "ativo") await ativarMembroEquipa(b.email, b.ativo === true);
    else if (b.acao === "password") await definirPasswordAl("equipa", b.email, b.password);
    else return erro("Pedido inválido.");
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e?.publico) return erro(e.message);
    console.error("equipa AL:", e);
    return erro("Erro no servidor. Tenta de novo.", 500);
  }
}
