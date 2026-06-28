import Reveal from "@/components/Reveal";
import ListingsExplorer from "@/components/ListingsExplorer";
import {
  allEmpreendimentos,
  zonasDe,
  tiposDe,
  finalidadesDe,
} from "@/lib/store";

export const metadata = {
  title: "Todos os empreendimentos",
  description:
    "Toda a oferta de empreendimentos da Meridie em Portugal e no Brasil. Pesquisa e filtra por país, zona, tipologia, finalidade e preço.",
};

export const revalidate = 60;

export default async function EmpreendimentosPage() {
  const empreendimentos = await allEmpreendimentos();
  const paises = [...new Set(empreendimentos.map((e) => e.pais))];

  return (
    <div className="pagina-area">
      <div className="container" style={{ padding: "40px 0 80px" }}>
        <Reveal className="section-head" style={{ marginBottom: 24 }}>
          <span className="eyebrow">Oferta</span>
          <h1 style={{ fontSize: "2rem" }}>Todos os empreendimentos</h1>
          <p>
            Toda a nossa oferta em Portugal e no Brasil num só sítio. Pesquisa
            pelo nome, cidade, zona ou referência, e refina com os filtros.
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
