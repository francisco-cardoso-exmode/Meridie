import "../globals.css";
import "@/components/al/al.css";
import { SEM_INDEX } from "@/lib/al/paginas";

// App da equipa de terreno (PWA instalável, só PT): layout raiz próprio,
// sem o cabeçalho do site — ecrã limpo para usar no telemóvel.
export const metadata = {
  title: { default: "Equipa · Meridie", template: "%s · Equipa Meridie" },
  robots: SEM_INDEX,
  manifest: "/pwa/equipa.webmanifest",
  appleWebApp: { capable: true, title: "Meridie Equipa", statusBarStyle: "default" },
  icons: { apple: "/pwa/apple-touch-icon.png" },
};

export const viewport = { themeColor: "#1b3f6e", width: "device-width", initialScale: 1 };

export default function LayoutEquipa({ children }) {
  return (
    <html lang="pt-PT">
      <body className="al-equipa">
        <header className="al-equipa-topo">
          <a href="/equipa">
            MERIDIE <span>EQUIPA</span>
          </a>
        </header>
        <main className="al-equipa-main">{children}</main>
      </body>
    </html>
  );
}
