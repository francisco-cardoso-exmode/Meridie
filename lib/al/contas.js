import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { hashPassword, confere, validaPassword, normalizaEmail, PASSWORD_MAX } from "@/lib/utilizadores";
import { apagarSessoesAlDe } from "@/lib/al/sessoes";
import { PLANOS } from "@/lib/al/regras";

/**
 * Contas das apps do Alojamento Local:
 * - "proprietario" → coleção al_proprietarios (registo aberto no site);
 * - "equipa" → coleção al_equipa (criadas no backoffice; podem ser desativadas).
 * As passwords usam o mesmo scrypt + salt do backoffice (lib/utilizadores.js).
 *
 * A equipa tem coleção própria (e não um "papel" nos utilizadores do
 * backoffice): quem faz inspeções no telemóvel nunca ganha acesso ao
 * backoffice por engano, e as rotas /api/admin continuam a só aceitar a
 * sessão de admin, sem verificações de papel espalhadas.
 */

export { PASSWORD_MAX, normalizaEmail };

const COLECAO = { proprietario: "al_proprietarios", equipa: "al_equipa" };
export const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
const texto = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const indices = {};
async function colecao(papel) {
  const nome = COLECAO[papel];
  if (!nome) throw new Error("papel inválido");
  const col = (await getDb()).collection(nome);
  if (!indices[papel]) {
    await col.createIndex({ email: 1 }, { unique: true }).catch((e) => console.error(`${nome}: índice`, e.message));
    indices[papel] = true;
  }
  return col;
}

// Erro com mensagem para mostrar a quem usa a app (as outras ficam no log).
export const falha = (msg) => Object.assign(new Error(msg), { publico: true });
function validaPasswordAl(p) {
  try {
    validaPassword(p);
  } catch (e) {
    throw falha(e.message);
  }
}

const semHash = ({ passwordHash, _id, ...resto }) => ({ ...resto, id: String(_id), temPassword: !!passwordHash });

// ───────── Proprietários ─────────

export async function registarProprietario({ nome, email, telefone, password, nif, plano }) {
  const e = normalizaEmail(email);
  if (!texto(nome)) throw falha("Indica o teu nome.");
  if (!emailValido(e)) throw falha("Email inválido.");
  validaPasswordAl(password);
  const col = await colecao("proprietario");
  try {
    await col.insertOne({
      nome: texto(nome, 120),
      email: e,
      telefone: texto(telefone, 40),
      nif: texto(nif, 20),
      plano: PLANOS.includes(plano) ? plano : "gestao",
      passwordHash: await hashPassword(password),
      // Confirmado pelo link do email de boas-vindas (ou ao repor a password
      // pelo email). Sem isto não liga a conta bancária (recebimentos).
      emailConfirmado: false,
      criadoEm: new Date(),
    });
  } catch (err) {
    if (err?.code === 11000) throw falha("Já existe uma conta com esse email. Entra ou recupera a password.");
    throw err;
  }
  return e;
}

export async function marcarEmailConfirmado(email) {
  await (await colecao("proprietario")).updateOne(
    { email: normalizaEmail(email), emailConfirmado: { $ne: true } },
    { $set: { emailConfirmado: true, emailConfirmadoEm: new Date() } }
  );
}

export async function proprietarioPorEmail(email) {
  const u = await (await colecao("proprietario")).findOne({ email: normalizaEmail(email) });
  return u ? semHash(u) : null;
}

export async function proprietarioPorId(id) {
  if (typeof id !== "string" || !/^[a-f0-9]{24}$/.test(id)) return null;
  const u = await (await colecao("proprietario")).findOne({ _id: new ObjectId(id) });
  return u ? semHash(u) : null;
}

export async function listarProprietarios() {
  const lista = await (await colecao("proprietario")).find({}).sort({ criadoEm: -1 }).toArray();
  return lista.map(semHash);
}

export async function atualizarPerfilProprietario(email, { nome, telefone, nif, plano }) {
  const set = {};
  if (nome !== undefined) {
    if (!texto(nome)) throw falha("Indica o teu nome.");
    set.nome = texto(nome, 120);
  }
  if (telefone !== undefined) set.telefone = texto(telefone, 40);
  if (nif !== undefined) set.nif = texto(nif, 20);
  if (plano !== undefined && PLANOS.includes(plano)) set.plano = plano;
  await (await colecao("proprietario")).updateOne({ email: normalizaEmail(email) }, { $set: set });
}

// ───────── Equipa ─────────

export async function listarEquipa() {
  const lista = await (await colecao("equipa")).find({}).sort({ nome: 1 }).toArray();
  return lista.map(semHash);
}

export async function membroEquipa(email) {
  const u = await (await colecao("equipa")).findOne({ email: normalizaEmail(email) });
  return u ? semHash(u) : null;
}

