import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import MarketHero from "@/components/MarketHero";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";
import RegionBanner from "@/components/RegionBanner";
import RegionMap, { CORES_PONTO } from "@/components/RegionMap";
import {
  allRegioes,
  regiaoBySlug,
  subRegioes,
  empreendimentosPorRegiao,
} from "@/lib/store";
import { PAIS_LABEL } from "@/lib/empreendimentos";

export const revalidate = 60;
export const dynamicParams = true;

const TIPO_LABEL = {
  historico: "Histórico",
  praia: "Praia",
  montanha: "Montanha",
  natureza: "Natureza",
  cidade: "Cidade",
  gastronomia: "Gastronomia",
};

export async function generateStaticParams() {
  const list = await allRegioes();
  return list.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const r = await regiaoBySlug(slug);
  if (!r) return { title: "Região não encontrada" };
  return { title: `Investir em ${r.nome}`, description: r.descricao };
}

export default async function PaginaRegiao({ params }) {
  const { slug } = await params;
  const regiao = await regiaoBySlug(slug);
  if (!regiao) notFound();

  const empreendimentos = await empreendimentosPorRegiao(regiao);
  const paisLabel = PAIS_LABEL[regiao.pais];
  const tiposNoMapa = [...new Set(regiao.pontos.map((p) => p.tipo))];
  const regiaoMae = regiao.parent ? await regiaoBySlug(regiao.parent) : null;
  const subZonas = await subRegioes(regiao.slug);

  return (
    <div className={`pagina-area ${regiao.parent ? "is-zona" : "is-regiao"}`}>
      <MarketHero
        img={regiao.imagem}
        alt={regiao.nome}
        eyebrow={regiaoMae ? `Zona de ${regiaoMae.nome} · ${paisLabel}` : `${paisLabel} · Região`}
        titulo={regiaoMae ? regiao.nome : `Investir em ${regiao.nome}`}
      >
        {regiao.tagline}
      </MarketHero>

      {regiaoMae && (
        <div className="subzone-bar">
          <div className="container">
            <Link href={`/regioes/${regiaoMae.slug}`}>
              ← Faz parte da região {regiaoMae.nome}
            </Link>
          </div>
        </div>
      )}

      {/* Sobre a região */}
      <section>
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "start", gap: 48 }}>
            <Reveal>
              <span className="eyebrow">A região</span>
              <h2 style={{ fontSize: "2rem", marginBottom: 16 }}>
                Conhece {regiao.nome}
              </h2>
              <p>{regiao.sobre}</p>
              {regiao.conhecidaPor && (
                <p className="conhecida-por">
                  <Icon name="sparkles" size={16} />
                  <span><strong>Conhecida por:</strong> {regiao.conhecidaPor}</span>
                </p>
              )}
            </Reveal>
            <Reveal delay={0.1}>
              <span className="eyebrow">Porquê investir aqui</span>
              <ul className="value-list" style={{ marginTop: 10 }}>
                {regiao.vantagens.map((v) => (
                  <li key={v}>
                    <span className="check"><Icon name="check" size={18} /></span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Destaques — o que ver / fazer */}
      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">O que torna {regiao.nome} especial</span>
            <h2>Destaques da região</h2>
          </Reveal>
          <div className="grid grid-3">
            {regiao.destaques.map((d, i) => (
              <Reveal className="highlight-card" key={d.titulo} delay={i * 0.1}>
                <span className="hl-icon">
                  <Icon name={d.icon} size={26} />
                </span>
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Crescimento / turismo */}
      <section>
        <div className="container">
          <Reveal className="growth-band">
            <span className="growth-icon">
              <Icon name="trending-up" size={26} />
            </span>
            <div>
              <span className="eyebrow">Evolução & turismo</span>
              <p>{regiao.crescimento}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* O que ver + como chegar */}
      {(regiao.oQueVer?.length || regiao.transportes?.length || regiao.distancias?.length) ? (
        <section style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="grid grid-2" style={{ alignItems: "start", gap: 48 }}>
              {regiao.oQueVer?.length > 0 && (
                <Reveal>
                  <span className="eyebrow">O que ver</span>
                  <h2 style={{ fontSize: "1.6rem", marginBottom: 14 }}>
                    Atrações a não perder
                  </h2>
                  <ul className="value-list">
                    {regiao.oQueVer.map((x) => (
                      <li key={x}>
                        <span className="check"><Icon name="pin" size={18} /></span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
              {(regiao.transportes?.length > 0 || regiao.distancias?.length > 0) && (
                <Reveal delay={0.1}>
                  <span className="eyebrow">Como chegar & distâncias</span>
                  <h2 style={{ fontSize: "1.6rem", marginBottom: 14 }}>Acessos</h2>
                  {regiao.transportes?.length > 0 && (
                    <ul className="value-list" style={{ marginBottom: 18 }}>
                      {regiao.transportes.map((t) => (
                        <li key={t}>
                          <span className="check"><Icon name="check" size={18} /></span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {regiao.distancias?.length > 0 && (
                    <div className="distancias">
                      {regiao.distancias.map((d) => (
                        <div className="dist-item" key={d.local}>
                          <span className="dist-km">{d.km} km</span>
                          <span className="dist-local">{d.local}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Reveal>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Mapa */}
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">No mapa</span>
            <h2>Onde fica e o que visitar</h2>
            <p>Os principais pontos de interesse de {regiao.nome}.</p>
          </Reveal>
          <Reveal>
            <RegionMap mapa={regiao.mapa} pontos={regiao.pontos} nome={regiao.nome} />
            <div className="map-legend">
              {tiposNoMapa.map((t) => (
                <span className="legend-item" key={t}>
                  <span
                    className="legend-dot"
                    style={{ background: CORES_PONTO[t] }}
                  />
                  {TIPO_LABEL[t] || t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sub-zonas em destaque */}
      {subZonas.length > 0 && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">Zonas em destaque</span>
              <h2>Explorar zonas de {regiao.nome}</h2>
              <p>Áreas específicas dentro da região, com os seus próprios empreendimentos.</p>
            </Reveal>
            <div className="region-grid">
              {subZonas.map((z, i) => (
                <Reveal key={z.slug} delay={(i % 2) * 0.1}>
                  <RegionBanner regiao={z} compact />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empreendimentos da região */}
      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Oportunidades</span>
            <h2>
              {empreendimentos.length}{" "}
              {empreendimentos.length === 1 ? "empreendimento" : "empreendimentos"}{" "}
              em {regiao.nome}
            </h2>
            <p>O que podes fazer acontecer nesta região.</p>
          </Reveal>
          {empreendimentos.length > 0 ? (
            <div className="listing-grid">
              {empreendimentos.map((e, i) => (
                <Reveal key={e.slug} delay={(i % 3) * 0.08}>
                  <EmpreendimentoCard e={e} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Em breve, novos empreendimentos nesta região.</p>
            </div>
          )}
          <div style={{ marginTop: 36 }}>
            <Link href={`/${regiao.pais}`} className="btn btn-primary">
              Ver todo o mercado {paisLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>Interessado em {regiao.nome}?</h2>
            <p>
              Fala connosco e mostramos-te as melhores oportunidades desta região
              — com apoio jurídico e fiscal de ponta a ponta.
            </p>
            <Link href="/contactos" className="btn btn-primary">
              Falar com um especialista
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
