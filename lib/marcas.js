import { getDb } from "@/lib/mongodb";

/**
 * Marcas representadas (bebidas, alimentação…) — geridas no backoffice
 * (coleção "marcas"). Enquanto a coleção estiver vazia, o site mostra o SEED
 * (lib/marcasSeed.js); ao criar a primeira marca no backoffice, passa a valer só o Mongo.
 */

export { AREAS_MARCA } from "@/lib/areasMarca";
import { SEED_MARCAS } from "@/lib/marcasSeed";

export { SEED_MARCAS };

const porOrdem = (a, b) => (Number(a.ordem) || 99) - (Number(b.ordem) || 99);

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

export async function marcaBySlug(slug) {
  const list = await allMarcas({ todos: true });
  return list.find((m) => m.slug === slug) || null;
}
