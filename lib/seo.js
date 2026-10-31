import { SITE_URL, SITE_NAME } from "@/lib/site";
import { caminho, alternates, t, OG_LOCALE, LANGS } from "@/lib/i18n";

/**
 * Metadados SEO por página (título, descrição, canonical/hreflang, Open Graph
 * e Twitter), para que nenhuma página herde o og:url/título da Home.
 *
 *   export async function generateMetadata({ params }) {
 *     const { lang } = await params;
 *     return metaPagina(lang, "/faq", { titulo: t(lang, "…"), descricao: "…" });
 *   }
 */

// Descrição geral do site (Home e dados estruturados da organização).
export const DESCRICAO_SITE =
  "Plataforma de investimento imobiliário transfronteiriço entre Portugal e o Brasil. Capital sem fronteiras, investimento com precisão — intermediação, assessoria jurídica e fiscal num único processo.";

// Imagem de partilha por defeito (logótipo).
const IMAGEM_PADRAO = { url: "/meridie_logo.png", width: 1000, height: 169, alt: SITE_NAME };

/** URL absoluto e público de um caminho interno (PT) no idioma pedido.
 *  Nunca termina em "/" (nem a raiz) — igual ao canonical/hreflang que o Next gera e ao sitemap. */
export function urlPublica(lang, interno = "/") {
  const p = caminho(lang, interno || "/");
  return p === "/" ? SITE_URL : `${SITE_URL}${p.replace(/\/+$/, "")}`;
}

/**
 * @param {string} lang
 * @param {string} interno  caminho interno em PT (ex. "/empreendimentos/x")
 * @param {object} o
 *  - titulo: título da página (vai para o template "%s | Meridie Investments")
 *  - tituloAbsoluto: true para não aplicar o template (Home)
 *  - descricao
 *  - imagem: URL de uma imagem (ou objeto { url, width, height, alt })
 *  - tipo: og:type ("website" por defeito)
 *  - indexar: false para noindex (comparador, páginas de erro)
 */
export function metaPagina(lang, interno, { titulo, tituloAbsoluto = false, descricao, imagem, tipo = "website", indexar = true } = {}) {
  const tituloCompleto = tituloAbsoluto || !titulo ? titulo || SITE_NAME : `${titulo} | ${SITE_NAME}`;
  const img = imagem
    ? typeof imagem === "string"
      ? { url: imagem, alt: titulo || SITE_NAME }
      : imagem
    : IMAGEM_PADRAO;
  return {
    title: tituloAbsoluto ? { absolute: tituloCompleto } : titulo,
    description: descricao,
    alternates: alternates(lang, interno),
    robots: indexar
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
      : { index: false, follow: true },
    openGraph: {
      type: tipo,
      siteName: SITE_NAME,
      title: tituloCompleto,
      description: descricao,
      url: urlPublica(lang, interno),
      locale: OG_LOCALE[lang],
      alternateLocale: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      images: [img],
    },
    twitter: {
      card: "summary_large_image",
      title: tituloCompleto,
      description: descricao,
      images: [img.url],
    },
  };
}

/** Metadados de uma página que não existe (antes do notFound()): sem
 *  canonical e sem indexação. */
export function metaNaoEncontrado(lang, titulo) {
  return {
    title: titulo || t(lang, "Página não encontrada"),
    alternates: {},
    robots: { index: false, follow: false },
  };
}

/** JSON para <script type="application/ld+json">, com "<" escapado para não
 *  fechar a tag (ex. "</script>" vindo de um texto do backoffice). */
export const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");
