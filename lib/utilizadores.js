import crypto from "crypto";
import { promisify } from "util";
import { getDb } from "@/lib/mongodb";

/**
 * Utilizadores do backoffice (coleção "utilizadores"): nome, email e hash da
 * password (scrypt + salt). Quem não tem password definida entra pelo link de
 * "Esqueci-me da password" e define-a depois em Utilizadores.
 *
 * Se a coleção estiver vazia, é criado o utilizador inicial (responsável
 * técnico do site). A password global ADMIN_PASSWORD continua a funcionar.
 */

const scrypt = promisify(crypto.scrypt);
const INICIAL = { nome: "Francisco Cardoso", email: "francisco.cardoso@expertmode.pt" };

export const normalizaEmail = (e) => String(e || "").trim().toLowerCase();
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const h = (await scrypt(password, salt, 64)).toString("hex");
  return `${salt}:${h}`;
}

async function confere(password, guardado) {
  if (!guardado || !password) return false;
  const [salt, h] = guardado.split(":");
  const calc = await scrypt(password, salt, 64);
  const esperado = Buffer.from(h, "hex");
  return esperado.length === calc.length && crypto.timingSafeEqual(esperado, calc);
}

async function colecao() {
  const col = (await getDb()).collection("utilizadores");
  if ((await col.countDocuments({}, { limit: 1 })) === 0) {
    await col.insertOne({ ...INICIAL, passwordHash: null, criadoEm: new Date() });
  }
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
  if (password && password.length < 8) throw new Error("A password tem de ter pelo menos 8 caracteres.");
  const col = await colecao();
  if (await col.findOne({ email: e })) throw new Error("Já existe um utilizador com esse email.");
  await col.insertOne({
    nome: String(nome || "").trim(),
    email: e,
    passwordHash: password ? await hashPassword(password) : null,
    criadoEm: new Date(),
  });
}

export async function apagarUtilizador(email) {
  const col = await colecao();
  if ((await col.countDocuments()) <= 1) throw new Error("Não é possível apagar o último utilizador.");
  await col.deleteOne({ email: normalizaEmail(email) });
}

export async function definirPassword(email, password) {
  if (!password || password.length < 8) throw new Error("A password tem de ter pelo menos 8 caracteres.");
  const col = await colecao();
  const r = await col.updateOne(
    { email: normalizaEmail(email) },
    { $set: { passwordHash: await hashPassword(password), passwordEm: new Date() } }
  );
  if (!r.matchedCount) throw new Error("Utilizador não encontrado.");
}

// Devolve o utilizador (sem hash) se email + password estiverem certos.
export async function autenticar(email, password) {
  const col = await colecao();
  const u = await col.findOne({ email: normalizaEmail(email) });
  if (!u || !(await confere(password, u.passwordHash))) return null;
  return { nome: u.nome, email: u.email };
}
