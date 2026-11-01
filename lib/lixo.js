import { after } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { utilizadorAtual } from "@/lib/adminAuth";
import { apagaBlobsOrfaos } from "@/lib/blobLimpeza";

/**
 * Lixo e registo de atividade do backoffice.
 * - Apagar (lib/crudAdmin.js) move o documento inteiro para `lixo`, onde fica
 *   30 dias e pode ser recuperado; só depois sai de vez (com as imagens do Blob).
 * - `atividade` guarda quem criou, editou, apagou ou recuperou o quê, e quando.
 */
export const DIAS_LIXO = 30;
const DIA_MS = 24 * 3600 * 1000;

export const ROTULO_COLECAO = {
  empreendimentos: "Empreendimento",
  regioes: "Região",
  marcas: "Marca",
  anuncios: "Parceiro",
  categorias: "Categoria",
  produtos: "Produto",
  solucoes: "Solução",
};
// Página do backoffice de cada coleção (os parceiros vivem em /admin/publicidade).
export const ROTA_COLECAO = { anuncios: "publicidade" };
export const hrefAdmin = (colecao, slug) =>
  `/admin/${ROTA_COLECAO[colecao] || colecao}${slug ? `/${encodeURIComponent(slug)}` : ""}`;

export const nomeDe = (doc) => doc?.nome || doc?.titulo || doc?.slug || "";

export async function registarAtividade(acao, colecao, doc) {
  try {
    const db = await getDb();
    await db.collection("atividade").insertOne({
      em: new Date(),
      por: (await utilizadorAtual()) || "admin",
      acao,
      colecao,
      slug: doc?.slug || "",
      nome: nomeDe(doc),
    });
  } catch (e) {
    // O registo nunca impede a gravação.
    console.error("registo de atividade:", e?.message || e);
  }
}

// Copia para o lixo ANTES de apagar (se a cópia falhar, não se apaga nada).
export async function moverParaLixo(db, colecao, doc) {
  const agora = new Date();
  await db.collection("lixo").insertOne({
    colecao,
    slug: doc.slug,
    nome: nomeDe(doc),
    doc,
    apagadoEm: agora,
    apagadoPor: (await utilizadorAtual()) || "admin",
    expiraEm: new Date(agora.getTime() + DIAS_LIXO * DIA_MS),
  });
  await db.collection(colecao).deleteOne({ _id: doc._id });
}

// Tira do lixo o que passou dos 30 dias e limpa as imagens que eram só dele.
export async function esvaziarExpirados(db) {
  const lixo = db.collection("lixo");
  const velhos = await lixo.find({ expiraEm: { $lt: new Date() } }).toArray();
  if (!velhos.length) return;
  await lixo.deleteMany({ _id: { $in: velhos.map((v) => v._id) } });
  after(async () => {
    for (const v of velhos) await apagaBlobsOrfaos(v.doc);
  });
}

export const idValido = (id) => typeof id === "string" && /^[a-f0-9]{24}$/.test(id);

/** Repõe um item do lixo na sua coleção. Devolve { ok } ou { erro, status }. */
export async function restaurar(id) {
  if (!idValido(id)) return { erro: "Item não encontrado.", status: 404 };
  const db = await getDb();
  const item = await db.collection("lixo").findOne({ _id: new ObjectId(id) });
  if (!item) return { erro: "Já não está no lixo — recarrega a página.", status: 404 };
  const col = db.collection(item.colecao);
  if (await col.findOne({ slug: item.slug }, { projection: { _id: 1 } }))
    return { erro: `Já existe outro com o endereço "${item.slug}". Muda o endereço desse primeiro.`, status: 409 };
  try {
    await col.insertOne({ ...item.doc, atualizadoEm: new Date() });
  } catch (e) {
    if (e?.code === 11000) return { erro: `Já existe outro com o endereço "${item.slug}".`, status: 409 };
    throw e;
  }
  await db.collection("lixo").deleteOne({ _id: item._id });
  await registarAtividade("recuperou", item.colecao, item.doc);
  return { ok: true, colecao: item.colecao, slug: item.slug };
}

/** Apaga de vez um item do lixo (e as imagens que eram só dele). */
export async function apagarDeVez(id) {
  if (!idValido(id)) return { erro: "Item não encontrado.", status: 404 };
  const db = await getDb();
  const item = await db.collection("lixo").findOneAndDelete({ _id: new ObjectId(id) });
  if (!item) return { erro: "Já não está no lixo — recarrega a página.", status: 404 };
  after(() => apagaBlobsOrfaos(item.doc));
  await registarAtividade("apagou de vez", item.colecao, item.doc);
  return { ok: true };
}
