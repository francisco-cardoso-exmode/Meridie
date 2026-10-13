/**
 * Que campos de cada coleção se traduzem para inglês, e utilitários para os
 * tratar como um mapa plano { "produtos.0.nome": "texto" }.
 * Sem dependências de servidor — usado também no backoffice (client).
 */

const so = (obj, chaves) =>
  Object.fromEntries(chaves.filter((k) => obj?.[k] != null && obj[k] !== "").map((k) => [k, obj[k]]));

const mapa = (lista, fn) => (Array.isArray(lista) ? lista.map(fn) : undefined);

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
  anuncios: (d) => so(d, ["texto", "vantagem", "cidade"]),
  // Páginas (CMS): todos os campos de texto menos contactos diretos.
  paginas: (d) => {
    const { email, telefone, ...resto } = d.campos || {};
    return resto;
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
