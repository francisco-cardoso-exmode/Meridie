/**
 * Camada de dados do site — lê do MongoDB com fallback para os dados estáticos.
 *
 * Se MONGODB_URI não estiver definido (ou a ligação falhar), usa os ficheiros
 * de seed (lib/empreendimentos.js / lib/regioes.js), garantindo que o site e o
 * build nunca quebram. Quando o Mongo está disponível, é a fonte de verdade —
 * e é isto que o backoffice edita.
 */
import { getDb } from "@/lib/mongodb";
import { EMPREENDIMENTOS as SEED_EMP } from "@/lib/empreendimentos";
import { REGIOES as SEED_REG } from "@/lib/regioes";

const hasDb = () => !!process.env.MONGODB_URI;

async function fromDb(collection, fallback) {
  if (!hasDb()) return fallback;
  try {
    const db = await getDb();
    const docs = await db
      .collection(collection)
      .find({}, { projection: { _id: 0 } })
      .toArray();
    return docs.length ? docs : fallback;
  } catch {
    return fallback;
  }
}

// Ordena: empreendimentos REAIS (com construtora) primeiro, depois os em
// destaque, mantendo a ordem restante. Usado em todo o lado para que o que
// já temos a sério apareça à frente.
function ordena(list) {
  return [...list].sort((a, b) => {
    const real = (b.construtora ? 1 : 0) - (a.construtora ? 1 : 0);
    if (real) return real;
    return Number(b.destaque) - Number(a.destaque);
  });
}

// ───────── Empreendimentos ─────────
export async function allEmpreendimentos({ pais } = {}) {
  const list = await fromDb("empreendimentos", SEED_EMP);
  return ordena(pais ? list.filter((e) => e.pais === pais) : list);
}

export async function empreendimentoBySlug(slug) {
  const list = await fromDb("empreendimentos", SEED_EMP);
  return list.find((e) => e.slug === slug) || null;
}

export async function empreendimentosDestaque(limite = 6) {
  const list = await fromDb("empreendimentos", SEED_EMP);
  return ordena(list.filter((e) => e.destaque)).slice(0, limite);
}

// ───────── Regiões ─────────
export async function allRegioes({ pais, topo = false } = {}) {
  let list = await fromDb("regioes", SEED_REG);
  if (topo) list = list.filter((r) => !r.parent);
  if (pais) list = list.filter((r) => r.pais === pais);
  return list;
}

export async function regiaoBySlug(slug) {
  const list = await fromDb("regioes", SEED_REG);
  return list.find((r) => r.slug === slug) || null;
}

export async function subRegioes(slug) {
  const list = await fromDb("regioes", SEED_REG);
  return list.filter((r) => r.parent === slug);
}

export async function empreendimentosPorRegiao(regiao) {
  if (!regiao) return [];
  const list = await fromDb("empreendimentos", SEED_EMP);
  return ordena(
    list.filter(
      (e) => regiao.cidades?.includes(e.cidade) || regiao.zonas?.includes(e.zona)
    )
  );
}

// ───────── Derivados (filtros) ─────────
const uniqSort = (arr) =>
  [...new Set(arr)].sort((a, b) => a.localeCompare(b, "pt"));

export const zonasDe = (lista) => uniqSort(lista.map((e) => e.zona));
export const tiposDe = (lista) => uniqSort(lista.map((e) => e.tipo));
export const finalidadesDe = (lista) => uniqSort(lista.map((e) => e.finalidade));
