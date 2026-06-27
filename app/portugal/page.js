import MarketHero from "@/components/MarketHero";
import Reveal from "@/components/Reveal";
import RegionBanner from "@/components/RegionBanner";
import ListingsExplorer from "@/components/ListingsExplorer";
import {
  allEmpreendimentos,
  allRegioes,
  zonasDe,
  tiposDe,
  finalidadesDe,
} from "@/lib/store";

export const metadata = {
  title: "Investir em Portugal",
  description:
    "Empreendimentos selecionados em Portugal — Lisboa, Porto, Algarve e Cascais. Segurança jurídica europeia e valorização consistente. Filtra por zona, tipo e finalidade.",
};

export const revalidate = 60;

export default async function PaginaPortugal() {
  const empreendimentos = await allEmpreendimentos({ pais: "portugal" });
  const regioes = await allRegioes({ pais: "portugal", topo: true });

  return (
    <>
      <MarketHero
        img="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=72"
        alt="Lisboa, Portugal"
        eyebrow="Mercado Portugal"
        titulo="Investir em Portugal"
      >
        Estabilidade jurídica europeia, valorização consistente e a porta de
        entrada para a Europa. Lisboa, Porto, Algarve e Cascais.
      </MarketHero>

      <section style={{ paddingBottom: 40 }}>
        <div className="container">
          <Reveal className="section-head" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: "1.6rem" }}>Porquê Portugal?</h2>
            <p>
              Lisboa, Porto e Algarve oferecem mercados maduros, liquidez e
              procura internacional constante. O regime fiscal para novos
              residentes e a proteção patrimonial em Euro completam o cenário.
            </p>
          </Reveal>
          <div className="region-grid">
            {regioes.map((r, i) => (
              <Reveal key={r.slug} delay={(i % 2) * 0.1}>
                <RegionBanner regiao={r} compact />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <ListingsExplorer
              empreendimentos={empreendimentos}
              zonas={zonasDe(empreendimentos)}
              tipos={tiposDe(empreendimentos)}
              finalidades={finalidadesDe(empreendimentos)}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
