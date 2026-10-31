import crypto from "crypto";
import { promisify } from "util";
import { getDb } from "@/lib/mongodb";
import { apagarSessoesDe } from "@/lib/sessoes";

/**
 * Utilizadores do backoffice (coleção "utilizadores"): nome, email e hash da
 * password (scrypt + salt). Quem não tem password definida entra pelo link de
 * "Esqueci-me da password" e define-a depois em Utilizadores.
 *
 * Se a coleção estiver vazia, é criado o utilizador inicial (responsável
 * técnico do site). A password global ADMIN_PASSWORD continua a funcionar
 * como acesso de emergência (ver app/api/admin/login).
 */

const scrypt = promisify(crypto.scrypt);
const INICIAL = { nome: "Francisco Cardoso", email: "francisco.cardoso@expertmode.pt" };

export const normalizaEmail = (e) => String(e || "").trim().toLowerCase();
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Limite ao tamanho da password (o scrypt de textos enormes é caro).
export const PASSWORD_MAX = 200;

export function validaPassword(password) {
  if (typeof password !== "string" || password.length < 8)
    throw new Error("A password tem de ter pelo menos 8 caracteres.");
  if (password.length > PASSWORD_MAX)
    throw new Error(`A password não pode ter mais de ${PASSWORD_MAX} caracteres.`);
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const h = (await scrypt(password, salt, 64)).toString("hex");
  return `${salt}:${h}`;
}

// Hash falso para quem não existe/não tem password: o scrypt corre na mesma e
// o tempo de resposta não denuncia se o email é de um utilizador.
const HASH_FALSO = `${"0".repeat(32)}:${"0".repeat(128)}`;

export async function confere(password, guardado) {
  if (typeof password !== "string" || !password || password.length > PASSWORD_MAX) return false;
  const [salt, h] = (guardado || HASH_FALSO).split(":");
  const calc = await scrypt(password, salt, 64);
  const esperado = Buffer.from(h, "hex");
  const ok = esperado.length === calc.length && crypto.timingSafeEqual(esperado, calc);
  return ok && !!guardado;
}

// Índice único no email e utilizador inicial — uma vez por processo. O
// upsert com $setOnInsert é idempotente: dois pedidos em simultâneo não
// criam o utilizador inicial duas vezes.
let preparado = null;

async function preparar(col) {
  try {
    await col.createIndex({ email: 1 }, { unique: true });
  } catch (e) {
    console.error("utilizadores: índice único do email:", e.message);
  }
  if ((await col.countDocuments({}, { limit: 1 })) === 0) {
    await col
      .updateOne(
        { email: INICIAL.email },
        { $setOnInsert: { ...INICIAL, passwordHash: null, criadoEm: new Date() } },
        { upsert: true }
      )
      .catch((e) => {
        if (e?.code !== 11000) throw e;
      });
  }
}

async function colecao() {
  const col = (await getDb()).collection("utilizadores");
  if (!preparado) {
    preparado = preparar(col).catch((e) => {
      preparado = null;
      throw e;
    });
  }
  await preparado;
  return col;
}

// Lista sem o hash da password.
export async function listarUtilizadores() {
  const col = await colecao();
  const lista = await col.find({}, { projection: { _id: 0 } }).sort({ criadoEm: 1 }).toArray();
  return lista.map(({ passwordHash, ...u }) => ({ ...u, temPassword: !!passwordHash }));
}

export async function emailsUtilizadores() {
  return (await listarUtilizadores()).map((u) => u.email);
}

export async function criarUtilizador({ nome, email, password }) {
  const e = normalizaEmail(email);
  if (!emailValido(e)) throw new Error("Email inválido.");
  if (password) validaPassword(password);
  const col = await colecao();
  if (await col.findOne({ email: e })) throw new Error("Já existe um utilizador com esse email.");
  try {
    await col.insertOne({
      nome: String(nome || "").trim(),
      email: e,
      passwordHash: password ? await hashPassword(password) : null,
      criadoEm: new Date(),
    });
  } catch (err) {
    if (err?.code === 11000) throw new Error("Já existe um utilizador com esse email.");
    throw err;
  }
}

export async function existeUtilizador(email) {
  const col = await colecao();
  return !!(await col.findOne({ email: normalizaEmail(email) }, { projection: { _id: 1 } }));
}

export async function apagarUtilizador(email) {
  const col = await colecao();
  if ((await col.countDocuments()) <= 1) throw new Error("Não é possível apagar o último utilizador.");
  const e = normalizaEmail(email);
  await col.deleteOne({ email: e });
  // Quem perde o acesso perde também as sessões abertas.
  await apagarSessoesDe(e);
}

// Muda a password e termina as outras sessões desse utilizador (a sessão
// com hash excetoSessao, a de quem está a mudar, mantém-se).
export async function definirPassword(email, password, excetoSessao) {
  validaPassword(password);
  const col = await colecao();
  const r = await col.updateOne(
    { email: normalizaEmail(email) },
    { $set: { passwordHash: await hashPassword(password), passwordEm: new Date() } }
  );
  if (!r.matchedCount) throw new Error("Utilizador não encontrado.");
  await apagarSessoesDe(normalizaEmail(email), excetoSessao);
}

// O utilizador tem password definida? (quem não tem entrou pelo link).
export async function temPassword(email) {
  const col = await colecao();
  const u = await col.findOne({ email: normalizaEmail(email) }, { projection: { passwordHash: 1 } });
  return !!u?.passwordHash;
}

// Devolve o utilizador (sem hash) se email + password estiverem certos.
export async function autenticar(email, password) {
  const col = await colecao();
  const u = await col.findOne({ email: normalizaEmail(email) });
  // confere() corre sempre o scrypt (com um hash falso se não houver
  // utilizador), para o tempo de resposta ser igual nos dois casos.
  if (!(await confere(password, u?.passwordHash)) || !u) return null;
  return { nome: u.nome, email: u.email };
}
