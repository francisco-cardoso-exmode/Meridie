import L from "@/components/L";
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
  zonasDe,
  tiposDe,
  finalidadesDe,
} from "@/lib/store";
import { PAIS_LABEL } from "@/lib/empreendimentos";
import ListingsExplorer from "@/components/ListingsExplorer";
import { textoComLinks } from "@/lib/format";
import { t, tf, traduzDoc, traduzLista, alternates, caminho } from "@/lib/i18n";

const NIVEL_LABEL = { regiao: "Região", estado: "Estado", cidade: "Cidade", zona: "Zona" };

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
  // Render a pedido (ISR) — não consulta o Mongo durante o build.
  return [];
}

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const r = traduzDoc(await regiaoBySlug(slug), lang);
  if (!r) return { title: t(lang, "Região não encontrada") };
  const titulo = tf(lang, "Investir em {nome}", { nome: r.nome });
  const desc = r.descricao || r.tagline || tf(lang, "Oportunidades de investimento em {nome}.", { nome: r.nome });
  const url = caminho(lang, `/regioes/${r.slug}`);
  return {
    title: titulo,
    description: desc,
    alternates: alternates(lang, `/regioes/${r.slug}`),
    openGraph: {
      type: "website",
      title: titulo,
      description: desc,
      url,
      images: r.imagem ? [{ url: r.imagem }] : undefined,
    },
  };
}

