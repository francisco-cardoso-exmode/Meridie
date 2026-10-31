import "@/components/al/al.css";
import { SEM_INDEX } from "@/lib/al/paginas";

// Página do hóspede (link pessoal com token): nunca indexada, e sem enviar o
// endereço (com o token) como Referer para outros sites.
export const metadata = { robots: SEM_INDEX, referrer: "no-referrer" };

export default function LayoutEstadia({ children }) {
  return <div className="al-app">{children}</div>;
}
