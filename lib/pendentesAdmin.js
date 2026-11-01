import { getDb } from "@/lib/mongodb";
import { hojeLisboa } from "@/lib/al/regras";
import { filtroLeadsNovas } from "@/lib/lead";

/**
 * O que está à espera de alguém no backoffice — para o "Para tratar hoje" do
 * Dashboard e os números no menu. Lança se a base falhar (usar com leAdmin).
 */
const SEMANA_MS = 7 * 24 * 3600 * 1000;

export async function contarPendentes() {
  if (!process.env.MONGODB_URI) return null;
  const db = await getDb();
  const hoje = hojeLisboa();
  const semana = new Date(Date.now() - SEMANA_MS);
  const [pedidosNovos, leadsNovas, emailsFalhados, reservasPedido, casasAnalise, tarefasHoje, tarefasPorAtribuir] =
    await Promise.all([
      db.collection("pedidos").countDocuments({ estado: "novo" }),
      db.collection("contactos").countDocuments(filtroLeadsNovas()),
      db.collection("contactos").countDocuments({ criadoEm: { $gte: semana }, emailFalhou: true }),
      db.collection("al_reservas").countDocuments({ estado: "pedido" }),
      db.collection("al_casas").countDocuments({ estado: "em_analise" }),
      db.collection("al_tarefas").countDocuments({ data: hoje, estado: { $ne: "concluida" } }),
      db.collection("al_tarefas").countDocuments({ atribuidaA: "", estado: "pendente" }),
    ]);
  return { hoje, pedidosNovos, leadsNovas, emailsFalhados, reservasPedido, casasAnalise, tarefasHoje, tarefasPorAtribuir };
}

// Números do menu: o que pede resposta (uma lead com email falhado já conta como nova).
export function contadoresMenu(p) {
  if (!p) return {};
  return {
    contactos: p.pedidosNovos + p.leadsNovas,
    alojamento: p.reservasPedido + p.casasAnalise + p.tarefasPorAtribuir,
  };
}
