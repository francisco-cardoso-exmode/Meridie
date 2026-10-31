import { cache } from "react";
import { getDb } from "@/lib/mongodb";
import { porOrdem } from "@/lib/catalogo";

/**
 * Soluções tecnológicas (coleção "solucoes") — o catálogo da área
 * Tecnologia: "Desenvolvemos" (produtos próprios) e "Representamos"
 * (soluções de parceiros). Sem exemplos: sem base de dados, a lista é vazia
 * e a página mostra só os textos (Páginas → Tecnologia).
 * `estrito: true` (backoffice) lança o erro se a base falhar.
 */

const leSolucoes = cache(async (estrito = false) => {
  if (!process.env.MONGODB_URI) return [];
  try {
    const db = await getDb();
    return await db.collection("solucoes").find({}, { projection: { _id: 0 } }).toArray();
  } catch (e) {
    if (estrito) throw e;
    return [];
  }
});

export async function allSolucoes({ todos = false, estrito = false, tipo } = {}) {
  let list = await leSolucoes(estrito);
  if (!todos) list = list.filter((s) => s.ativo !== false);
  if (tipo) list = list.filter((s) => s.tipo === tipo);
  // Destaques primeiro, depois a ordem.
  return [...list].sort((a, b) => Number(!!b.destaque) - Number(!!a.destaque) || porOrdem(a, b));
}

export async function solucaoBySlug(slug, { estrito = false } = {}) {
  if (typeof slug !== "string") return null;
  return (await leSolucoes(estrito)).find((s) => s.slug === slug) || null;
}
