import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { conflitos, noitesEntre, ESTADOS_OCUPAM, ORIGENS, dataValida, moedaDe } from "@/lib/al/regras";
import { pagamentoInicial } from "@/lib/pagamentos";
import { criarTarefasDaReserva, cancelarTarefasDaReserva } from "@/lib/al/tarefas";

/**
 * Reservas do Alojamento Local (coleção "al_reservas").
 * - Datas "AAAA-MM-DD"; `valor` = valor da estadia (sem limpeza nem taxa turística).
 * - O hóspede entra pela página /estadia/<token>: na base fica só o sha256
 *   do token (tokenHash); o token em claro só existe no email/no momento em
 *   que é gerado.
 * - Bloqueios do proprietário são reservas com `bloqueio: true` (ocupam o
 *   calendário, não contam nos ganhos e não têm hóspede).
 * - `moeda` = a da casa (EUR em Portugal, BRL no Brasil) e `pagamento` =
 *   { fornecedor, estado, referencia } — ver lib/pagamentos (ainda sem
 *   cobrança online: o estado fica "nao_iniciado").
 * - Confirmar verifica sobreposições com a casa "trancada" por uns segundos
 *   (dois pedidos ao mesmo tempo não confirmam datas sobrepostas).
 */

export const colReservas = async () => (await getDb()).collection("al_reservas");
const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");
export const idValido = (id) => typeof id === "string" && /^[a-f0-9]{24}$/.test(id);
const oid = (id) => (idValido(id) ? new ObjectId(id) : null);

const comId = ({ _id, tokenHash, ...r }) => ({ ...r, id: String(_id) });

// ───────── Tranca por casa ─────────

async function comTranca(casaSlug, fn) {
  const casas = (await getDb()).collection("al_casas");
  const agora = new Date();
  const ok = await casas.findOneAndUpdate(
    { slug: casaSlug, $or: [{ trancaAte: { $exists: false } }, { trancaAte: { $lt: agora } }] },
    { $set: { trancaAte: new Date(agora.getTime() + 15000) } }
  );
  if (!ok) return { erro: "A casa está a ser atualizada noutro pedido. Tenta de novo daqui a uns segundos." };
  try {
    return await fn();
  } finally {
    await casas.updateOne({ slug: casaSlug }, { $unset: { trancaAte: "" } }).catch(() => {});
  }
}

async function reservasQueOcupam(casaSlug, entrada, saida) {
  return (await colReservas())
    .find({ casaSlug, estado: { $in: ESTADOS_OCUPAM }, entrada: { $lt: saida }, saida: { $gt: entrada } })
    .toArray();
}

// ───────── Criar ─────────

/** Pedido do site (estado "pedido"). `casa` já validada como publicada. */
export async function criarPedido({ casa, hospede, entrada, saida, hospedes, mensagem, lang }) {
  const noites = noitesEntre(entrada, saida);
  const doc = {
    casaSlug: casa.slug,
    casaTitulo: casa.titulo,
    hospede,
    hospedes,
    mensagem,
    entrada,
    saida,
    noites,
    valor: Math.round(noites * (casa.precoNoite || 0) * 100) / 100,
    limpeza: casa.limpeza || 0,
    moeda: moedaDe(casa),
    pais: casa.pais || "PT",
    pagamento: pagamentoInicial(casa, "direta"),
    origem: "direta",
    estado: "pedido",
    idioma: lang === "en" ? "en" : "pt",
    criadoEm: new Date(),
  };
  const r = await (await colReservas()).insertOne(doc);
  return String(r.insertedId);
}

/**
 * Reserva criada no backoffice (ex.: vinda do Airbnb) ou bloqueio do
 * proprietário. Fica "confirmada" (verifica sobreposições) ou "pedido".
 * Devolve { id, token? } ou { erro }.
 */
