import { getDb } from "@/lib/mongodb";

/**
 * Marcas representadas (bebidas, alimentação…) — geridas no backoffice
 * (coleção "marcas"). Sem MONGODB_URI (desenvolvimento) o site mostra o SEED
 * (lib/marcasSeed.js); com base de dados vale só o Mongo — mesmo vazio.
 */

export { AREAS_MARCA } from "@/lib/areasMarca";
import { SEED_MARCAS } from "@/lib/marcasSeed";

export { SEED_MARCAS };

const ordemDe = (m) => (Number.isFinite(Number(m.ordem)) && m.ordem !== "" ? Number(m.ordem) : 99);
const porOrdem = (a, b) => ordemDe(a) - ordemDe(b);

// `estrito: true` (backoffice) lança o erro se a base falhar, em vez do seed.
export async function allMarcas({ todos = false, home = false, area, estrito = false } = {}) {
  let list = SEED_MARCAS;
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      list = await db
        .collection("marcas")
        .find({}, { projection: { _id: 0 } })
        .toArray();
    } catch (e) {
      if (estrito) throw e;
      // sem ligação: o site público fica com o seed
    }
  }
  if (!todos) list = list.filter((m) => m.ativo !== false);
  if (home) list = list.filter((m) => m.mostrarHome);
  if (area) list = list.filter((m) => m.area === area);
  return [...list].sort(porOrdem);
}

// Copia as marcas de exemplo para o Mongo UMA vez (marca "seed-marcas" na
// coleção config) — assim ficam editáveis no backoffice como quaisquer outras.
// Se depois forem apagadas todas, não voltam. Upsert por slug: seguro em
// pedidos simultâneos.
export async function garanteSeed(db) {
  const r = await db
    .collection("config")
    .updateOne({ _id: "seed-marcas" }, { $setOnInsert: { em: new Date() } }, { upsert: true });
  if (!r.upsertedCount) return;
  const col = db.collection("marcas");
  if ((await col.countDocuments({}, { limit: 1 })) > 0) return;
  for (const m of SEED_MARCAS) {
    await col.updateOne({ slug: m.slug }, { $setOnInsert: { ...m } }, { upsert: true });
  }
}

export async function marcaBySlug(slug, { estrito = false } = {}) {
  if (typeof slug !== "string") return null;
  const list = await allMarcas({ todos: true, estrito });
  return list.find((m) => m.slug === slug) || null;
}
