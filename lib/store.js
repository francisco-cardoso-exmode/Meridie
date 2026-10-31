/**
 * Camada de dados do site — lê do MongoDB com fallback para os dados estáticos.
 *
 * Sem MONGODB_URI (desenvolvimento) usa os ficheiros de seed
 * (lib/empreendimentos.js / lib/regioes.js). Com MONGODB_URI, o Mongo é a fonte
 * de verdade — e é isto que o backoffice edita: uma coleção vazia é mesmo
 * vazia (não volta a mostrar os exemplos).
 * Se a ligação falhar, o site público mostra o seed para não quebrar; o
 * backoffice usa `estrito: true` e recebe o erro (para avisar e não gravar
 * por cima de dados reais).
 */
import { getDb } from "@/lib/mongodb";
import { EMPREENDIMENTOS as SEED_EMP } from "@/lib/empreendimentos";
import { REGIOES as SEED_REG } from "@/lib/regioes";

const hasDb = () => !!process.env.MONGODB_URI;

async function fromDb(collection, fallback, estrito = false) {
  if (!hasDb()) return fallback;
  try {
    const db = await getDb();
    return await db
      .collection(collection)
      .find({}, { projection: { _id: 0 } })
      .toArray();
  } catch (e) {
    if (estrito) throw e;
    return fallback;
  }
}

// Ordena: empreendimentos em destaque primeiro, mantendo a ordem restante.
function ordena(list) {
  return [...list].sort((a, b) => Number(b.destaque) - Number(a.destaque));
}

// Visível no site = publicado !== false (campo em falta conta como visível).
const visivel = (e) => e.publicado !== false;

// ───────── Empreendimentos ─────────
// `todos: true` inclui os ocultos (uso no backoffice).
// `estrito: true` (backoffice) lança o erro se a base falhar, em vez do seed.
export async function allEmpreendimentos({ pais, todos = false, estrito = false } = {}) {
  let list = await fromDb("empreendimentos", SEED_EMP, estrito);
  if (!todos) list = list.filter(visivel);
  if (pais) list = list.filter((e) => e.pais === pais);
  return ordena(list);
}

export async function empreendimentoBySlug(slug, { estrito = false } = {}) {
  if (typeof slug !== "string") return null;
  const list = await fromDb("empreendimentos", SEED_EMP, estrito);
  return list.find((e) => e.slug === slug) || null;
}

// Encontra um empreendimento cujo slug ANTIGO corresponde (para redirecionar
// os URLs antigos para o novo slug, depois de mudar os slugs).
export async function empreendimentoPorSlugAntigo(slug) {
  const list = await fromDb("empreendimentos", SEED_EMP);
  return (
    list.find(
      (e) => Array.isArray(e.slugsAntigos) && e.slugsAntigos.includes(slug)
    ) || null
  );
}

export async function empreendimentosDestaque(limite = 6) {
  const list = await fromDb("empreendimentos", SEED_EMP);
  return ordena(list.filter((e) => e.destaque && visivel(e))).slice(0, limite);
}

// ───────── Regiões ─────────
export async function allRegioes({ pais, topo = false, estrito = false } = {}) {
  let list = await fromDb("regioes", SEED_REG, estrito);
  if (topo) list = list.filter((r) => !r.parent);
  if (pais) list = list.filter((r) => r.pais === pais);
  return list;
}

export async function regiaoBySlug(slug, { estrito = false } = {}) {
  if (typeof slug !== "string") return null;
  const list = await fromDb("regioes", SEED_REG, estrito);
  return list.find((r) => r.slug === slug) || null;
}

export async function subRegioes(slug) {
  const list = await fromDb("regioes", SEED_REG);
  return list.filter((r) => r.parent === slug);
}

// Devolve a zona/região a que um empreendimento pertence (prefere a sub-zona
// mais específica, ex.: Fortaleza em vez de Nordeste).
export async function regiaoDoEmpreendimento(e) {
  if (!e) return null;
  const regs = await fromDb("regioes", SEED_REG);
  const matches = regs.filter(
    (r) => r.cidades?.includes(e.cidade) || r.zonas?.includes(e.zona)
  );
  if (!matches.length) return null;
  return matches.find((r) => r.parent) || matches[0];
}

export async function empreendimentosPorRegiao(regiao) {
  if (!regiao) return [];
  const list = await fromDb("empreendimentos", SEED_EMP);
  return ordena(
    list.filter(
      (e) =>
        visivel(e) &&
        (regiao.cidades?.includes(e.cidade) || regiao.zonas?.includes(e.zona))
    )
  );
}

// ───────── Derivados (filtros) ─────────
const uniqSort = (arr) =>
  [...new Set(arr)].sort((a, b) => a.localeCompare(b, "pt"));

export const zonasDe = (lista) => uniqSort(lista.map((e) => e.zona));
export const tiposDe = (lista) => uniqSort(lista.map((e) => e.tipo));
export const finalidadesDe = (lista) => uniqSort(lista.map((e) => e.finalidade));
