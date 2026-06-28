import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CompareProvider } from "@/components/compare/CompareProvider";
import CompareBar from "@/components/compare/CompareBar";

export const metadata = {
  title: {
    default: "Meridie Investments — Investimento imobiliário Portugal e Brasil",
    template: "%s | Meridie Investments",
  },
  description:
    "Plataforma de investimento imobiliário transfronteiriço entre Portugal e o Brasil. Capital sem fronteiras, investimento com precisão — intermediação, assessoria jurídica e fiscal num único processo.",
  openGraph: {
    title: "Meridie Investments — Investimento imobiliário Portugal e Brasil",
    description:
      "Capital sem fronteiras. Investimento com precisão. Portugal ↔ Brasil.",
    locale: "pt_PT",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-PT">
      <body>
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
