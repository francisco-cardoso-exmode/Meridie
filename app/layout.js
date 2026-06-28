import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CompareProvider } from "@/components/compare/CompareProvider";
import CompareBar from "@/components/compare/CompareBar";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const DESC =
  "Plataforma de investimento imobiliário transfronteiriço entre Portugal e o Brasil. Capital sem fronteiras, investimento com precisão — intermediação, assessoria jurídica e fiscal num único processo.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Meridie Investments — Investimento imobiliário Portugal e Brasil",
    template: "%s | Meridie Investments",
  },
  description: DESC,
  keywords: [
    "investimento imobiliário",
    "Portugal",
    "Brasil",
    "imóveis Portugal Brasil",
    "investir em Portugal",
    "investir no Brasil",
    "empreendimentos",
    "intermediação imobiliária",
    "Meridie Investments",
  ],
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Meridie Investments — Investimento imobiliário Portugal e Brasil",
    description: "Capital sem fronteiras. Investimento com precisão. Portugal ↔ Brasil.",
    locale: "pt_PT",
    url: SITE_URL,
    images: [{ url: "/meridie_logo.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridie Investments — Portugal ↔ Brasil",
    description: "Investimento imobiliário transfronteiriço com precisão.",
    images: ["/meridie_logo.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/meridie_logo.png`,
  description: DESC,
  areaServed: ["PT", "BR"],
  slogan: "Capital sem fronteiras. Investimento com precisão.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-PT">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CompareProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CompareBar />
        </CompareProvider>
      </body>
    </html>
  );
}
