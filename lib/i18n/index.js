import EN from "@/lib/i18n/en";

/**
 * Idiomas do site. O português vive na raiz (/marcas) e o inglês em /en, com
 * os caminhos traduzidos (/en/brands). Internamente as rotas são sempre as
 * portuguesas, dentro de app/[lang]; o middleware faz a correspondência.
 */

export const LANGS = ["pt", "en"];
export const LANG_PADRAO = "pt";
export const LOCALE = { pt: "pt-PT", en: "en-GB" };
export const OG_LOCALE = { pt: "pt_PT", en: "en_GB" };

export const ehLang = (l) => LANGS.includes(l);

// 1.º segmento interno (PT) → segmento em inglês.
const ROTAS_EN = {
  portugal: "portugal",
  brasil: "brazil",
  "como-funciona": "how-it-works",
  comparar: "compare",
  contactos: "contact",
  cookies: "cookies",
  empreendimentos: "properties",
  faq: "faq",
  marcas: "brands",
  parcerias: "partnerships",
  privacidade: "privacy",
  publicidade: "partners",
  "quem-somos": "about",
  regioes: "regions",
  tecnologia: "technology",
  termos: "terms",
};
const ROTAS_PT = Object.fromEntries(Object.entries(ROTAS_EN).map(([pt, en]) => [en, pt]));

const separa = (href) => {
  const m = String(href).match(/^([^?#]*)(.*)$/);
  return [m[1] || "/", m[2] || ""];
};

/** Caminho interno (PT, ex. "/marcas/x?y=1") → URL pública no idioma pedido. */
export function caminho(lang, href) {
  if (!href || typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) return href;
  if (href.startsWith("/api") || href.startsWith("/admin")) return href;
  if (lang !== "en") return href;
  const [p, resto] = separa(href);
  const partes = p.split("/").filter(Boolean);
  if (partes.length) partes[0] = ROTAS_EN[partes[0]] || partes[0];
  return `/en${partes.length ? "/" + partes.join("/") : ""}${resto}`;
}

/** URL pública ("/en/brands/x") → { lang, interno: "/marcas/x" }. */
export function paraInterno(pathname) {
  const partes = String(pathname || "/").split("/").filter(Boolean);
  if (partes[0] === "en") {
    partes.shift();
    if (partes.length) partes[0] = ROTAS_PT[partes[0]] || partes[0];
    return { lang: "en", interno: "/" + partes.join("/") };
  }
  return { lang: "pt", interno: "/" + partes.join("/") };
}

/** Tradução de um texto fixo do site (dicionário indexado pelo português). */
export function t(lang, texto) {
  if (lang !== "en" || texto == null) return texto;
  return EN[texto] ?? texto;
}

/** Versão de um texto com variáveis: t(lang, "Ver os {n} produtos", { n: 3 }). */
export function tf(lang, texto, vars = {}) {
  return t(lang, texto).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

// Junta a tradução guardada (doc.en) por cima do documento português.
function junta(base, en) {
  if (en == null) return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(en)) return base;
    return base.map((v, i) => junta(v, en[i]));
  }
  if (base && typeof base === "object") {
    if (typeof en !== "object") return base;
    const out = { ...base };
    for (const k of Object.keys(base)) if (k in en) out[k] = junta(base[k], en[k]);
    return out;
  }
  return typeof en === "string" && en.trim() ? en : base;
}

/** Documento da base (imóvel, marca, região…) no idioma pedido. */
export function traduzDoc(doc, lang) {
  if (!doc || lang !== "en" || !doc.en) return doc;
  const { en, enFonte, ...base } = doc;
  return junta(base, en);
}

export const traduzLista = (lista, lang) => (lang === "en" ? lista.map((d) => traduzDoc(d, lang)) : lista);

/** alternates (canonical + hreflang) para os metadados de uma página. */
export function alternates(lang, interno) {
  return {
    canonical: caminho(lang, interno),
    languages: {
      "pt-PT": caminho("pt", interno),
      en: caminho("en", interno),
      "x-default": caminho("pt", interno),
    },
  };
}
