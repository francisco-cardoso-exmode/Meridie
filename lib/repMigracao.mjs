/**
 * Representações comerciais — passagem do modelo antigo (marcas com os
 * produtos lá dentro, `marca.produtos[]`) para o novo (coleções "categorias"
 * e "produtos", cada produto ligado à sua marca).
 *
 * Funções puras, sem dependências (nem do Next nem do Mongo): usadas pelo
 * site, para ler as marcas ainda não migradas como se já fossem produtos
 * (lib/representacoes.js), e pelo script scripts/migrar-representacoes.mjs.
 */

export const slugify = (s) =>
  (s || "")
    .toString()
    .replace(/²/g, "2")
    .replace(/³/g, "3")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Árvore inicial (Categoria → Subcategoria). Fica editável no backoffice.
export const SEED_CATEGORIAS = [
  { slug: "bebidas", nome: "Bebidas", parent: null, ordem: 1, imagem: "/marcas/produtos/quinta-da-levada-1.jpg",
    descricao: "Vinhos, espumantes, gin e outras bebidas de produtores portugueses com origem e carácter." },
  { slug: "vinho", nome: "Vinho", parent: "bebidas", ordem: 1 },
  { slug: "espumante", nome: "Espumante", parent: "bebidas", ordem: 2 },
  { slug: "gin", nome: "Gin", parent: "bebidas", ordem: 3 },
  { slug: "sangria", nome: "Sangria & cocktails", parent: "bebidas", ordem: 4 },
  { slug: "alimentacao", nome: "Alimentação", parent: null, ordem: 2, imagem: "/marcas/produtos/mar-2.jpg",
    descricao: "Conservas de peixe, azeite e outros produtos alimentares portugueses." },
  { slug: "conservas", nome: "Conservas", parent: "alimentacao", ordem: 1 },
  { slug: "azeite", nome: "Azeite", parent: "alimentacao", ordem: 2 },
].map((c) => ({ descricao: "", imagem: "", ativo: true, ...c }));

// Nome das áreas antigas (lib/areasMarca.js) — para criar a categoria quando
// uma marca tem uma área sem categoria correspondente.
const NOMES_AREA = { bebidas: "Bebidas", alimentacao: "Alimentação", tecnologia: "Tecnologia" };

const valorCarac = (p, etiqueta) =>
  (Array.isArray(p?.caracteristicas) ? p.caracteristicas : []).find(
    (c) => Array.isArray(c) && new RegExp(etiqueta, "i").test(String(c[0]))
  )?.[1] || "";

/**
 * { categoria, subcategoria } de um produto antigo: a área da marca dá a
 * categoria; a subcategoria sai do nome do produto, da denominação ou da
 * linha de origem da marca. Sem correspondência, a subcategoria fica vazia.
 */
export function categoriaDe(marca, produto) {
  const categoria = slugify(marca?.area) || "bebidas";
  const nome = `${produto?.nome || ""} ${valorCarac(produto, "^denomina|^tipo")}`;
  const origem = String(marca?.origem || "");
  const tudo = `${nome} ${origem}`;
  let sub = "";
  if (categoria === "bebidas") {
    if (/sangria|cocktail/i.test(tudo)) sub = "sangria";
    else if (/\bgin\b/i.test(tudo)) sub = "gin";
    else if (/espumante|\bbrut[oe]?\b/i.test(nome) || /^espumante/i.test(origem)) sub = "espumante";
    else if (/vinho|wine/i.test(tudo)) sub = "vinho";
  } else if (categoria === "alimentacao") {
    // Peixe em lata primeiro: "Sardinhas em azeite" é conserva, não azeite.
    if (/conserva|sardinha|bacalhau|cavala|salm[aã]o|atum|polvo|filete|\blata\b/i.test(tudo)) sub = "conservas";
    else if (/azeite/i.test(tudo)) sub = "azeite";
  }
  return { categoria, subcategoria: sub };
}

// "garrafa 75 cl" / "lata 120 g" a partir da ficha técnica (só se for óbvio).
export function unidadeDe(produto) {
  const cap = valorCarac(produto, "^capacidade");
  if (cap && !/,| e /.test(cap)) return `garrafa ${cap}`;
  const peso = valorCarac(produto, "^peso");
  if (peso) return `lata ${peso}`;
  return "";
}

/** Categorias de que as marcas precisam e que ainda não existem. */
export function categoriasEmFalta(marcas, existentes) {
  const ha = new Set((existentes || []).map((c) => c.slug));
  const out = [];
  for (const m of marcas || []) {
    const slug = slugify(m?.area) || "bebidas";
    if (ha.has(slug)) continue;
    ha.add(slug);
    out.push({ slug, nome: NOMES_AREA[slug] || m.area, parent: null, ordem: 50, descricao: "", imagem: "", ativo: true });
  }
  return out;
}

// Tradução de um produto antigo (marca.en.produtos[i]) no formato novo.
function enDoProduto(fonte) {
  if (!fonte || typeof fonte !== "object") return undefined;
  const out = {};
  if (typeof fonte.nome === "string") out.nome = fonte.nome;
  if (typeof fonte.descricao === "string") out.descricao = fonte.descricao;
  if (Array.isArray(fonte.caracteristicas)) out.especificacoes = fonte.caracteristicas;
  return Object.keys(out).length ? out : undefined;
}

/**
 * Converte os produtos de UMA marca antiga em documentos da coleção
 * "produtos". `usados` (Set de slugs) evita repetidos entre marcas — um slug
 * já usado ganha o slug da marca no fim (e depois -2, -3…).
 */
export function produtosDaMarca(marca, usados = new Set()) {
  const lista = Array.isArray(marca?.produtos) ? marca.produtos : [];
  return lista
    .filter((p) => p && typeof p === "object" && String(p.nome || "").trim())
    .map((p, i) => {
      const base = slugify(p.nome) || `${marca.slug}-${i + 1}`;
      let slug = usados.has(base) ? `${base}-${marca.slug}` : base;
      for (let n = 2; usados.has(slug); n++) slug = `${base}-${marca.slug}-${n}`;
      usados.add(slug);
      const { categoria, subcategoria } = categoriaDe(marca, p);
      const en = enDoProduto(marca.en?.produtos?.[i]);
      const enFonte = enDoProduto(marca.enFonte?.produtos?.[i]);
      return {
        slug,
        nome: String(p.nome).trim(),
        marca: marca.slug,
        categoria,
        subcategoria,
        imagens: p.imagem ? [p.imagem] : [],
        resumo: "",
        descricao: p.descricao || "",
        especificacoes: Array.isArray(p.caracteristicas) ? p.caracteristicas : [],
        precoTipo: "consulta",
        preco: null,
        unidade: unidadeDe(p),
        minimo: 1,
        disponivel: true,
        destaque: i === 0,
        ativo: marca.ativo !== false,
        ordem: (Number(marca.ordem) || 0) * 100 + i,
        ...(en ? { en } : {}),
        ...(enFonte ? { enFonte } : {}),
      };
    });
}

/** Todos os produtos das marcas que ainda têm `produtos[]` (formato antigo). */
export function produtosLegado(marcas, usados = new Set()) {
  return (marcas || []).flatMap((m) => produtosDaMarca(m, usados));
}
