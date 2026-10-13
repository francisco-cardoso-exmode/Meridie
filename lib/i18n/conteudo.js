import CONTEUDO_EN from "@/lib/i18n/conteudoTraduzido";

/**
 * Conteúdo da base (imóveis, regiões, marcas, parceiros) no idioma pedido.
 * Ordem para cada texto em inglês:
 *  1. a tradução guardada no próprio documento (doc.en — automática ou
 *     corrigida no backoffice);
 *  2. a tradução de referência em lib/i18n/conteudoTraduzido.js, procurada
 *     pelo texto português exato (se o português mudar, deixa de valer);
 *  3. o texto português.
 * Usar só em componentes de servidor (páginas), para o dicionário de conteúdo
 * não ir para o browser.
 */

function junta(base, en) {
  if (typeof base === "string") {
    if (typeof en === "string" && en.trim()) return en;
    return CONTEUDO_EN[base] ?? base;
  }
  if (Array.isArray(base)) return base.map((v, i) => junta(v, Array.isArray(en) ? en[i] : undefined));
  if (base && typeof base === "object") {
    const out = {};
    for (const k of Object.keys(base)) out[k] = CAMPOS_FIXOS.has(k) ? base[k] : junta(base[k], en?.[k]);
    return out;
  }
  return base;
}

// Campos que nunca se traduzem (identificadores, códigos, ligações, imagens).
const CAMPOS_FIXOS = new Set([
  "slug", "slugsAntigos", "referencia", "pais", "nivel", "parent", "imagem", "imagens", "logo",
  "url", "siteUrl", "video", "moeda", "precoTipo", "icon", "cidade", "zona", "cidades", "zonas",
]);

/** Documento da base no idioma pedido. */
export function traduzDoc(doc, lang) {
  if (!doc || lang !== "en") return doc;
  const { en, enFonte, ...base } = doc;
  return junta(base, en || {});
}

export const traduzLista = (lista, lang) => (lang === "en" ? lista.map((d) => traduzDoc(d, lang)) : lista);
