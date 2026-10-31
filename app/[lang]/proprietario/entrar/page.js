import { redirect } from "next/navigation";
import ContaAl from "@/components/al/ContaAl";
import L from "@/components/L";
import { caminho, t } from "@/lib/i18n";
import { metaPrivada } from "@/lib/al/paginas";
import { getProprietario } from "@/lib/al/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPrivada(lang, "Entrar — proprietários");
}

export default async function EntrarProprietario({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  if (await getProprietario()) redirect(caminho(lang, "/proprietario"));
  return (
    <div className="container al-pagina al-estreita">
      <ContaAl papel="proprietario" registo destino={caminho(lang, "/proprietario")} modoInicial={sp?.registo ? "registo" : "entrar"} />
      <p className="al-nota" style={{ textAlign: "center" }}>
        {t(lang, "Ainda a pensar?")} <L href="/inscreve-a-tua-casa">{t(lang, "Vê os planos e quanto podes ganhar")}</L>
      </p>
    </div>
  );
}
