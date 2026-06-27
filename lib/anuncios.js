import { getDb } from "@/lib/mongodb";

// Anúncios / publicidade global — geridos no backoffice (coleção "anuncios").
// Aparecem na Home (se mostrarHome) e na página /publicidade.

export async function allAnuncios({ todos = false, home = false } = {}) {
  try {
    const db = await getDb();
    let list = await db
      .collection("anuncios")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    if (!todos) list = list.filter((a) => a.ativo !== false);
    if (home) list = list.filter((a) => a.mostrarHome);
    return list;
  } catch {
    return [];
  }
}

export async function anuncioBySlug(slug) {
  try {
    const db = await getDb();
    return await db.collection("anuncios").findOne({ slug }, { projection: { _id: 0 } });
  } catch {
    return null;
  }
}
