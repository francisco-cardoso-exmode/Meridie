import MarketHero from "@/components/MarketHero";
import Reveal from "@/components/Reveal";
import RegionBanner from "@/components/RegionBanner";
import { cartaoRegiao } from "@/lib/regioes";
import ListingsExplorer from "@/components/ListingsExplorer";
import {
  allEmpreendimentos,
  allRegioes,
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
  return metaPagina(lang, "/portugal", {
    titulo: t(lang, "Investir em Portugal"),
    descricao: t(lang, "Empreendimentos selecionados em Portugal — Lisboa, Porto, Algarve e Cascais. Segurança jurídica europeia e valorização consistente. Filtra por zona, tipo e finalidade."),
  });
}

export const revalidate = 60;

export default async function PaginaPortugal({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("portugal", lang);
  const empreendimentos = traduzLista(await allEmpreendimentos({ pais: "portugal" }), lang).map(cartaoEmpreendimento);
  const regioes = traduzLista(await allRegioes({ pais: "portugal", topo: true }), lang);

  return (
    <>
      <MarketHero
        img="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=72"
        alt={T("Porto, Portugal")}
        eyebrow={c.heroEyebrow}
        titulo={c.heroTitulo}
      >
        {c.heroTexto}
      </MarketHero>

      <section style={{ paddingBottom: 40 }}>
        <div className="container">
          <Reveal className="section-head" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: "1.6rem" }}>{c.porqueTitulo}</h2>
            <p>{c.porqueTexto}</p>
          </Reveal>
          <div className="region-grid">
            {regioes.map((r, i) => (
              <Reveal key={r.slug} delay={(i % 2) * 0.1}>
                <RegionBanner regiao={cartaoRegiao(r)} compact />
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
              comBusca
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
