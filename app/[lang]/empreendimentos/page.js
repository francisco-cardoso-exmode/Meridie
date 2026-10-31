import ListingsExplorer from "@/components/ListingsExplorer";
import {
  allEmpreendimentos,
  zonasDe,
  tiposDe,
  finalidadesDe,
} from "@/lib/store";
import { getConteudo } from "@/lib/conteudo";
import { t, tf } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";
import { cartaoEmpreendimento } from "@/lib/empreendimentos";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPagina(lang, "/empreendimentos", {
    titulo: t(lang, "Todos os empreendimentos"),
    descricao: t(lang, "Toda a oferta de empreendimentos da Meridie em Portugal e no Brasil. Pesquisa e filtra por país, zona, tipologia, finalidade e preço."),
  });
}

export const revalidate = 60;

export default async function EmpreendimentosPage({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("empreendimentos", lang);
  const empreendimentos = traduzLista(await allEmpreendimentos(), lang).map(cartaoEmpreendimento);
  const paises = [...new Set(empreendimentos.map((e) => e.pais))];

  return (
    <div className="pagina-area">
      <div className="container" style={{ padding: "40px 0 80px" }}>
        {/* Sem Reveal: o <h1> é o LCP e não deve começar escondido. */}
        <div className="section-head" style={{ marginBottom: 24 }}>
          <span className="eyebrow">{c.heroEyebrow}</span>
          <h1 style={{ fontSize: "2rem" }}>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>

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
