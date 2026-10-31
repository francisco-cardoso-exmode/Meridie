import crypto from "crypto";
import { getDb } from "@/lib/mongodb";

/**
 * Sessões do backoffice (coleção "sessoes"). O cookie leva um token aleatório
 * (32 bytes em hex); na base só fica o sha256 do token, o email do utilizador,
 * a origem da sessão e a validade. Um índice TTL apaga as expiradas.
 *
 * origem: "password" (email + password), "link" (link de recuperação) ou
 * "global" (password de emergência ADMIN_PASSWORD — email vazio).
 */

export const NOME_COOKIE = "meridie_admin";
export const VALIDADE_SEG = 60 * 60 * 8; // 8 horas
export const formatoValido = (t) => typeof t === "string" && /^[a-f0-9]{64}$/.test(t);

const hash = (t) => crypto.createHash("sha256").update(t).digest("hex");

let indicesCriados = false;

async function colecao() {
  const col = (await getDb()).collection("sessoes");
  if (!indicesCriados) {
    await col.createIndex({ expiraEm: 1 }, { expireAfterSeconds: 0 });
    await col.createIndex({ hash: 1 }, { unique: true });
    await col.createIndex({ email: 1 });
    indicesCriados = true;
  }
  return col;
}

// Cria a sessão e devolve o token (em claro) a pôr no cookie.
export async function criarSessao(email, origem) {
  const token = crypto.randomBytes(32).toString("hex");
  const agora = Date.now();
  await (await colecao()).insertOne({
    hash: hash(token),
    email: email || "",
    origem,
    criadoEm: new Date(agora),
    expiraEm: new Date(agora + VALIDADE_SEG * 1000),
  });
  return token;
}

// Devolve { email, origem, criadoEm, hash } se o token for de uma sessão
// válida; senão null. Se a base falhar, devolve null (fecha, não abre).
export async function validarSessao(token) {
  if (!formatoValido(token)) return null;
  try {
    const s = await (await colecao()).findOne({ hash: hash(token), expiraEm: { $gt: new Date() } });
    if (!s) return null;
    return { email: s.email || "", origem: s.origem, criadoEm: s.criadoEm, hash: s.hash };
  } catch (e) {
    console.error("validar sessão:", e);
    return null;
  }
}

export async function apagarSessao(token) {
  if (!formatoValido(token)) return;
  await (await colecao()).deleteOne({ hash: hash(token) });
}

// Termina todas as sessões de um email (exceto, opcionalmente, a atual).
export async function apagarSessoesDe(email, excetoHash) {
  if (!email) return;
  const filtro = { email };
  if (excetoHash) filtro.hash = { $ne: excetoHash };
  await (await colecao()).deleteMany(filtro);
}
