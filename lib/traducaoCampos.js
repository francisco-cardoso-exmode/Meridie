/**
 * Que campos de cada coleção se traduzem para inglês, e utilitários para os
 * tratar como um mapa plano { "produtos.0.nome": "texto" }.
 * Sem dependências de servidor — usado também no backoffice (client).
 */

const so = (obj, chaves) =>
  Object.fromEntries(chaves.filter((k) => obj?.[k] != null && obj[k] !== "").map((k) => [k, obj[k]]));

const mapa = (lista, fn) => (Array.isArray(lista) ? lista.map(fn) : undefined);

// Listas das páginas (CMS, lib/conteudo.js): campos dos itens que não se
// traduzem, e o formato do id (começa por letra — nunca é lido como posição).
export const CAMPOS_ITEM_FIXOS = new Set(["id", "icone"]);
export const ID_ITEM = /^[A-Za-z][A-Za-z0-9_-]{0,39}$/;

// [{ id: "a", titulo: "x", icone: "globe" }] → { a: { titulo: "x" } } — a
// tradução fica pelo id do item, não pela posição (sobrevive a reordenar).
const listaPorId = (lista) =>
  Object.fromEntries(
    lista
      .filter((x) => x && typeof x === "object" && typeof x.id === "string" && ID_ITEM.test(x.id))
      .map((x) => [
        x.id,
        Object.fromEntries(
          Object.entries(x).filter(([k, v]) => !CAMPOS_ITEM_FIXOS.has(k) && typeof v === "string")
        ),
      ])
  );

// Para cada coleção: devolve a parte traduzível do documento (mesma forma).
export const EXTRATORES = {
  empreendimentos: (d) => ({
    ...so(d, ["nome", "resumo", "descricao", "caracteristicas", "proximidades"]),
    ...(Array.isArray(d.tipologias)
      ? { tipologias: d.tipologias.map((t) => (typeof t === "string" ? t : so(t, ["nome", "area"]))) }
      : {}),
    ...(Array.isArray(d.links) ? { links: mapa(d.links, (l) => so(l, ["label"])) } : {}),
  }),
  regioes: (d) => ({
    ...so(d, ["tagline", "descricao", "sobre", "crescimento", "conhecidaPor", "oQueVer", "transportes", "vantagens"]),
    ...(Array.isArray(d.distancias) ? { distancias: mapa(d.distancias, (x) => so(x, ["local"])) } : {}),
    ...(Array.isArray(d.destaques) ? { destaques: mapa(d.destaques, (x) => so(x, ["titulo", "texto"])) } : {}),
    ...(Array.isArray(d.pontos) ? { pontos: mapa(d.pontos, (x) => so(x, ["nome"])) } : {}),
    ...(Array.isArray(d.publicidade) ? { publicidade: mapa(d.publicidade, (x) => so(x, ["titulo", "texto"])) } : {}),
  }),
  marcas: (d) => ({
    ...so(d, ["origem", "texto"]),
    ...(Array.isArray(d.produtos)
      ? { produtos: mapa(d.produtos, (p) => so(p, ["nome", "descricao", "caracteristicas"])) }
      : {}),
  }),
  // "cidade" não se traduz (nome próprio; está em CAMPOS_FIXOS de
  // lib/i18n/conteudo.js, como nos empreendimentos e regiões).
  anuncios: (d) => so(d, ["texto", "vantagem"]),
  // Alojamento Local: textos da casa (cidade/zona são nomes próprios).
  al_casas: (d) => so(d, ["titulo", "descricao", "regras"]),
  // Páginas (CMS): todos os campos de texto menos contactos diretos; as
  // listas por id ("diferenciais.dif1.titulo").
  paginas: (d) => {
    const { email, telefone, ...resto } = d.campos || {};
    return Object.fromEntries(
      Object.entries(resto).map(([k, v]) => [k, Array.isArray(v) ? listaPorId(v) : v])
    );
  },
};

export const COLECOES_TRADUZIVEIS = Object.keys(EXTRATORES);

export function extrair(colecao, doc) {
  const fn = EXTRATORES[colecao];
  return fn && doc ? fn(doc) : {};
}

/** { a: { b: ["x"] } } → { "a.b.0": "x" } (só folhas de texto não vazias). */
export function achata(obj, prefixo = "", out = {}) {
  if (typeof obj === "string") {
    if (obj.trim()) out[prefixo] = obj;
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => achata(v, prefixo ? `${prefixo}.${i}` : String(i), out));
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) achata(v, prefixo ? `${prefixo}.${k}` : k, out);
  }
  return out;
}

/** Inverso de achata: { "a.b.0": "x" } → { a: { b: ["x"] } }. */
export function desachata(plano) {
  const raiz = {};
  for (const [caminho, valor] of Object.entries(plano)) {
    const partes = caminho.split(".");
    let no = raiz;
    partes.forEach((p, i) => {
      const ultimo = i === partes.length - 1;
      const proxNumero = !ultimo && /^\d+$/.test(partes[i + 1]);
      if (ultimo) no[p] = valor;
      else {
        if (no[p] == null) no[p] = proxNumero ? [] : {};
        no = no[p];
      }
    });
  }
  return raiz;
}

/**
 * Estado da tradução de um documento: que textos portugueses ainda não têm
 * versão inglesa atualizada (novos ou alterados desde a última tradução).
 */
export function pendentes(colecao, doc) {
  const src = achata(extrair(colecao, doc));
  const fonte = achata(doc?.enFonte || {});
  const en = achata(doc?.en || {});
  return Object.keys(src).filter((k) => !en[k] || fonte[k] !== src[k]);
}
