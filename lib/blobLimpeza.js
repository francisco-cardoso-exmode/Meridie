import { del } from "@vercel/blob";
import { getDb } from "@/lib/mongodb";

/**
 * Depois de apagar um registo no backoffice, apaga do Vercel Blob as imagens e
 * vídeos que eram só dele. Melhor esforço: só URLs do NOSSO store, e só se
 * nenhum outro registo os usar. Qualquer falha fica no log e não afeta nada.
 */

// O id do store vem no token: vercel_blob_rw_<storeId>_<segredo>.
function hostDoStore() {
  const id = (process.env.BLOB_READ_WRITE_TOKEN || "").split("_")[3];
  return id ? `${id.toLowerCase()}.public.blob.vercel-storage.com` : null;
}

function urlsDoStore(obj, host, out = new Set()) {
  if (typeof obj === "string") {
    try {
      if (new URL(obj).host === host) out.add(obj);
    } catch {
      /* não é URL */
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((v) => urlsDoStore(v, host, out));
  } else if (obj && typeof obj === "object") {
    Object.values(obj).forEach((v) => urlsDoStore(v, host, out));
  }
  return out;
}

const COLECOES = ["empreendimentos", "regioes", "marcas", "anuncios", "paginas", "config"];

export async function apagaBlobsOrfaos(doc) {
  const host = hostDoStore();
  if (!host || !doc) return;
  try {
    const urls = [...urlsDoStore(doc, host)];
    if (!urls.length) return;
    const db = await getDb();
    const usados = new Set();
    for (const c of COLECOES) {
      for (const d of await db.collection(c).find({}).toArray()) urlsDoStore(d, host, usados);
    }
    const apagar = urls.filter((u) => !usados.has(u));
    if (apagar.length) await del(apagar);
  } catch (e) {
    console.error("limpeza do Blob:", e?.message || e);
  }
}
