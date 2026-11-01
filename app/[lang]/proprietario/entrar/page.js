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
      <p className="al-para-quem">
        <strong>{t(lang, "Área do proprietário")}</strong> — {t(lang, "as tuas casas, reservas, ganhos e relatórios fotográficos.")}
      </p>
      <ContaAl papel="proprietario" registo destino={caminho(lang, "/proprietario")} modoInicial={sp?.registo ? "registo" : "entrar"} />
      <p className="al-nota" style={{ textAlign: "center" }}>
        {t(lang, "Ainda a pensar?")} <L href="/inscreve-a-tua-casa">{t(lang, "Vê os planos e quanto podes ganhar")}</L>
      </p>
      <p className="al-nota" style={{ textAlign: "center" }}>
        {t(lang, "És hóspede? Não precisas de conta — usa o link pessoal do email de confirmação da reserva.")}{" "}
        {t(lang, "És da equipa Meridie?")} <a href="/equipa/entrar">{t(lang, "Entra aqui")}</a>.
      </p>
    </div>
  );
}
