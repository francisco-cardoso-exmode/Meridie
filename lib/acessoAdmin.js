import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import { emailsUtilizadores } from "@/lib/utilizadores";

/**
 * Recuperação de acesso ao backoffice ("Esqueci-me da password"): envia um
 * link de entrada de uso único para um email autorizado.
 *
 * Emails autorizados: os utilizadores do backoffice (área Utilizadores), mais
 * os da variável ADMIN_EMAILS (separados por vírgula), se existir.
 * Na base só fica o hash do token; o link expira em 30 min e serve uma vez.
 */

const VALIDADE_MS = 30 * 60 * 1000;
const INTERVALO_MS = 60 * 1000; // 1 pedido por minuto por email

const hash = (t) => crypto.createHash("sha256").update(t).digest("hex");
const normaliza = (e) => String(e || "").trim().toLowerCase();

export async function emailsAutorizados() {
  const env = (process.env.ADMIN_EMAILS || "").split(",");
  return [...new Set([...(await emailsUtilizadores()), ...env].map(normaliza).filter(Boolean))];
}

// Coleção dos tokens, com índice TTL: a base apaga os expirados sozinha.
let indiceCriado = false;

async function colecao() {
  const col = (await getDb()).collection("admin_acessos");
  if (!indiceCriado) {
    await col.createIndex({ expiraEm: 1 }, { expireAfterSeconds: 0 });
    indiceCriado = true;
  }
  return col;
}

// Devolve o token (em claro) a pôr no link, ou null se o email não for
// autorizado ou se já tiver sido pedido um link há menos de um minuto.
// Um link novo anula os anteriores ainda por usar desse email.
export async function criarTokenAcesso(email) {
  const e = normaliza(email);
  if (!e || !(await emailsAutorizados()).includes(e)) return null;
  const col = await colecao();
  const agora = Date.now();
  if (await col.findOne({ email: e, criadoEm: { $gt: new Date(agora - INTERVALO_MS) } })) return null;
  await col.updateMany({ email: e, usado: false }, { $set: { usado: true, anuladoEm: new Date(agora) } });
  const token = crypto.randomBytes(32).toString("hex");
  await col.insertOne({
    hash: hash(token),
    email: e,
    criadoEm: new Date(agora),
    expiraEm: new Date(agora + VALIDADE_MS),
    usado: false,
  });
  return token;
}

// Marca o token como usado; devolve o email se era válido (senão null).
export async function consumirTokenAcesso(token) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return null;
  const col = await colecao();
  const r = await col.findOneAndUpdate(
    { hash: hash(token), usado: false, expiraEm: { $gt: new Date() } },
    { $set: { usado: true, usadoEm: new Date() } }
  );
  return r?.email || null;
}
