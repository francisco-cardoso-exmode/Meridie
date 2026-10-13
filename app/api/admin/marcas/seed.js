import { SEED_MARCAS } from "@/lib/marcas";

// Na primeira escrita no backoffice, copia as marcas de exemplo para o Mongo —
// assim editar ou apagar uma marca do seed funciona como com as outras.
export async function garanteSeed(db) {
  const col = db.collection("marcas");
  if ((await col.countDocuments({}, { limit: 1 })) === 0) {
    await col.insertMany(SEED_MARCAS.map((m) => ({ ...m })));
  }
  return col;
}
