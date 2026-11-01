import { redirect } from "next/navigation";
import ContaAl from "@/components/al/ContaAl";
import { getEquipa } from "@/lib/al/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar" };

export default async function EntrarEquipa() {
  if (await getEquipa()) redirect("/equipa");
  return (
    <>
      <p className="al-para-quem">
        <strong>App da equipa Meridie</strong> — inspeções e limpezas. Entra com o email e a password que definiste no convite.
      </p>
      <ContaAl papel="equipa" destino="/equipa" />
      <p className="al-nota" style={{ textAlign: "center" }}>
        És proprietário? <a href="/proprietario/entrar">Entra aqui</a>.
      </p>
    </>
  );
}
