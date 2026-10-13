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
import { t, tf, alternates } from "@/lib/i18n";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: t(lang, "Investir em Portugal"),
    description: t(lang, "Empreendimentos selecionados em Portugal — Lisboa, Porto, Algarve e Cascais. Segurança jurídica europeia e valorização consistente. Filtra por zona, tipo e finalidade."),
    alternates: alternates(lang, "/portugal"),
  };
}

export const revalidate = 60;

export default async function PaginaPortugal({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const empreendimentos = traduzLista(await allEmpreendimentos({ pais: "portugal" }), lang);
  const regioes = traduzLista(await allRegioes({ pais: "portugal", topo: true }), lang);

  return (
    <>
      <MarketHero
        img="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=72"
        alt={T("Lisboa, Portugal")}
        eyebrow={T("Mercado Portugal")}
        titulo={T("Investir em Portugal")}
      >
        {T("Estabilidade jurídica europeia, valorização consistente e a porta de entrada para a Europa. Lisboa, Porto, Algarve e Cascais.")}
      </MarketHero>

      <section style={{ paddingBottom: 40 }}>
        <div className="container">
          <Reveal className="section-head" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: "1.6rem" }}>{T("Porquê Portugal?")}</h2>
            <p>
              {T("Lisboa, Porto e Algarve oferecem mercados maduros, liquidez e procura internacional constante. O regime fiscal para novos residentes e a proteção patrimonial em Euro completam o cenário.")}
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
