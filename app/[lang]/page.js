import L from "@/components/L";
import HeroSplit from "@/components/HeroSplit";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";
import RegionBanner from "@/components/RegionBanner";
import ListingsExplorer from "@/components/ListingsExplorer";
import {
  empreendimentosDestaque,
  allRegioes,
  allEmpreendimentos,
  zonasDe,
  tiposDe,
  finalidadesDe,
} from "@/lib/store";
import { getConteudo } from "@/lib/conteudo";
import { allAnuncios } from "@/lib/anuncios";
import AnuncioCard from "@/components/AnuncioCard";
import AreasCards from "@/components/AreasCards";
import MarcasFaixa from "@/components/MarcasFaixa";
import { allMarcas } from "@/lib/marcas";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { t, alternates } from "@/lib/i18n";
import { traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { alternates: alternates(lang, "/") };
}

export default async function Home({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("home", lang);
  const destaques = traduzLista(await empreendimentosDestaque(6), lang);
  const todos = traduzLista(await allEmpreendimentos(), lang);
  const paises = [...new Set(todos.map((e) => e.pais))];
  const regioes = traduzLista(await allRegioes(), lang);
  const anuncios = traduzLista(await allAnuncios({ home: true }), lang);
  const marcas = traduzLista(await allMarcas({ home: true }), lang);
  const pick = (s) => regioes.find((r) => r.slug === s);
  const regioesDestaque = ["lisboa", "algarve", "sao-paulo", "rio-de-janeiro"]
    .map(pick)
    .filter(Boolean);
  const regiaoFooter = pick("nordeste");

  return (
    <>
      {/* Hero split 100vh — escolha Portugal / Brasil */}
      <HeroSplit slogan={c.heroSlogan} />

      {/* Outras áreas — Bebidas & Alimentação e Tecnologia */}
      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">
              {TECNOLOGIA_VISIVEL ? T("Um nome, três áreas de investimento") : T("Bebidas & Alimentação")}
            </span>
            <h2>{c.areasTitulo}</h2>
            <p>{c.areasTexto}</p>
          </Reveal>
          {TECNOLOGIA_VISIVEL && <AreasCards areas={["marcas", "tecnologia"]} />}
          {marcas.length > 0 && (
            <Reveal>
              <p className="marcas-faixa-titulo">{T("Marcas que representamos")}</p>
              <MarcasFaixa marcas={marcas} />
              <div style={{ marginTop: 26 }}>
                <L href="/marcas" className="btn btn-primary">{T("Conhecer as marcas")}</L>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Diferenciais */}
      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{T("Dois mercados, uma plataforma")}</span>
            <h2>{c.difTitulo}</h2>
            <p>{c.difTexto}</p>
          </Reveal>
          <div className="grid grid-3">
            {[
              ["shield-check", "Rede verificada", "Corretores, advogados e contabilistas selecionados e verificados em Portugal e no Brasil."],
              ["layers", "Processo integrado", "Da análise do imóvel à escritura, com apoio jurídico e fiscal em cada etapa — um único processo."],
              ["globe", "Dois mercados", "Presença e conhecimento real nos dois países — legislação, fiscalidade e dinâmicas locais. Não apenas contactos."],
            ].map(([icon, tit, d], i) => (
              <Reveal className="card" key={tit} delay={i * 0.1}>
                <div className="icon"><Icon name={icon} /></div>
                <h3>{T(tit)}</h3>
                <p>{T(d)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Empreendimentos em destaque */}
      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{T("Empreendimentos")}</span>
            <h2>{T("Oportunidades em destaque")}</h2>
            <p>{T("Uma seleção curada de imóveis nos dois mercados.")}</p>
          </Reveal>
          <div className="listing-grid">
            {destaques.map((e, i) => (
              <Reveal key={e.slug} delay={(i % 3) * 0.08}>
                <EmpreendimentoCard e={e} />
              </Reveal>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 36, flexWrap: "wrap" }}>
            <L href="/portugal" className="btn btn-primary">
              {T("Ver imóveis em Portugal")}
            </L>
            <L
              href="/brasil"
              className="btn btn-primary"
              style={{ background: "var(--navy)", color: "#fff" }}
            >
              {T("Ver imóveis no Brasil")}
            </L>
          </div>
        </div>
      </section>

      {/* Filtro geral — toda a oferta */}
      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{T("Toda a oferta")}</span>
            <h2>{T("Explora todos os empreendimentos")}</h2>
            <p>
              {T("Pesquisa pelo nome, cidade, zona ou referência — ou clica em Filtros para refinar por país, tipologia, finalidade e preço.")}
            </p>
          </Reveal>
          <ListingsExplorer
            empreendimentos={todos}
            zonas={zonasDe(todos)}
            tipos={tiposDe(todos)}
            finalidades={finalidadesDe(todos)}
            paises={paises}
            comBusca
            comPais
            colapsavel
          />
          <div style={{ marginTop: 28 }}>
            <L href="/empreendimentos" className="btn btn-primary">
              {T("Ver página de toda a oferta")}
            </L>
          </div>
        </div>
      </section>

      {/* Destaques por região (sponsor) */}
      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{T("Explorar por região")}</span>
            <h2>{T("Cada região, uma oportunidade")}</h2>
            <p>
              {T("Descobre as vantagens de cada mercado e o que podes fazer acontecer — clica numa região para ver os empreendimentos.")}
            </p>
          </Reveal>
          <div className="region-grid">
            {regioesDestaque.map((r, i) => (
              <Reveal key={r.slug} delay={(i % 2) * 0.1}>
                <RegionBanner regiao={r} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{T("Para quem é")}</span>
            <h2>{T("Um serviço calibrado ao teu perfil")}</h2>
          </Reveal>
          <div className="grid grid-2">
            <Reveal className="card">
              <div className="icon">①</div>
              <h3>{T("Investidor particular")}</h3>
              <p>
                {T("Primeiro investimento no exterior? Guiamos-te em cada passo — da escolha do imóvel à documentação final, com total transparência sobre custos, impostos e prazos.")}
              </p>
            </Reveal>
            <Reveal className="card" delay={0.1}>
              <div className="icon">②</div>
              <h3>{T("Investidor premium")}</h3>
              <p>
                {T("Já investes e queres escalar para o mercado oposto? Trabalhamos como parceiros estratégicos: estruturação fiscal, acesso exclusivo a oportunidades e gestor dedicado.")}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Como funciona — resumo */}
      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{T("Como funciona")}</span>
            <h2>{T("Do primeiro contacto à escritura")}</h2>
            <p>
              {T("Um processo desenhado para ser simples, previsível e seguro — sabes sempre em que fase estás e quem trabalha por ti.")}
            </p>
          </Reveal>
          <Reveal className="stats">
            {[
              ["1", "Contacto e perfil"],
              ["2", "Seleção de imóveis"],
              ["3", "Due diligence"],
              ["4", "Escritura e pós-venda"],
            ].map(([n, l]) => (
              <div className="stat" key={n}>
                <div className="num">{n}</div>
                <div className="label">{T(l)}</div>
              </div>
            ))}
          </Reveal>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <L href="/como-funciona" className="btn btn-primary">
              {T("Ver o processo completo")}
            </L>
          </div>
        </div>
      </section>

      {/* Banner regional pré-footer */}
      {regiaoFooter && (
        <section className="bg-soft">
          <div className="container">
            <Reveal>
              <RegionBanner regiao={regiaoFooter} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Publicidade / parceiros */}
      {anuncios.length > 0 && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{T("Parceiros & destaques")}</span>
              <h2>{T("Em destaque")}</h2>
            </Reveal>
            <div className="region-grid">
              {anuncios.map((a, i) => (
                <Reveal key={a.slug} delay={(i % 2) * 0.1}>
                  <AnuncioCard anuncio={a} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>{c.ctaTitulo}</h2>
            <p>{c.ctaTexto}</p>
            <L href="/contactos" className="btn btn-primary">
              {T("Falar com um especialista")}
            </L>
          </Reveal>
        </div>
      </section>
    </>
  );
}
