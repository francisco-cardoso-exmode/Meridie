import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { hojeLisboa, somaDias, TIPOS_TAREFA, dataValida } from "@/lib/al/regras";

/**
 * Tarefas da equipa (coleção "al_tarefas"): inspeção de entrada, inspeção de
 * saída e limpeza. O relatório (fotos e estado por divisão) fica na própria
 * tarefa. O relatório de uma inspeção de ENTRADA concluída é mostrado ao
 * hóspede dessa reserva e ao proprietário ("estado da casa antes de entrar").
 *
 * Quem da equipa vê o quê: as tarefas atribuídas a si e as sem atribuição.
 */

export const colTarefas = async () => (await getDb()).collection("al_tarefas");
const oid = (id) => (typeof id === "string" && /^[a-f0-9]{24}$/.test(id) ? new ObjectId(id) : null);
const comId = ({ _id, ...t }) => ({ ...t, id: String(_id) });

/** Cria (uma vez) as inspeções de entrada e de saída de uma reserva confirmada. */
export async function criarTarefasDaReserva(r) {
  const col = await colTarefas();
  const base = { casaSlug: r.casaSlug, casaTitulo: r.casaTitulo || "", reservaId: String(r.id ?? r._id), atribuidaA: "", estado: "pendente" };
  for (const [tipo, data] of [["inspecao_entrada", r.entrada], ["inspecao_saida", r.saida]]) {
    await col.updateOne(
      { reservaId: base.reservaId, tipo },
      { $setOnInsert: { ...base, tipo, data, criadoEm: new Date() } },
      { upsert: true }
    );
  }
}

/** Reserva cancelada: apaga as tarefas ainda por fazer. */
export async function cancelarTarefasDaReserva(reservaId) {
  await (await colTarefas()).deleteMany({ reservaId: String(reservaId), estado: "pendente" });
}

export async function criarTarefa({ tipo, casa, data, atribuidaA, reservaId }) {
  if (!TIPOS_TAREFA.includes(tipo)) return { erro: "Tipo inválido." };
  if (!dataValida(data)) return { erro: "Data inválida." };
  const r = await (await colTarefas()).insertOne({
    tipo,
    casaSlug: casa.slug,
    casaTitulo: casa.titulo || "",
    reservaId: reservaId || null,
    data,
    atribuidaA: atribuidaA || "",
    estado: "pendente",
    criadoEm: new Date(),
  });
  return { id: String(r.insertedId) };
}

/** Lista "Hoje" de um membro da equipa: atrasadas, hoje e amanhã (suas ou por atribuir). */
export async function tarefasDaEquipa(email) {
  const hoje = hojeLisboa();
  const l = await (await colTarefas())
    .find({
      atribuidaA: { $in: [email, ""] },
      $or: [{ estado: { $ne: "concluida" }, data: { $lte: somaDias(hoje, 1) } }, { estado: "concluida", data: hoje }],
    })
    .sort({ data: 1, criadoEm: 1 })
    .limit(200)
    .toArray();
  return { hoje, tarefas: l.map(comId) };
}

export async function tarefaPorId(id) {
  const t = await (await colTarefas()).findOne({ _id: oid(id) });
  return t ? comId(t) : null;
}

/** A tarefa, se este membro da equipa a puder ver (sua ou sem atribuição). */
export async function tarefaDaEquipa(id, email) {
  const t = await tarefaPorId(id);
  return t && (t.atribuidaA === "" || t.atribuidaA === email) ? t : null;
}

export async function listarTarefas(filtro = {}) {
  const l = await (await colTarefas()).find(filtro).sort({ data: -1 }).limit(500).toArray();
  return l.map(comId);
}

export async function atribuirTarefa(id, email) {
  const r = await (await colTarefas()).updateOne({ _id: oid(id) }, { $set: { atribuidaA: email || "" } });
  return r.matchedCount > 0;
}

/** Começa a tarefa (fica atribuída a quem começou, se ainda não estava). */
export async function iniciarTarefa(id, email) {
  const col = await colTarefas();
  const r = await col.updateOne(
    { _id: oid(id), atribuidaA: { $in: [email, ""] }, estado: { $ne: "concluida" } },
    { $set: { atribuidaA: email, estado: "em_curso", iniciadaEm: new Date() } }
  );
  return r.matchedCount > 0;
}

/** Grava (substitui) o relatório de uma divisão. */
export async function guardarDivisao(id, email, divisao) {
  const col = await colTarefas();
  const t = await col.findOne({ _id: oid(id), atribuidaA: email, estado: "em_curso" });
  if (!t) return false;
  const lista = (t.relatorio?.porDivisao || []).filter((d) => d.divisao !== divisao.divisao);
  lista.push({ ...divisao, em: new Date() });
  await col.updateOne({ _id: t._id, estado: "em_curso" }, { $set: { "relatorio.porDivisao": lista } });
  return true;
}

/** Fecha a tarefa. Devolve a tarefa concluída (para os avisos) ou null. */
export async function concluirTarefa(id, email, observacoes) {
  const r = await (await colTarefas()).findOneAndUpdate(
    { _id: oid(id), atribuidaA: email, estado: "em_curso" },
    {
      $set: {
        estado: "concluida",
        "relatorio.observacoes": observacoes || "",
        "relatorio.concluidaEm": new Date(),
        "relatorio.feitoPor": email,
      },
    },
    { returnDocument: "after" }
  );
  return r ? comId(r) : null;
}

/** Relatórios concluídos das casas de um proprietário (mais recentes primeiro). */
export async function relatoriosDasCasas(slugs) {
  if (!slugs.length) return [];
  const l = await (await colTarefas())
    .find({ casaSlug: { $in: slugs }, estado: "concluida", tipo: { $in: ["inspecao_entrada", "inspecao_saida"] } })
    .sort({ data: -1 })
    .limit(100)
    .toArray();
  return l.map(comId);
}

/** Relatório da inspeção de entrada de uma reserva (para o hóspede), se concluído. */
export async function relatorioEntrada(reservaId) {
  const t = await (await colTarefas()).findOne({ reservaId: String(reservaId), tipo: "inspecao_entrada", estado: "concluida" });
  return t ? comId(t) : null;
}
