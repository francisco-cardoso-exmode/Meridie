import { NextResponse } from "next/server";
import {
  registarProprietario,
  autenticarAl,
  criarTokenRecuperacao,
  consumirTokenRecuperacao,
  definirPasswordAl,
  criarTokenAcesso,
  marcarEmailConfirmado,
  VALIDADE_CONVITE_MS,
  normalizaEmail,
  PASSWORD_MAX,
} from "@/lib/al/contas";
import { validaPassword } from "@/lib/utilizadores";
import { criarSessaoAl, porCookieAl, tirarCookieAl, apagarSessaoAl, tokenDoCookie } from "@/lib/al/sessoes";
import { emailRecuperacao, avisarEquipa, emailBoasVindasProprietario } from "@/lib/al/emails";
import { getProprietario } from "@/lib/al/auth";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";
import { SITE_URL } from "@/lib/site";
import { caminho } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/**
 * Contas das apps do Alojamento Local (proprietário e equipa), num só sítio:
 * { acao: "registo" | "login" | "logout" | "recuperar" | "repor", papel, ... }.
 * - registo: só proprietários (a equipa é criada no backoffice);
 * - login: 10 tentativas / 15 min por IP e por email;
 * - recuperar: resposta sempre igual (não revela se o email existe);
 * - repor: gasta o link de uso único, define a password e abre a sessão
 *   (no proprietário, conta também como email confirmado);
 * - confirmacao: reenvia o email de boas-vindas/confirmação (com sessão).
 */

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });
const PAPEIS = ["proprietario", "equipa"];
const MUITAS = "Demasiadas tentativas. Tenta de novo daqui a 15 minutos.";

// Página de entrada/reposição de cada app.
const appDe = (papel, lang) => (papel === "equipa" ? "/equipa" : caminho(lang, "/proprietario"));

async function enviarBoasVindas({ email, nome, lang }) {
  const t = await criarTokenAcesso("proprietario", email, { tipo: "confirmar", validadeMs: VALIDADE_CONVITE_MS, limitar: false });
  if (!t) return;
  await emailBoasVindasProprietario({
    para: email,
    nome,
    lang,
    linkConfirmar: `${SITE_URL}${caminho(lang, "/proprietario/confirmar")}?t=${t}`,
    linkEntrar: `${SITE_URL}${caminho(lang, "/proprietario/entrar")}`,
  });
}

export async function POST(request) {
  const b = (await request.json().catch(() => null)) || {};
  const papel = PAPEIS.includes(b.papel) ? b.papel : null;
  if (!papel) return erro("Pedido inválido.");
  const lang = b.lang === "en" ? "en" : "pt";
  const ip = ipDe(request);
  const email = normalizaEmail(b.email);

  try {
    if (b.acao === "logout") {
      await apagarSessaoAl(papel, await tokenDoCookie(papel)).catch(() => {});
      return tirarCookieAl(NextResponse.json({ ok: true }), papel);
    }

    if (b.acao === "registo") {
      if (papel !== "proprietario") return erro("Pedido inválido.");
      if (!(await dentroDoLimite(`al-registo:${ip}`, 5, 60 * 60))) return erro(MUITAS, 429);
      if (b.website) return NextResponse.json({ ok: true }); // honeypot
      const e = await registarProprietario({
        nome: b.nome,
        email,
        telefone: b.telefone,
        password: b.password,
        nif: b.nif,
        plano: b.plano,
      });
      const token = await criarSessaoAl("proprietario", e);
      await enviarBoasVindas({ email: e, nome: b.nome, lang }).catch((x) => console.error("boas-vindas:", x?.message || x));
      avisarEquipa({
        assunto: `Novo proprietário: ${String(b.nome || "").slice(0, 80)}`,
        titulo: "Novo proprietário registado",
        campos: [["Nome", b.nome], ["Email", e], ["Telefone", b.telefone], ["Plano preferido", b.plano]],
        link: `${SITE_URL}/admin/alojamento/proprietarios`,
      }).catch((x) => console.error("aviso registo:", x?.message || x));
      return porCookieAl(NextResponse.json({ ok: true }), "proprietario", token);
    }

    if (b.acao === "login") {
      const okIp = await dentroDoLimite(`al-login-ip:${papel}:${ip}`, 10, 15 * 60);
      const okEmail = email ? await dentroDoLimite(`al-login-email:${papel}:${email}`, 10, 15 * 60) : true;
      if (!okIp || !okEmail) return erro(MUITAS, 429);
      const password = typeof b.password === "string" ? b.password : "";
      if (!email || !password || password.length > PASSWORD_MAX) return erro("Email ou password incorretos.", 401);
      const u = await autenticarAl(papel, email, password);
      if (!u) return erro("Email ou password incorretos.", 401);
      return porCookieAl(NextResponse.json({ ok: true }), papel, await criarSessaoAl(papel, u.email));
    }

    if (b.acao === "recuperar") {
      const RESPOSTA = NextResponse.json({
        ok: true,
        msg: "Se existir uma conta com este email, vais receber um link dentro de instantes.",
      });
      const okIp = await dentroDoLimite(`al-recuperar-ip:${ip}`, 5, 15 * 60);
      const okEmail = email ? await dentroDoLimite(`al-recuperar-email:${papel}:${email}`, 5, 60 * 60) : false;
      if (okIp && okEmail) {
        const token = await criarTokenRecuperacao(papel, email);
        if (token)
          await emailRecuperacao({ para: email, lang, link: `${SITE_URL}${appDe(papel, lang)}/repor?t=${token}` });
      }
      return RESPOSTA;
    }

    if (b.acao === "repor") {
      if (!(await dentroDoLimite(`al-repor-ip:${ip}`, 20, 15 * 60))) return erro(MUITAS, 429);
      try {
        validaPassword(b.password);
      } catch (e) {
        return erro(e.message);
      }
      const e = await consumirTokenRecuperacao(papel, b.t);
      if (!e) return erro("Este link já foi usado ou expirou. Pede um novo.");
      await definirPasswordAl(papel, e, b.password);
      // O link chegou ao email: fica confirmado.
      if (papel === "proprietario") await marcarEmailConfirmado(e);
      return porCookieAl(NextResponse.json({ ok: true }), papel, await criarSessaoAl(papel, e));
    }

    if (b.acao === "confirmacao") {
      const p = papel === "proprietario" ? await getProprietario() : null;
      if (!p) return erro("A tua sessão expirou. Entra outra vez.", 401);
      if (p.emailConfirmado !== false) return NextResponse.json({ ok: true, msg: "O teu email já está confirmado." });
      if (!(await dentroDoLimite(`al-confirmacao:${p.email}`, 3, 60 * 60))) return erro(MUITAS, 429);
      await enviarBoasVindas({ email: p.email, nome: p.nome, lang });
      return NextResponse.json({ ok: true, msg: "Enviámos-te um novo email. Abre-o e carrega em «Confirmar o meu email»." });
    }

    return erro("Pedido inválido.");
  } catch (e) {
    if (e?.publico) return erro(e.message);
    console.error("conta AL:", e);
    return erro("Erro no servidor. Tenta de novo.", 500);
  }
}
