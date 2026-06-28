import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import ContactForm from "@/components/ContactForm";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";
import RegionBanner from "@/components/RegionBanner";
import PrecoDual from "@/components/PrecoDual";
import VideoEmbed from "@/components/VideoEmbed";
import { textoComLinks } from "@/lib/format";
import { PAIS_LABEL, referenciaDe } from "@/lib/empreendimentos";
import {
  empreendimentoBySlug,
  allEmpreendimentos,
  regiaoDoEmpreendimento,
} from "@/lib/store";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  // Render a pedido (ISR) — não consulta o Mongo durante o build.
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const e = await empreendimentoBySlug(slug);
  if (!e) return { title: "Empreendimento não encontrado" };
  return {
    title: `${e.nome} — ${e.cidade}`,
    description: e.resumo,
  };
}

export default async function PaginaEmpreendimento({ params }) {
  const { slug } = await params;
  const e = await empreendimentoBySlug(slug);
  if (!e || e.publicado === false) notFound();

  const paisLabel = PAIS_LABEL[e.pais];
  const regiao = await regiaoDoEmpreendimento(e);
  const semelhantes = (await allEmpreendimentos({ pais: e.pais }))
    .filter((x) => x.slug !== e.slug)
    .slice(0, 3);

  return (
    <>
      <div className="prop-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Início</Link> ·{" "}
            <Link href={`/${e.pais}`}>{paisLabel}</Link> · {e.nome}
          </nav>
          <div className="gallery">
            <div className="main">
              <img src={e.imagens?.[0] || ""} alt={e.nome} />
            </div>
            <div className="side">
              {(e.imagens || []).slice(1, 3).map((img, i) => (
                <div key={i}>
                  <img src={img} alt={`${e.nome} — foto ${i + 2}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="prop-detail-grid">
            {/* Coluna principal */}
            <div>
              <div className="prop-badges" style={{ position: "static", marginBottom: 12 }}>
                <span className="badge gold">{e.tipo}</span>
                <span className="badge navy">{e.estado}</span>
                <span className="badge">{e.finalidade}</span>
              </div>
              <div className="detalhe-ref">Ref. {referenciaDe(e)}</div>
              <h1 style={{ fontSize: "2.2rem", marginBottom: 6 }}>{e.nome}</h1>
              <p style={{ fontSize: "1.05rem", color: "var(--muted)", marginBottom: 4 }}>
                {e.cidade} · {e.zona} · {paisLabel}
              </p>
              {e.construtora && (
                <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                  Construtora: <strong>{e.construtora}</strong>
                  {e.morada ? ` · ${e.morada}` : ""}
                </p>
              )}

              <div className="spec-row">
                <div className="spec-box">
                  <div className="v">{e.quartos}</div>
                  <div className="l">{e.quartos === 1 ? "Quarto" : "Quartos"}</div>
                </div>
                <div className="spec-box">
                  <div className="v">{e.casasBanho}</div>
                  <div className="l">Casas de banho</div>
                </div>
                <div className="spec-box">
                  <div className="v">{e.area}</div>
                  <div className="l">m² de área</div>
                </div>
                <div className="spec-box">
                  <div className="v" style={{ color: "var(--gold)" }}>
                    <Icon name={e.estado === "Pronto" ? "check" : "trending-up"} size={26} />
                  </div>
                  <div className="l">{e.estado}</div>
                </div>
              </div>

              <h2 style={{ fontSize: "1.4rem", margin: "8px 0 12px" }}>Descrição</h2>
              <p
                style={{ marginBottom: 28 }}
                dangerouslySetInnerHTML={{ __html: textoComLinks(e.descricao) }}
              />

              {e.tipologias && e.tipologias.length > 0 && (
                <>
                  <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>Tipologias e preços</h2>
                  <div className="tipologias" style={{ marginBottom: 28 }}>
                    {e.tipologias.map((t, i) => {
                      const o = typeof t === "string" ? { nome: t } : t;
                      return (
                        <div className="tip-row" key={i}>
                          <span className="tip-icon"><Icon name="layers" size={18} /></span>
                          <span className="tip-nome">{o.nome}</span>
                          {o.area && <span className="tip-area">{o.area}</span>}
                          <span className="tip-preco">
                            {o.preco ? (
                              <PrecoDual preco={o.preco} moeda={e.moeda} />
                            ) : (
                              "Sob consulta"
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>Características</h2>
              <ul className="feature-list">
                {(e.caracteristicas || []).map((c) => (
                  <li key={c}>
                    <span className="check"><Icon name="check" size={18} /></span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>

              {e.proximidades && (
                <>
                  <h2 style={{ fontSize: "1.4rem", margin: "28px 0 12px" }}>
                    Localização & proximidades
                  </h2>
                  <ul className="feature-list">
                    {e.proximidades.map((p) => (
                      <li key={p}>
                        <span className="check"><Icon name="pin" size={18} /></span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Aside — preço + interesse */}
            <aside className="prop-aside">
              <div className="price-big"><PrecoDual preco={e.preco} moeda={e.moeda} tipo={e.precoTipo} /></div>
              <div className="price-sub">
                {e.finalidade} · {e.cidade}, {paisLabel}
              </div>
              {(e.siteUrl || e.links?.length > 0) && (
                <div className="prop-links">
                  {e.siteUrl && (
                    <a
                      href={e.siteUrl}
                      target="_blank"
                      rel="noopener"
                      className="btn btn-primary"
                      style={{ display: "block", textAlign: "center", marginBottom: 8 }}
                    >
                      Ver site oficial ↗
                    </a>
                  )}
                  {e.links?.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener" className="prop-link-item">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              )}
              <h3 className="aside-form-titulo">Tenho interesse</h3>
              <p className="aside-form-ref">
                <strong>[{referenciaDe(e)}]</strong> {e.nome}
              </p>
              <ContactForm
                assuntoInicial={`[${referenciaDe(e)}] ${e.nome} — ${e.cidade}, ${paisLabel}`}
              />
            </aside>
          </div>
        </div>
      </section>

      {e.video && (
        <section style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal>
              <h2 style={{ fontSize: "1.5rem", marginBottom: 18 }}>Vídeo</h2>
              <VideoEmbed url={e.video} />
            </Reveal>
          </div>
        </section>
      )}

      {e.imagens && e.imagens.length > 3 && (
        <section style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal>
              <h2 style={{ fontSize: "1.5rem", marginBottom: 18 }}>Galeria</h2>
              <div className="galeria-grid">
                {e.imagens.slice(3).map((img, i) => (
                  <div className="galeria-item" key={i}>
                    <img src={img} alt={`${e.nome} — foto ${i + 4}`} loading="lazy" />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {regiao && (
        <section>
          <div className="container">
            <Reveal className="section-head" style={{ marginBottom: 28 }}>
              <span className="eyebrow">A zona</span>
              <h2>Conhece {regiao.nome}</h2>
              <p>
                Este empreendimento fica em {regiao.nome}. Descobre as vantagens
                da região, a sua história e os pontos de interesse.
              </p>
            </Reveal>
            <Reveal>
              <RegionBanner regiao={regiao} />
            </Reveal>
          </div>
        </section>
      )}

      {semelhantes.length > 0 && (
        <section className="bg-soft">
          <div className="container">
            <Reveal className="section-head" style={{ marginBottom: 28 }}>
              <span className="eyebrow">Continuar a explorar</span>
              <h2>Outros empreendimentos em {paisLabel}</h2>
            </Reveal>
            <div className="listing-grid">
              {semelhantes.map((x, i) => (
                <Reveal key={x.slug} delay={(i % 3) * 0.08}>
                  <EmpreendimentoCard e={x} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
