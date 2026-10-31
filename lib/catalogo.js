/**
 * Catálogo (Representações comerciais e Tecnologia) — regras puras, sem
 * dependências de servidor: usadas nas rotas do backoffice, nas páginas e nos
 * componentes client.
 */

// Preço de um produto ou plano: um valor, ou "Preço sob consulta".
export const PRECO_TIPOS = ["valor", "consulta"];

// Palavras que não podem ser slug de categoria (são rotas de /representacoes).
export const SLUGS_CATEGORIA_RESERVADOS = ["marcas", "brands", "produto", "pedido"];

// Tipos de solução tecnológica.
export const TIPOS_SOLUCAO = {
  desenvolvemos: "Desenvolvemos",
  representamos: "Representamos",
};

/** Caminhos internos (PT) das páginas do catálogo. */
export const hrefProduto = (p) => `/representacoes/${p.categoria}/${p.slug}`;
export const hrefMarca = (slug) => `/representacoes/marcas/${slug}`;
export const hrefCategoria = (slug, sub) => `/representacoes/${slug}${sub ? `?sub=${sub}` : ""}`;
export const hrefSolucao = (slug) => `/tecnologia/${slug}`;

const ordemDe = (x) => (Number.isFinite(Number(x?.ordem)) && x.ordem !== "" && x.ordem != null ? Number(x.ordem) : 99);
export const porOrdem = (a, b) => ordemDe(a) - ordemDe(b) || String(a.nome || "").localeCompare(String(b.nome || ""), "pt");

/** Lista plana → árvore: [{ ...categoria, filhos: [...] }] (só 2 níveis). */
export function arvoreCategorias(categorias) {
  const lista = Array.isArray(categorias) ? categorias : [];
  const topo = lista.filter((c) => !c.parent).sort(porOrdem);
  return topo.map((c) => ({ ...c, filhos: lista.filter((f) => f.parent === c.slug).sort(porOrdem) }));
}

/**
 * Valida uma categoria antes de gravar. `todas`: as categorias atuais (da
 * base); `slugAtual`: o slug da categoria em edição (null ao criar).
 * Máximo 2 níveis: o pai tem de ser de topo e uma categoria com
 * subcategorias não pode passar a subcategoria. Devolve a mensagem de erro
 * ou null.
 */
export function erroCategoria(doc, todas = [], slugAtual = null) {
  if (!doc || typeof doc !== "object") return "Pedido inválido.";
  if (slugAtual == null && SLUGS_CATEGORIA_RESERVADOS.includes(doc.slug))
    return `"${doc.slug}" é uma palavra reservada — escolhe outro nome.`;
  const parent = doc.parent || null;
  if (parent == null) return null;
  if (typeof parent !== "string") return "Categoria-mãe inválida.";
  const slug = slugAtual ?? doc.slug;
  if (parent === slug) return "Uma categoria não pode estar dentro de si própria.";
  const mae = todas.find((c) => c.slug === parent);
  if (!mae) return "A categoria-mãe não existe (pode ter sido apagada).";
  if (mae.parent) return "Só há dois níveis: escolhe uma categoria de topo como mãe.";
  if (slug && todas.some((c) => c.parent === slug))
    return "Esta categoria tem subcategorias — não pode passar a subcategoria.";
  return null;
}

/** Categoria e subcategoria de um produto são coerentes? (mensagem ou null) */
export function erroCategoriaProduto(doc, todas = []) {
  const cat = todas.find((c) => c.slug === doc.categoria);
  if (!cat) return "Escolhe a categoria do produto.";
  if (cat.parent) return "A categoria tem de ser de topo (a subcategoria escolhe-se à parte).";
  if (doc.subcategoria) {
    const sub = todas.find((c) => c.slug === doc.subcategoria);
    if (!sub || sub.parent !== cat.slug) return "A subcategoria não pertence à categoria escolhida.";
  }
  return null;
}

const numero = (v) => (v === "" || v == null ? NaN : Number(v));

/**
 * Normaliza e valida os campos de preço/quantidade de um produto ou plano
 * (altera `doc`). Devolve a mensagem de erro, ou null.
 */
export function normalizaPreco(doc) {
  if (!PRECO_TIPOS.includes(doc.precoTipo)) doc.precoTipo = "consulta";
  const p = numero(doc.preco);
  if (doc.precoTipo === "valor") {
    if (!Number.isFinite(p) || p <= 0) return "Indica o preço (um valor maior que zero) ou escolhe «Preço sob consulta».";
    if (p > 10_000_000) return "Preço demasiado alto.";
    doc.preco = Math.round(p * 100) / 100;
  } else {
    doc.preco = Number.isFinite(p) && p > 0 ? Math.round(p * 100) / 100 : null;
  }
  if ("minimo" in doc) {
    const m = Math.floor(numero(doc.minimo));
    doc.minimo = Number.isFinite(m) && m >= 1 ? Math.min(m, 9999) : 1;
  }
  return null;
}

const ID_ITEM = /^[A-Za-z][A-Za-z0-9_-]{0,39}$/;
const textoOuVazio = (v, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Ficha técnica: [[etiqueta, valor], …] — só pares de texto não vazios. */
export function limpaEspecificacoes(v) {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => Array.isArray(x) && typeof x[0] === "string" && x[0].trim())
    .slice(0, 60)
    .map(([k, val]) => [k.trim().slice(0, 120), textoOuVazio(val, 1000)]);
}

