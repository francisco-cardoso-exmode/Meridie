import { NextResponse, after } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import { revalidaSite } from "@/lib/revalida";
import { traduzirEmFundo } from "@/lib/traducao";
import { slugify, erroSlug } from "@/lib/slug";
import { limpaDoc, textoPreenchido, eDuplicado, prepararEn } from "@/lib/validar";
import { apagaBlobsOrfaos } from "@/lib/blobLimpeza";

/**
 * Criar / editar / apagar registos do backoffice (empreendimentos, regiões,
 * marcas, anúncios) — a mesma lógica para as quatro coleções:
 * - só os campos conhecidos de cada coleção (lib/validar.js);
 * - slug normalizado e validado na criação, duplicados recusados (também pelo
 *   índice único — scripts/criar-indices.mjs);
 * - tradução em fundo só depois de confirmar que a gravação aconteceu.
 */

const erro = (msg, status) => NextResponse.json({ ok: false, erro: msg }, { status });
const semSessao = () => erro("A tua sessão expirou. Entra noutra janela e volta a guardar.", 401);
const ROTULO = { nome: "nome", titulo: "título" };
const NAO_ENCONTRADO = "Não encontrado — pode ter sido apagado noutra janela. Volta à lista e recarrega.";

/**
 * POST. `opcoes`: campoNome ("nome" | "titulo"), slugDoNome (o slug vem do
 * nome, sem campo próprio no formulário), msgDuplicado e `validar(doc, null,
 * db)` opcional (como no PUT; pode ser async — corre já com o slug final).
 */
export async function criar(request, colecao, { campoNome = "nome", slugDoNome = false, msgDuplicado, validar }) {
  if (!(await isAdmin())) return semSessao();
  const doc = limpaDoc(colecao, await request.json().catch(() => null));
  if (!doc || !textoPreenchido(doc[campoNome]))
    return erro(`O ${ROTULO[campoNome] || campoNome} é obrigatório.`, 400);

  const base = slugDoNome && !textoPreenchido(doc.slug) ? doc[campoNome] : doc.slug;
  if (typeof base !== "string" || !base.trim()) return erro("O slug é obrigatório.", 400);
  doc.slug = slugify(base);
  const invalido = erroSlug(doc.slug);
  if (invalido) return erro(invalido, 400);

  const db = await getDb();
  const invalidoDoc = await validar?.(doc, null, db);
  if (invalidoDoc) return erro(invalidoDoc, 400);

  const col = db.collection(colecao);
  if (await col.findOne({ slug: doc.slug }, { projection: { _id: 1 } }))
    return erro(`${msgDuplicado} (endereço "${doc.slug}")`, 409);
  try {
    await col.insertOne({ ...doc, atualizadoEm: new Date() });
  } catch (e) {
    // Dois pedidos ao mesmo tempo: o índice único trava o segundo.
    if (eDuplicado(e)) return erro(`${msgDuplicado} (endereço "${doc.slug}")`, 409);
    throw e;
  }
  revalidaSite();
  after(() => traduzirEmFundo(colecao, doc.slug));
  return NextResponse.json({ ok: true, slug: doc.slug });
}

/**
 * PUT. O slug é a chave — não muda na edição. O corpo pode trazer
 * `enEditado`: só as correções inglesas feitas à mão nesta edição.
 * `validar(doc, slug, db)` opcional (pode ser async) devolve uma mensagem de erro.
 */
export async function atualizar(request, params, colecao, { campoNome = "nome", validar } = {}) {
  if (!(await isAdmin())) return semSessao();
  const { slug } = await params;
  const corpo = await request.json().catch(() => null);
  const doc = limpaDoc(colecao, corpo);
  if (!doc) return erro("Pedido inválido.", 400);
  if (campoNome in doc && !textoPreenchido(doc[campoNome]))
    return erro(`O ${ROTULO[campoNome] || campoNome} é obrigatório.`, 400);
  doc.slug = slug;
  const db = await getDb();
  const invalido = await validar?.(doc, slug, db);
  if (invalido) return erro(invalido, 400);

  const col = db.collection(colecao);
  const antes = await col.findOne({ slug });
  if (!antes) return erro(NAO_ENCONTRADO, 404);
  const { set, enAntes } = prepararEn(colecao, antes, doc, corpo.enEditado);
  const r = await col.updateOne({ slug }, { $set: { ...doc, ...set, atualizadoEm: new Date() } });
  if (!r.matchedCount) return erro(NAO_ENCONTRADO, 404);

  revalidaSite();
  after(() => traduzirEmFundo(colecao, slug, enAntes));
  return NextResponse.json({ ok: true });
}

/**
 * DELETE. `podeApagar(db, slug)` opcional devolve uma mensagem (409) quando o
 * registo não pode ser apagado. Depois de apagar, limpa do Blob os ficheiros
 * que eram só deste registo (melhor esforço, em fundo).
 */
export async function apagar(params, colecao, { podeApagar } = {}) {
  if (!(await isAdmin())) return semSessao();
  const { slug } = await params;
  const db = await getDb();
  const bloqueio = await podeApagar?.(db, slug);
  if (bloqueio) return erro(bloqueio, 409);
  const doc = await db.collection(colecao).findOneAndDelete({ slug });
  if (!doc) return erro("Não encontrado — já tinha sido apagado?", 404);
  revalidaSite();
  after(() => apagaBlobsOrfaos(doc));
  return NextResponse.json({ ok: true });
}
