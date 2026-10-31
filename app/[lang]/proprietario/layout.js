import "@/components/al/al.css";
import { SEM_INDEX } from "@/lib/al/paginas";

// App do proprietário (PWA instalável): manifest próprio, sem indexação.
export const metadata = {
  robots: SEM_INDEX,
  manifest: "/pwa/proprietario.webmanifest",
  appleWebApp: { capable: true, title: "Meridie", statusBarStyle: "default" },
  icons: { apple: "/pwa/apple-touch-icon.png" },
};

export const viewport = { themeColor: "#1b3f6e" };

export default function LayoutProprietario({ children }) {
  return <div className="al-app">{children}</div>;
}
