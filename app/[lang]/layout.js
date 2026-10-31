import "../globals.css";
import { notFound } from "next/navigation";
import { LangProvider } from "@/components/LangProvider";
import { LANGS, ehLang, LOCALE, t } from "@/lib/i18n";
import { jsonLd as ldJson, DESCRICAO_SITE } from "@/lib/seo";
import { Spectral } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CompareProvider } from "@/components/compare/CompareProvider";
import { CambioProvider } from "@/components/CambioProvider";
import { getCambio } from "@/lib/cambio";
import CompareBar from "@/components/compare/CompareBar";
import Analytics from "@/components/Analytics";
import TrackVisita from "@/components/TrackVisita";
import CookieConsent from "@/components/CookieConsent";
import { CONSENT_PADRAO } from "@/lib/consentimento";
import { haCasasPublicadas } from "@/lib/al/casas";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Fonte serif dos títulos (liga ao logo). Igual em todos os dispositivos.
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--fonte-serif",
  display: "swap",
});

const DESC = DESCRICAO_SITE;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const titulo = t(lang, "Meridie Investments — Investimento imobiliário Portugal e Brasil");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: titulo, template: "%s | Meridie Investments" },
    description: t(lang, DESC),
    keywords:
      lang === "en"
        ? ["real estate investment", "Portugal", "Brazil", "invest in Portugal", "invest in Brazil", "Portuguese wines", "Meridie Investments"]
        : ["investimento imobiliário", "Portugal", "Brasil", "imóveis Portugal Brasil", "investir em Portugal", "investir no Brasil", "empreendimentos", "intermediação imobiliária", "Meridie Investments"],
    applicationName: SITE_NAME,
    // Canonical, robots, Open Graph e Twitter são definidos por página
    // (lib/seo.js → metaPagina), para nenhuma herdar os da Home — e uma
    // página 404 fica só com o noindex do Next.
  };
}

const jsonLd = (lang) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/meridie_logo.png`,
  description: t(lang, DESC),
  areaServed: ["PT", "BR"],
  slogan: t(lang, "Capital sem fronteiras. Investimento com precisão."),
});

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!ehLang(lang)) notFound();
  // Cotação EUR→BRL do momento; no browser é revalidada (ver CambioProvider).
  const [cambio, temCasas] = await Promise.all([getCambio(), haCasasPublicadas()]);

  return (
    <html lang={LOCALE[lang]} className={spectral.variable}>
      <body>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <script id="ga-consent-default" dangerouslySetInnerHTML={{ __html: CONSENT_PADRAO }} />
        )}
        <Analytics />
        <TrackVisita />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(jsonLd(lang)) }}
        />
        <CambioProvider
          inicial={{
            taxa: cambio.taxa,
            aoVivo: cambio.aoVivo,
            atualizadoEm: cambio.atualizadoEm
              ? new Date(cambio.atualizadoEm).toISOString()
              : null,
          }}
        >
          <LangProvider lang={lang}>
            <CompareProvider>
              <a href="#conteudo" className="skip-link">
                {t(lang, "Saltar para o conteúdo")}
              </a>
              <Header temCasas={temCasas} />
              <main id="conteudo" tabIndex={-1}>
                {children}
              </main>
              <Footer lang={lang} />
              <CompareBar />
              <CookieConsent />
            </CompareProvider>
          </LangProvider>
        </CambioProvider>
      </body>
    </html>
  );
}
