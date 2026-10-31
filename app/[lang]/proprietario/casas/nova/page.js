import CasaForm from "@/components/al/CasaForm";
import NavProprietario from "@/components/al/NavProprietario";
import { t } from "@/lib/i18n";
import { exigirProprietario, metaPrivada } from "@/lib/al/paginas";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPrivada(lang, "Nova casa");
}

export default async function NovaCasa({ params }) {
  const { lang } = await params;
  const p = await exigirProprietario(lang);
  return (
    <div className="container al-pagina">
      <NavProprietario lang={lang} nome={p.nome} />
      <h1>{t(lang, "Nova casa")}</h1>
      <p className="al-nota">{t(lang, "Fica em rascunho até a enviares para análise. Podes completar depois.")}</p>
      <CasaForm casa={null} />
    </div>
  );
}
