import "../globals.css";
import { notFound } from "next/navigation";
import { LangProvider } from "@/components/LangProvider";
import { LANGS, ehLang, LOCALE, OG_LOCALE, t, alternates } from "@/lib/i18n";
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
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Fonte serif dos títulos (liga ao logo). Igual em todos os dispositivos.
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--fonte-serif",
  display: "swap",
});

const DESC =
  "Plataforma de investimento imobiliário transfronteiriço entre Portugal e o Brasil. Capital sem fronteiras, investimento com precisão — intermediação, assessoria jurídica e fiscal num único processo.";

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
    alternates: alternates(lang, "/"),
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: titulo,
      description: t(lang, "Capital sem fronteiras. Investimento com precisão. Portugal ↔ Brasil."),
      locale: OG_LOCALE[lang],
      url: SITE_URL,
      images: [{ url: "/meridie_logo.png", width: 1000, height: 169, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Meridie Investments — Portugal ↔ Brasil",
      description: t(lang, "Investimento imobiliário transfronteiriço com precisão."),
      images: ["/meridie_logo.png"],
    },
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
  const cambio = await getCambio();

  return (
    <html lang={LOCALE[lang]} className={spectral.variable}>
      <body>
        <Analytics />
        <TrackVisita />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lang)) }}
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
              <Header />
              <main>{children}</main>
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