export default async function PaginaRegiao({ params }) {
  const { slug, lang } = await params;
  const T = (x) => t(lang, x);
  const regiao = traduzDoc(await regiaoBySlug(slug), lang);
  if (!regiao) notFound();

  const empreendimentos = traduzLista(await empreendimentosPorRegiao(regiao), lang);
  const paisLabel = T(PAIS_LABEL[regiao.pais]);
  const tiposNoMapa = [...new Set((regiao.pontos || []).map((p) => p.tipo))];
  const regiaoMae = regiao.parent ? traduzDoc(await regiaoBySlug(regiao.parent), lang) : null;
  const subZonas = traduzLista(await subRegioes(regiao.slug), lang);
  const nivelLabel = T(NIVEL_LABEL[regiao.nivel] || (regiaoMae ? "Zona" : "Região"));

  return (
    <div className={`pagina-area ${regiao.parent ? "is-zona" : "is-regiao"}`}>
      <MarketHero
        img={regiao.imagem}
        alt={regiao.nome}
        eyebrow={`${regiaoMae ? tf(lang, "{nivel} de {mae}", { nivel: nivelLabel, mae: regiaoMae.nome }) : nivelLabel} · ${paisLabel}`}
        titulo={regiaoMae ? regiao.nome : tf(lang, "Investir em {nome}", { nome: regiao.nome })}
      >
        {regiao.tagline}
      </MarketHero>

      {regiaoMae && (
        <div className="subzone-bar">
          <div className="container">
            <L href={`/regioes/${regiaoMae.slug}`}>
              {tf(lang, "← Faz parte da região {nome}", { nome: regiaoMae.nome })}
            </L>
          </div>
        </div>
      )}

      {/* Sobre a região */}
      <section>
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "start", gap: 48 }}>
            <Reveal>
              <span className="eyebrow">{T("A região")}</span>
              <h2 style={{ fontSize: "2rem", marginBottom: 16 }}>
                {tf(lang, "Conhece {nome}", { nome: regiao.nome })}
              </h2>
              <p dangerouslySetInnerHTML={{ __html: textoComLinks(regiao.sobre) }} />
              {regiao.conhecidaPor && (
                <p className="conhecida-por">
                  <Icon name="sparkles" size={16} />
                  <span><strong>{T("Conhecida por:")}</strong> {regiao.conhecidaPor}</span>
                </p>
              )}
            </Reveal>
            <Reveal delay={0.1}>
              <span className="eyebrow">{T("Porquê investir aqui")}</span>
              <ul className="value-list" style={{ marginTop: 10 }}>
                {(regiao.vantagens || []).map((v) => (
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
            <span className="eyebrow">{tf(lang, "O que torna {nome} especial", { nome: regiao.nome })}</span>
            <h2>{T("Destaques da região")}</h2>
          </Reveal>
          <div className="grid grid-3">
            {(regiao.destaques || []).map((d, i) => (
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
              <span className="eyebrow">{T("Evolução & turismo")}</span>
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
                  <span className="eyebrow">{T("O que ver")}</span>
                  <h2 style={{ fontSize: "1.6rem", marginBottom: 14 }}>
                    {T("Atrações a não perder")}
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
                  <span className="eyebrow">{T("Como chegar & distâncias")}</span>
                  <h2 style={{ fontSize: "1.6rem", marginBottom: 14 }}>{T("Acessos")}</h2>
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
            <span className="eyebrow">{T("No mapa")}</span>
            <h2>{T("Onde fica e o que visitar")}</h2>
            <p>{tf(lang, "Os principais pontos de interesse de {nome}.", { nome: regiao.nome })}</p>
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
                  {T(TIPO_LABEL[t] || t)}
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
              <span className="eyebrow">{T("Zonas em destaque")}</span>
              <h2>{tf(lang, "Explorar zonas de {nome}", { nome: regiao.nome })}</h2>
              <p>{T("Áreas específicas dentro da região, com os seus próprios empreendimentos.")}</p>
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

      {/* Publicidade / parceiros */}
      {regiao.publicidade?.length > 0 && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{T("Parceiros & destaques")}</span>
              <h2>{tf(lang, "Em destaque em {nome}", { nome: regiao.nome })}</h2>
            </Reveal>
            <div className="region-grid">
              {regiao.publicidade.map((p, i) => (
                <Reveal key={i}>
                  <a
                    href={p.url ? caminho(lang, p.url) : "#"}
                    target={p.url && /^https?:/.test(p.url) ? "_blank" : undefined}
                    rel="noopener"
                    className="pub-card"
                  >
                    {p.imagem && <img src={p.imagem} alt={p.titulo} loading="lazy" />}
                    <div className="pub-body">
                      <span className="rb-tag">{T("Publicidade")}</span>
                      <h3>{p.titulo}</h3>
                      {p.texto && <p>{p.texto}</p>}
                      {p.url && <span className="pub-cta">{T("Saber mais ↗")}</span>}
                    </div>
                  </a>
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
            <span className="eyebrow">{T("Oportunidades")}</span>
            <h2>
              {tf(lang, empreendimentos.length === 1 ? "{n} empreendimento em {nome}" : "{n} empreendimentos em {nome}", {
                n: empreendimentos.length,
                nome: regiao.nome,
              })}
            </h2>
            <p>{T("O que podes fazer acontecer nesta região.")}</p>
          </Reveal>
          {empreendimentos.length > 0 ? (
            <ListingsExplorer
              empreendimentos={empreendimentos}
              zonas={zonasDe(empreendimentos)}
              tipos={tiposDe(empreendimentos)}
              finalidades={finalidadesDe(empreendimentos)}
              comBusca
            />
          ) : (
            <div className="empty-state">
              <p>{T("Em breve, novos empreendimentos nesta região.")}</p>
            </div>
          )}
          <div style={{ marginTop: 36 }}>
            <L href={`/${regiao.pais}`} className="btn btn-primary">
              {tf(lang, "Ver todo o mercado {pais}", { pais: paisLabel })}
            </L>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>{tf(lang, "Interessado em {nome}?", { nome: regiao.nome })}</h2>
            <p>
              {T("Fala connosco e mostramos-te as melhores oportunidades desta região — com apoio jurídico e fiscal de ponta a ponta.")}
            </p>
            <L href="/contactos" className="btn btn-primary">
              {T("Falar com um especialista")}
            </L>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
