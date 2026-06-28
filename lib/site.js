// URL base do site, usado em SEO (sitemap, canonical, Open Graph, JSON-LD).
// Define NEXT_PUBLIC_SITE_URL na Vercel com o teu domínio final
// (ex.: https://www.meridieinvestments.com). Caso contrário usa o domínio de
// produção da Vercel, e por fim um placeholder.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "https://meridie-investments.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "Meridie Investments";

export const abs = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
