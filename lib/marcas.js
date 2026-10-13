import { getDb } from "@/lib/mongodb";

/**
 * Marcas representadas (bebidas, alimentação…) — geridas no backoffice
 * (coleção "marcas"). Enquanto a coleção estiver vazia, o site mostra o SEED
 * (lib/marcasSeed.js); ao criar a primeira marca no backoffice, passa a valer só o Mongo.
 */

export { AREAS_MARCA } from "@/lib/areasMarca";
import { SEED_MARCAS } from "@/lib/marcasSeed";

export { SEED_MARCAS };

const ordemDe = (m) => (Number.isFinite(Number(m.ordem)) && m.ordem !== "" ? Number(m.ordem) : 99);
const porOrdem = (a, b) => ordemDe(a) - ordemDe(b);

export async function allMarcas({ todos = false, home = false, area } = {}) {
  let list = SEED_MARCAS;
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const docs = await db
        .collection("marcas")
        .find({}, { projection: { _id: 0 } })
        .toArray();
      if (docs.length) list = docs;
    } catch {
      // sem ligação: fica o seed
    }
  }
  if (!todos) list = list.filter((m) => m.ativo !== false);
  if (home) list = list.filter((m) => m.mostrarHome);
  if (area) list = list.filter((m) => m.area === area);
  return [...list].sort(porOrdem);
}

// Copia as marcas de exemplo para o Mongo se a coleção estiver vazia — assim
// ficam logo editáveis no backoffice como quaisquer outras.
export async function garanteSeed(db) {
  const col = db.collection("marcas");
  if ((await col.countDocuments({}, { limit: 1 })) === 0) {
    await col.insertMany(SEED_MARCAS.map((m) => ({ ...m })));
  }
  return col;
}

export async function marcaBySlug(slug) {
  const list = await allMarcas({ todos: true });
  return list.find((m) => m.slug === slug) || null;
}
