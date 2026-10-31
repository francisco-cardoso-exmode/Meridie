import { cache } from "react";
import { getDb } from "@/lib/mongodb";
import { allMarcas } from "@/lib/marcas";
import { SEED_CATEGORIAS, produtosLegado } from "@/lib/repMigracao.mjs";
import { porOrdem } from "@/lib/catalogo";

/**
 * Representações comerciais: Categoria → Subcategoria → Produto (ligado à
 * sua Marca). Coleções "categorias" e "produtos"; as marcas continuam na
 * coleção "marcas".
 *
 * Compatibilidade antes da migração (scripts/migrar-representacoes.mjs):
 * - sem categorias na base, vale a árvore inicial (SEED_CATEGORIAS);
 * - as marcas que ainda têm `produtos[]` (formato antigo) aparecem como
 *   produtos "legado" (só leitura), lado a lado com os da coleção "produtos".
 * Sem MONGODB_URI (build/desenvolvimento) o site mostra os exemplos.
 * `estrito: true` (backoffice) lança o erro se a base falhar.
 */

const hasDb = () => !!process.env.MONGODB_URI;

async function leColecao(nome, estrito) {
  if (!hasDb()) return null;
  try {
    const db = await getDb();
    return await db.collection(nome).find({}, { projection: { _id: 0 } }).toArray();
  } catch (e) {
    if (estrito) throw e;
    return null;
  }
}

// ───────── Categorias ─────────

const leCategorias = cache(async (estrito = false) => {
  const lista = await leColecao("categorias", estrito);
  return lista && lista.length ? lista : SEED_CATEGORIAS;
});

export async function allCategorias({ todos = false, estrito = false } = {}) {
  let list = await leCategorias(estrito);
  if (!todos) {
    // Uma subcategoria de uma categoria inativa também fica escondida.
    const inativas = new Set(list.filter((c) => c.ativo === false).map((c) => c.slug));
    list = list.filter((c) => c.ativo !== false && !(c.parent && inativas.has(c.parent)));
  }
  return [...list].sort(porOrdem);
}

export async function categoriaBySlug(slug, opcoes) {
  if (typeof slug !== "string") return null;
  return (await allCategorias({ todos: true, ...opcoes })).find((c) => c.slug === slug) || null;
}

// Copia a árvore inicial para o Mongo UMA vez (como as marcas de exemplo):
// assim fica editável no backoffice. Se depois forem apagadas, não voltam.
export async function garanteSeedCategorias(db) {
  const r = await db
    .collection("config")
    .updateOne({ _id: "seed-categorias" }, { $setOnInsert: { em: new Date() } }, { upsert: true });
  if (!r.upsertedCount) return;
  const col = db.collection("categorias");
  if ((await col.countDocuments({}, { limit: 1 })) > 0) return;
  for (const c of SEED_CATEGORIAS) {
    await col.updateOne({ slug: c.slug }, { $setOnInsert: { ...c } }, { upsert: true });
  }
}

// ───────── Produtos ─────────

const leProdutos = cache(async (estrito = false) => {
  const [base, marcas] = await Promise.all([
    leColecao("produtos", estrito),
    allMarcas({ todos: true, estrito }),
  ]);
  const novos = base || [];
  const usados = new Set(novos.map((p) => p.slug));
  // Marcas ainda no formato antigo: os produtos lidos "como se" já migrados.
  const legado = produtosLegado(marcas, usados).map((p) => ({ ...p, legado: true }));
  return [...novos, ...legado];
});

/**
 * Produtos visíveis (ativos, de marca e categoria ativas). Filtros opcionais:
 * categoria (de topo), subcategoria, marca; `todos` inclui os ocultos.
 */
export async function allProdutos({ todos = false, estrito = false, categoria, subcategoria, marca, destaque } = {}) {
  let list = await leProdutos(estrito);
  if (!todos) {
    const [marcas, cats] = await Promise.all([allMarcas({ todos: true, estrito }), allCategorias({ estrito })]);
    const marcasInativas = new Set(marcas.filter((m) => m.ativo === false).map((m) => m.slug));
    const catsVisiveis = new Set(cats.map((c) => c.slug));
    list = list.filter(
      (p) =>
        p.ativo !== false &&
        !(p.marca && marcasInativas.has(p.marca)) &&
        catsVisiveis.has(p.categoria) &&
        (!p.subcategoria || catsVisiveis.has(p.subcategoria))
    );
  }
  if (categoria) list = list.filter((p) => p.categoria === categoria);
  if (subcategoria) list = list.filter((p) => p.subcategoria === subcategoria);
  if (marca) list = list.filter((p) => p.marca === marca);
  if (destaque) list = list.filter((p) => p.destaque);
  return [...list].sort(porOrdem);
}

export async function produtoBySlug(slug, { estrito = false } = {}) {
  if (typeof slug !== "string") return null;
  return (await leProdutos(estrito)).find((p) => p.slug === slug) || null;
}

/** Só os campos que os cartões e os filtros usam (payload pequeno). */
export function cartaoProduto(p) {
  return {
    slug: p.slug,
    nome: p.nome,
    marca: p.marca || "",
    categoria: p.categoria,
    subcategoria: p.subcategoria || "",
    imagem: p.imagens?.[0] || "",
    resumo: p.resumo || "",
    precoTipo: p.precoTipo === "valor" ? "valor" : "consulta",
    preco: p.preco ?? null,
    unidade: p.unidade || "",
    minimo: p.minimo || 1,
    disponivel: p.disponivel !== false,
    destaque: !!p.destaque,
  };
}

/** Cartões de produto com o nome da marca (para ProdutoCard). */
export function cartoesProdutos(lista, marcas = []) {
  const nome = new Map(marcas.map((m) => [m.slug, m.nome]));
  return lista.map((p) => ({ ...cartaoProduto(p), marcaNome: nome.get(p.marca) || "" }));
}

/**
 * Marcas com a lista resumida dos seus produtos ({ nome, imagem }) — os
 * cartões e a faixa de marcas usam-na para a foto e a contagem (os produtos
 * já não vivem dentro da marca).
 */
export function marcasComProdutos(marcas, produtos) {
  return marcas.map((m) => ({
    ...m,
    produtos: produtos.filter((p) => p.marca === m.slug).map((p) => ({ nome: p.nome, imagem: p.imagens?.[0] || "" })),
  }));
}
