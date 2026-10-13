import Reveal from "@/components/Reveal";
import ListingsExplorer from "@/components/ListingsExplorer";
import {
  allEmpreendimentos,
  zonasDe,
  tiposDe,
  finalidadesDe,
} from "@/lib/store";
import { t, tf, alternates } from "@/lib/i18n";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: t(lang, "Todos os empreendimentos"),
    description: t(lang, "Toda a oferta de empreendimentos da Meridie em Portugal e no Brasil. Pesquisa e filtra por país, zona, tipologia, finalidade e preço."),
    alternates: alternates(lang, "/empreendimentos"),
  };
}

export const revalidate = 60;

export default async function EmpreendimentosPage({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const empreendimentos = traduzLista(await allEmpreendimentos(), lang);
  const paises = [...new Set(empreendimentos.map((e) => e.pais))];

  return (
    <div className="pagina-area">
      <div className="container" style={{ padding: "40px 0 80px" }}>
        <Reveal className="section-head" style={{ marginBottom: 24 }}>
          <span className="eyebrow">{T("Oferta")}</span>
          <h1 style={{ fontSize: "2rem" }}>{T("Todos os empreendimentos")}</h1>
          <p>
            {T("Toda a nossa oferta em Portugal e no Brasil num só sítio. Pesquisa pelo nome, cidade, zona ou referência, e refina com os filtros.")}
          </p>
        </Reveal>

        <ListingsExplorer
          empreendimentos={empreendimentos}
          zonas={zonasDe(empreendimentos)}
          tipos={tiposDe(empreendimentos)}
          finalidades={finalidadesDe(empreendimentos)}
          paises={paises}
          comBusca
          comPais
        />
      </div>
    </div>
  );
}
