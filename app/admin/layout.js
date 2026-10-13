import "../globals.css";
import { Spectral } from "next/font/google";

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--fonte-serif",
  display: "swap",
});

export const metadata = {
  title: { default: "Backoffice", template: "%s · Backoffice" },
  robots: { index: false, follow: false },
};

// Layout raiz do backoffice (o site público tem o seu em app/[lang]).
// O wrapper .admin-page serve de gancho para os estilos do admin.
export default function AdminLayout({ children }) {
  return (
    <html lang="pt-PT" className={spectral.variable}>
      <body>
        <div className="admin-page">{children}</div>
      </body>
    </html>
  );
}
