import { getDb } from "@/lib/mongodb";

// Anúncios / publicidade global — geridos no backoffice (coleção "anuncios").
// Aparecem na Home (se mostrarHome) e na página /publicidade.
// `estrito: true` (backoffice) lança o erro se a base falhar, em vez de lista vazia.

export async function allAnuncios({ todos = false, home = false, estrito = false } = {}) {
  if (!process.env.MONGODB_URI) return [];
  try {
    const db = await getDb();
    let list = await db
      .collection("anuncios")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    if (!todos) list = list.filter((a) => a.ativo !== false);
    if (home) list = list.filter((a) => a.mostrarHome);
    return list;
  } catch (e) {
    if (estrito) throw e;
    return [];
  }
}

export async function anuncioBySlug(slug, { estrito = false } = {}) {
  if (typeof slug !== "string" || !process.env.MONGODB_URI) return null;
  try {
    const db = await getDb();
    return await db.collection("anuncios").findOne({ slug }, { projection: { _id: 0 } });
  } catch (e) {
    if (estrito) throw e;
    return null;
  }
}
