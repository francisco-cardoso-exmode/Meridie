import MarketHero from "@/components/MarketHero";
import Reveal from "@/components/Reveal";
import RegionBanner from "@/components/RegionBanner";
import ListingsExplorer from "@/components/ListingsExplorer";
import {
  getEmpreendimentos,
  getZonas,
  getTipos,
  getFinalidades,
} from "@/lib/empreendimentos";
import { getRegioes } from "@/lib/regioes";

export const metadata = {
  title: "Investir no Brasil",
  description:
    "Empreendimentos selecionados no Brasil — São Paulo, Rio de Janeiro, Nordeste e Sul. Yields superiores à média europeia e mercado em expansão. Filtra por zona, tipo e finalidade.",
};

export default function PaginaBrasil() {
  const empreendimentos = getEmpreendimentos({ pais: "brasil" });
  const regioes = getRegioes({ pais: "brasil" });

  return (
    <>
      <MarketHero
        img="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1600&q=72"
        alt="Rio de Janeiro, Brasil"
        eyebrow="Mercado Brasil"
        titulo="Investir no Brasil"
      >
        Preços competitivos face à Europa, yields superiores e um mercado em
        expansão. São Paulo, Rio, Nordeste e Sul.
      </MarketHero>

      <section style={{ paddingBottom: 40 }}>
        <div className="container">
          <Reveal className="section-head" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: "1.6rem" }}>Porquê o Brasil?</h2>
            <p>
              De São Paulo e Rio ao Nordeste e ao Sul, o mercado oferece opções
              para diferentes perfis e orçamentos. Tratamos das especificidades
              — ITBI, regras para não-residentes, cartórios e documentação.
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
              zonas={getZonas("brasil")}
              tipos={getTipos("brasil")}
              finalidades={getFinalidades("brasil")}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