/** Lista de textos (funcionalidades, setores…). */
export function limpaTextos(v, max = 40) {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string" && x.trim()).slice(0, max).map((x) => x.trim().slice(0, 500));
}

/** Lista de URLs de imagens. */
export function limpaImagens(v) {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string" && /^(https:\/\/|\/)/.test(x)).slice(0, 30);
}

/** Validação completa de um produto (altera `doc`): mensagem ou null. */
export function erroProduto(doc) {
  for (const k of ["nome", "marca", "categoria", "subcategoria", "resumo", "descricao", "unidade"]) {
    if (k in doc) doc[k] = textoOuVazio(doc[k], k === "descricao" ? 8000 : 600);
  }
  if ("especificacoes" in doc) doc.especificacoes = limpaEspecificacoes(doc.especificacoes);
  if ("imagens" in doc) doc.imagens = limpaImagens(doc.imagens);
  return normalizaPreco(doc);
}

/** Validação de uma solução tecnológica (altera `doc`): mensagem ou null. */
export function erroSolucao(doc) {
  for (const k of ["nome", "tagline", "problema", "parceiro", "video", "url"]) {
    if (k in doc) doc[k] = textoOuVazio(doc[k], k === "problema" ? 6000 : 600);
  }
  if ("tipo" in doc && !(doc.tipo in TIPOS_SOLUCAO)) return "Escolhe se é uma solução que desenvolvemos ou que representamos.";
  if (doc.video && !/^https:\/\//.test(doc.video)) return "O vídeo tem de ser um link https (YouTube, Vimeo ou ficheiro).";
  if (doc.url && !/^https?:\/\//.test(doc.url)) return "O link tem de começar por https://";
  if ("paraQuem" in doc) doc.paraQuem = limpaTextos(doc.paraQuem, 20);
  if ("funcionalidades" in doc) doc.funcionalidades = limpaTextos(doc.funcionalidades, 40);
  if ("imagens" in doc) doc.imagens = limpaImagens(doc.imagens);
  if (Array.isArray(doc.planos)) {
    doc.planos = doc.planos.filter((p) => textoOuVazio(p.nome)).slice(0, 8);
    doc.planos.forEach((p, i) => {
      if (!ID_ITEM.test(p.id || "")) p.id = `p${i + 1}${Date.now().toString(36)}`;
    });
    for (const p of doc.planos) {
      p.nome = textoOuVazio(p.nome, 120);
      p.descricao = textoOuVazio(p.descricao, 2000);
      p.unidade = textoOuVazio(p.unidade, 80);
      p.itens = limpaTextos(p.itens, 20);
      const e = normalizaPreco(p);
      if (e) return `Plano «${p.nome}»: ${e}`;
    }
  }
  if (Array.isArray(doc.casos)) {
    doc.casos = doc.casos.filter((c) => textoOuVazio(c.titulo) || textoOuVazio(c.texto)).slice(0, 12);
    doc.casos.forEach((c, i) => {
      if (!ID_ITEM.test(c.id || "")) c.id = `c${i + 1}${Date.now().toString(36)}`;
    });
    for (const c of doc.casos) {
      c.titulo = textoOuVazio(c.titulo, 200);
      c.texto = textoOuVazio(c.texto, 3000);
      c.autor = textoOuVazio(c.autor, 200);
    }
  }
  return null;
}

/** Tem preço visível? */
export const temPreco = (x) => x?.precoTipo === "valor" && Number(x.preco) > 0;

/** "12,50 €" (pt) / "€12.50" (en). */
export function formataPreco(valor, lang = "pt") {
  const n = Number(valor);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat(lang === "en" ? "en-GB" : "pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(n);
}

const semAcentos = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/**
 * Filtros do catálogo (página da categoria): subcategoria, marca,
 * disponibilidade ("disponivel"), preço ("valor" | "consulta") e pesquisa
 * por texto (nome, referência/slug, resumo, marca — sem acentos).
 */
export function filtrarProdutos(lista, { sub = "", marca = "", disp = "", preco = "", q = "" } = {}) {
  const termos = semAcentos(q).split(/\s+/).filter(Boolean);
  return (lista || []).filter((p) => {
    if (sub && p.subcategoria !== sub) return false;
    if (marca && p.marca !== marca) return false;
    if (disp === "disponivel" && p.disponivel === false) return false;
    if (preco === "valor" && !temPreco(p)) return false;
    if (preco === "consulta" && temPreco(p)) return false;
    if (termos.length) {
      const alvo = semAcentos(`${p.nome} ${p.slug || ""} ${p.resumo || ""} ${p.marcaNome || ""} ${p.unidade || ""}`);
      if (!termos.every((t) => alvo.includes(t))) return false;
    }
    return true;
  });
}

/**
 * Ordenação do catálogo: "" (a do backoffice — destaques e ordem), "nome",
 * "preco" (mais barato primeiro) ou "preco-desc". Os "sob consulta" ficam
 * sempre no fim quando se ordena por preço.
 */
export function ordenarProdutos(lista, ordem = "") {
  const l = [...(lista || [])];
  if (ordem === "nome") return l.sort((a, b) => String(a.nome).localeCompare(String(b.nome), "pt"));
  if (ordem === "preco" || ordem === "preco-desc") {
    const sinal = ordem === "preco" ? 1 : -1;
    return l.sort((a, b) => {
      const pa = temPreco(a), pb = temPreco(b);
      if (pa !== pb) return pa ? -1 : 1;
      return pa ? sinal * (Number(a.preco) - Number(b.preco)) : 0;
    });
  }
  return l;
}