/**
 * Cria a pessoa da equipa. Sem password, a conta fica à espera do convite:
 * a própria pessoa define a password pelo link que recebe por email.
 */
export async function criarMembroEquipa({ nome, email, password }) {
  const e = normalizaEmail(email);
  if (!texto(nome)) throw falha("Indica o nome.");
  if (!emailValido(e)) throw falha("Email inválido.");
  if (password) validaPasswordAl(password);
  try {
    await (await colecao("equipa")).insertOne({
      nome: texto(nome, 120),
      email: e,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
      ativo: true,
      criadoEm: new Date(),
    });
  } catch (err) {
    if (err?.code === 11000) throw falha("Já existe alguém da equipa com esse email.");
    throw err;
  }
}

export async function ativarMembroEquipa(email, ativo) {
  const e = normalizaEmail(email);
  await (await colecao("equipa")).updateOne({ email: e }, { $set: { ativo: !!ativo } });
  if (!ativo) await apagarSessoesAlDe("equipa", e);
}

// ───────── Comum ─────────

/** Devolve { nome, email } se email + password estiverem certos (e a conta ativa). */
export async function autenticarAl(papel, email, password) {
  const u = await (await colecao(papel)).findOne({ email: normalizaEmail(email) });
  // confere() corre sempre o scrypt (hash falso se não houver conta): o tempo
  // de resposta não denuncia se o email existe.
  const ok = await confere(password, u?.passwordHash);
  if (!ok || !u || u.ativo === false) return null;
  return { nome: u.nome, email: u.email };
}

export async function definirPasswordAl(papel, email, password, excetoSessao) {
  validaPasswordAl(password);
  const e = normalizaEmail(email);
  const r = await (await colecao(papel)).updateOne(
    { email: e },
    { $set: { passwordHash: await hashPassword(password), passwordEm: new Date() } }
  );
  if (!r.matchedCount) throw falha("Conta não encontrada.");
  await apagarSessoesAlDe(papel, e, excetoSessao);
}

// ───────── Links por email: repor password e confirmar email ─────────
// tipo "repor" (recuperação 30 min; convite da equipa 7 dias) define a
// password e é de uso único; tipo "confirmar" só confirma o email.

const VALIDADE_MS = 30 * 60 * 1000;
export const VALIDADE_CONVITE_MS = 7 * 24 * 60 * 60 * 1000;
const hashT = (t) => crypto.createHash("sha256").update(t).digest("hex");
let indiceAcessos = false;

async function acessos() {
  const col = (await getDb()).collection("al_acessos");
  if (!indiceAcessos) {
    await col.createIndex({ expiraEm: 1 }, { expireAfterSeconds: 0 });
    indiceAcessos = true;
  }
  return col;
}

// Token (em claro) para o link, ou null se a conta não existe/está inativa
// ou se já foi pedido um link há menos de um minuto.
export function criarTokenRecuperacao(papel, email) {
  return criarTokenAcesso(papel, email);
}

// Convite/confirmação: sem o limite de um por minuto quando vem do backoffice
// ou do registo (`limitar: false`).
export async function criarTokenAcesso(papel, email, { tipo = "repor", validadeMs = VALIDADE_MS, limitar = true } = {}) {
  const e = normalizaEmail(email);
  const u = await (await colecao(papel)).findOne({ email: e }, { projection: { ativo: 1 } });
  if (!u || u.ativo === false) return null;
  const col = await acessos();
  const agora = Date.now();
  if (limitar && (await col.findOne({ papel, email: e, tipo: tipo === "repor" ? { $ne: "confirmar" } : tipo, criadoEm: { $gt: new Date(agora - 60000) } })))
    return null;
  if (tipo === "repor") await col.updateMany({ papel, email: e, usado: false, tipo: { $ne: "confirmar" } }, { $set: { usado: true } });
  const token = crypto.randomBytes(32).toString("hex");
  await col.insertOne({ hash: hashT(token), papel, email: e, tipo, criadoEm: new Date(agora), expiraEm: new Date(agora + validadeMs), usado: false });
  return token;
}

/** Link de confirmação do email do proprietário (pode abrir-se mais de uma vez). */
export async function confirmarEmailProprietario(token) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return null;
  const a = await (await acessos()).findOne({ hash: hashT(token), papel: "proprietario", tipo: "confirmar", expiraEm: { $gt: new Date() } });
  if (!a) return null;
  await marcarEmailConfirmado(a.email);
  return a.email;
}

// Gasta o token e devolve o email (ou null se inválido/usado/expirado).
export async function consumirTokenRecuperacao(papel, token) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return null;
  const r = await (await acessos()).findOneAndUpdate(
    { hash: hashT(token), papel, tipo: { $ne: "confirmar" }, usado: false, expiraEm: { $gt: new Date() } },
    { $set: { usado: true, usadoEm: new Date() } }
  );
  return r?.email || null;
}
