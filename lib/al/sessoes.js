import crypto from "crypto";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";

/**
 * Sessões das apps do Alojamento Local — proprietários e equipa — no mesmo
 * modelo das do backoffice (lib/sessoes.js): o cookie leva um token
 * aleatório; na base fica só o sha256, o papel, o email e a validade (TTL).
 *
 * Coleção própria ("al_sessoes") e um cookie por papel: uma sessão de
 * proprietário nunca serve na app da equipa nem no backoffice, e vice-versa.
 */

export const PAPEIS = {
  proprietario: { cookie: "meridie_prop", validadeSeg: 60 * 60 * 24 * 30 }, // 30 dias (app no telemóvel)
  equipa: { cookie: "meridie_equipa", validadeSeg: 60 * 60 * 24 * 14 }, // 14 dias
};

const formatoValido = (t) => typeof t === "string" && /^[a-f0-9]{64}$/.test(t);
const hash = (t) => crypto.createHash("sha256").update(t).digest("hex");

let indicesCriados = false;

async function colecao() {
  const col = (await getDb()).collection("al_sessoes");
  if (!indicesCriados) {
    await col.createIndex({ expiraEm: 1 }, { expireAfterSeconds: 0 });
    await col.createIndex({ hash: 1 }, { unique: true });
    await col.createIndex({ papel: 1, email: 1 });
    indicesCriados = true;
  }
  return col;
}

export async function criarSessaoAl(papel, email) {
  if (!PAPEIS[papel]) throw new Error("papel inválido");
  const token = crypto.randomBytes(32).toString("hex");
  const agora = Date.now();
  await (await colecao()).insertOne({
    hash: hash(token),
    papel,
    email,
    criadoEm: new Date(agora),
    expiraEm: new Date(agora + PAPEIS[papel].validadeSeg * 1000),
  });
  return token;
}

// { email, hash } se o token for de uma sessão válida DESTE papel; senão null.
export async function validarSessaoAl(papel, token) {
  if (!PAPEIS[papel] || !formatoValido(token)) return null;
  try {
    const s = await (await colecao()).findOne({ hash: hash(token), papel, expiraEm: { $gt: new Date() } });
    return s ? { email: s.email, hash: s.hash } : null;
  } catch (e) {
    console.error("validar sessão AL:", e?.message || e);
    return null;
  }
}

export async function apagarSessaoAl(papel, token) {
  if (!formatoValido(token)) return;
  await (await colecao()).deleteOne({ hash: hash(token), papel });
}

export async function apagarSessoesAlDe(papel, email, excetoHash) {
  const filtro = { papel, email };
  if (excetoHash) filtro.hash = { $ne: excetoHash };
  await (await colecao()).deleteMany(filtro);
}

// Sessão do pedido atual para um papel (lê o cookie desse papel).
export async function sessaoAtual(papel) {
  const store = await cookies();
  return validarSessaoAl(papel, store.get(PAPEIS[papel].cookie)?.value);
}

export function porCookieAl(res, papel, token) {
  res.cookies.set(PAPEIS[papel].cookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PAPEIS[papel].validadeSeg,
  });
  return res;
}

export function tirarCookieAl(res, papel) {
  res.cookies.set(PAPEIS[papel].cookie, "", { path: "/", maxAge: 0 });
  return res;
}

export async function tokenDoCookie(papel) {
  return (await cookies()).get(PAPEIS[papel].cookie)?.value;
}