export async function criarReservaManual({ casa, hospede, entrada, saida, valor, limpeza, origem, confirmar, bloqueio, nota, idioma, criadoPor }) {
  if (!dataValida(entrada) || !dataValida(saida) || entrada >= saida) return { erro: "Datas inválidas." };
  const doc = {
    casaSlug: casa.slug,
    casaTitulo: casa.titulo,
    hospede: bloqueio ? null : hospede,
    entrada,
    saida,
    noites: noitesEntre(entrada, saida),
    valor: bloqueio ? 0 : Math.max(0, Number(valor) || 0),
    limpeza: bloqueio ? 0 : Math.max(0, Number(limpeza) || 0),
    origem: ORIGENS.includes(origem) ? origem : "manual",
    moeda: moedaDe(casa),
    pais: casa.pais || "PT",
    pagamento: bloqueio ? null : pagamentoInicial(casa, ORIGENS.includes(origem) ? origem : "manual"),
    estado: confirmar || bloqueio ? "confirmada" : "pedido",
    bloqueio: !!bloqueio,
    nota: nota || "",
    idioma: idioma === "en" ? "en" : "pt",
    criadoPor,
    criadoEm: new Date(),
  };
  if (doc.estado !== "confirmada") {
    const r = await (await colReservas()).insertOne(doc);
    return { id: String(r.insertedId) };
  }
  return comTranca(casa.slug, async () => {
    const c = conflitos(await reservasQueOcupam(casa.slug, entrada, saida), doc);
    if (c.length) return { erro: `Datas ocupadas (${c.map((x) => `${x.entrada} → ${x.saida}`).join(", ")}).` };
    let token = null;
    if (!bloqueio) {
      token = crypto.randomBytes(24).toString("hex");
      doc.tokenHash = hashToken(token);
      doc.confirmadaEm = new Date();
    }
    const r = await (await colReservas()).insertOne(doc);
    const id = String(r.insertedId);
    if (!bloqueio) await criarTarefasDaReserva({ ...doc, id });
    return { id, token };
  });
}

// ───────── Mudar estado ─────────

/** Confirma um pedido: verifica sobreposições, gera o link do hóspede e as tarefas. */
export async function confirmarReserva(id) {
  const col = await colReservas();
  const r = await col.findOne({ _id: oid(id) });
  if (!r) return { erro: "Reserva não encontrada." };
  if (r.estado !== "pedido") return { erro: "Só se confirmam pedidos." };
  return comTranca(r.casaSlug, async () => {
    const c = conflitos(await reservasQueOcupam(r.casaSlug, r.entrada, r.saida), r, id);
    if (c.length) return { erro: `Datas ocupadas por outra reserva (${c.map((x) => `${x.entrada} → ${x.saida}`).join(", ")}).` };
    const token = crypto.randomBytes(24).toString("hex");
    const u = await col.updateOne(
      { _id: r._id, estado: "pedido" },
      { $set: { estado: "confirmada", tokenHash: hashToken(token), confirmadaEm: new Date() } }
    );
    if (!u.modifiedCount) return { erro: "A reserva mudou entretanto — recarrega." };
    await criarTarefasDaReserva({ ...r, id });
    return { token, reserva: comId(r) };
  });
}

export async function cancelarReserva(id, filtroExtra = {}) {
  const col = await colReservas();
  const r = await col.findOneAndUpdate(
    { _id: oid(id), estado: { $in: ["pedido", "confirmada"] }, ...filtroExtra },
    { $set: { estado: "cancelada", canceladaEm: new Date() }, $unset: { tokenHash: "" } }
  );
  if (!r) return { erro: "Reserva não encontrada ou já fechada." };
  await cancelarTarefasDaReserva(id);
  return { ok: true };
}

export async function concluirReserva(id) {
  const r = await (await colReservas()).updateOne({ _id: oid(id), estado: "confirmada" }, { $set: { estado: "concluida", concluidaEm: new Date() } });
  return r.modifiedCount ? { ok: true } : { erro: "Só se concluem reservas confirmadas." };
}

/** Gera um novo link para o hóspede (o antigo deixa de funcionar). */
export async function novoLinkHospede(id) {
  const token = crypto.randomBytes(24).toString("hex");
  const r = await (await colReservas()).findOneAndUpdate(
    { _id: oid(id), estado: { $in: ["confirmada", "concluida"] }, bloqueio: { $ne: true } },
    { $set: { tokenHash: hashToken(token) } }
  );
  return r ? { token, reserva: comId(r) } : { erro: "Só reservas confirmadas têm link." };
}

// ───────── Leituras ─────────

export async function reservaPorId(id) {
  const r = await (await colReservas()).findOne({ _id: oid(id) });
  return r ? comId(r) : null;
}

export async function listarReservas(filtro = {}, { limite = 500 } = {}) {
  const l = await (await colReservas()).find(filtro).sort({ entrada: -1 }).limit(limite).toArray();
  return l.map(comId);
}

/** Reserva do hóspede pelo token do link (null se inválido/cancelada). */
export async function reservaPorToken(token) {
  if (typeof token !== "string" || !/^[a-f0-9]{48}$/.test(token)) return null;
  const r = await (await colReservas()).findOne({ tokenHash: hashToken(token), estado: { $in: ESTADOS_OCUPAM } });
  return r ? comId(r) : null;
}

/** Problema reportado pelo hóspede (fica na reserva). */
export async function adicionarProblema(id, { texto, fotos }) {
  await (await colReservas()).updateOne(
    { _id: oid(id) },
    { $push: { problemas: { $each: [{ texto, fotos, criadoEm: new Date() }], $slice: -50 } } }
  );
}
