import L from "@/components/L";
import { notFound, permanentRedirect } from "next/navigation";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import ContactForm from "@/components/ContactForm";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";
import RegionBanner from "@/components/RegionBanner";
import { cartaoRegiao } from "@/lib/regioes";
import PrecoDual from "@/components/PrecoDual";
import VideoEmbed from "@/components/VideoEmbed";
import { textoComLinks } from "@/lib/format";
import { PAIS_LABEL, referenciaDe, cartaoEmpreendimento } from "@/lib/empreendimentos";
import Track from "@/components/Track";
import ProjetoGaleria from "@/components/ProjetoGaleria";
import GaleriaExtra from "@/components/GaleriaExtra";
import {
  empreendimentoBySlug,
  empreendimentoPorSlugAntigo,
  allEmpreendimentos,
  regiaoDoEmpreendimento,
} from "@/lib/store";
import { t, tf, caminho } from "@/lib/i18n";
import { getEmpresa } from "@/lib/config";
import ContactosDiretos from "@/components/ContactosDiretos";
import { metaPagina, metaNaoEncontrado, urlPublica, jsonLd } from "@/lib/seo";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  // Render a pedido (ISR) — não consulta o Mongo durante o build.
  return [];
}

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const e = traduzDoc(await empreendimentoBySlug(slug), lang);
  if (!e || e.publicado === false) return metaNaoEncontrado(lang, t(lang, "Empreendimento não encontrado"));
  const titulo = `${e.nome} — ${e.cidade}`;
  const desc =
    e.resumo ||
    (e.descricao ? e.descricao.slice(0, 160) : tf(lang, "Investir em {nome}, {cidade}.", { nome: e.nome, cidade: e.cidade }));
  return metaPagina(lang, `/empreendimentos/${e.slug}`, {
    titulo,
    descricao: desc,
    imagem: e.imagens?.[0],
  });
}

export default async function PaginaEmpreendimento({ params }) {
  const { slug, lang } = await params;
  const T = (x) => t(lang, x);
  const e = traduzDoc(await empreendimentoBySlug(slug), lang);
  if (!e || e.publicado === false) {
    // URL antigo? Reencaminha para o novo slug.
    const antigo = await empreendimentoPorSlugAntigo(slug);
    if (antigo && antigo.publicado !== false) {
      permanentRedirect(caminho(lang, `/empreendimentos/${antigo.slug}`));
    }
    notFound();
  }

  const paisLabel = T(PAIS_LABEL[e.pais]);
  const regiao = traduzDoc(await regiaoDoEmpreendimento(e), lang);
  const semelhantes = traduzLista(await allEmpreendimentos({ pais: e.pais }), lang)
    .filter((x) => x.slug !== e.slug)
    .slice(0, 3)
    .map(cartaoEmpreendimento);

  const empresa = await getEmpresa();
  const urlPagina = urlPublica(lang, `/empreendimentos/${e.slug}`);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: e.nome,
    description: e.resumo || e.descricao || `${e.nome}, ${e.cidade}`,
    sku: referenciaDe(e),
    category: e.tipo,
    image: Array.isArray(e.imagens) ? e.imagens : undefined,
    url: urlPagina,
    ...(e.precoTipo !== "consulta" && e.preco
      ? {
          offers: {
            "@type": "Offer",
            price: e.preco,
            priceCurrency: e.moeda || "EUR",
            availability: "https://schema.org/InStock",
            url: urlPagina,
          },
        }
      : {}),
  };

  const ldMigalhas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: T("Início"), item: urlPublica(lang, "/") },
      { "@type": "ListItem", position: 2, name: paisLabel, item: urlPublica(lang, `/${e.pais}`) },
      { "@type": "ListItem", position: 3, name: e.nome, item: urlPagina },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(ld) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(ldMigalhas) }}
      />
      <Track tipo="empreendimento_visto" valor={e.slug} />
      <div className="prop-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label={T("Caminho")}>
            <L href="/">{T("Início")}</L>{" "}{T("·")}{" "}
            <L href={`/${e.pais}`}>{paisLabel}</L> · {e.nome}
          </nav>
          <ProjetoGaleria imagens={e.imagens || []} nome={e.nome} />
        </div>
      </div>

      <section style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="prop-detail-grid">
            {/* Coluna principal */}
            <div>
              <div className="prop-badges" style={{ position: "static", marginBottom: 12 }}>
                <span className="badge gold">{T(e.tipo)}</span>
                <span className="badge navy">{T(e.estado)}</span>
                <span className="badge">{T(e.finalidade)}</span>
              </div>
              <div className="detalhe-ref">{T("Ref.")} {referenciaDe(e)}</div>
              <h1 style={{ fontSize: "2.2rem", marginBottom: 6 }}>{e.nome}</h1>
              <p style={{ fontSize: "1.05rem", color: "var(--muted)", marginBottom: 4 }}>
                {e.cidade} · {e.zona} · {paisLabel}
              </p>
              {e.construtora && (
                <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                  {T("Construtora:")}{" "}<strong>{e.construtora}</strong>
                  {e.morada ? ` · ${e.morada}` : ""}
                </p>
              )}

              <div className="spec-row">
                {/* Só as caixas com valor (como no card). */}
                {Number(e.quartos) > 0 && (
                  <div className="spec-box">
                    <div className="v">{e.quartos}</div>
                    <div className="l">{Number(e.quartos) === 1 ? T("Quarto") : T("Quartos")}</div>
                  </div>
                )}
                {Number(e.casasBanho) > 0 && (
                  <div className="spec-box">
                    <div className="v">{e.casasBanho}</div>
                    <div className="l">{T("Casas de banho")}</div>
                  </div>
                )}
                {Number(e.area) > 0 && (
                  <div className="spec-box">
                    <div className="v">{e.area}</div>
                    <div className="l">{T("m² de área")}</div>
                  </div>
                )}
                <div className="spec-box">
                  <div className="v" style={{ color: "var(--gold)" }}>
                    <Icon name={e.estado === "Pronto" ? "check" : "trending-up"} size={26} />
                  </div>
                  <div className="l">{T(e.estado)}</div>
                </div>
              </div>

              <h2 style={{ fontSize: "1.4rem", margin: "8px 0 12px" }}>{T("Descrição")}</h2>
              <p
                style={{ marginBottom: 28 }}
                dangerouslySetInnerHTML={{ __html: textoComLinks(e.descricao) }}
              />

              {e.tipologias && e.tipologias.length > 0 && (
                <>
                  <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>{T("Tipologias e preços")}</h2>
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
                              T("Sob consulta")
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {e.caracteristicas?.length > 0 && (
                <>
                  <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>{T("Características")}</h2>
                  <ul className="feature-list">
                    {e.caracteristicas.map((c) => (
                      <li key={c}>
                        <span className="check"><Icon name="check" size={18} /></span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {e.proximidades?.length > 0 && (
                <>
                  <h2 style={{ fontSize: "1.4rem", margin: "28px 0 12px" }}>
                    {T("Localização & proximidades")}
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
            <aside className="prop-aside" id="interesse">
              <div className="price-big"><PrecoDual preco={e.preco} moeda={e.moeda} tipo={e.precoTipo} max={e.precoMax} /></div>
              <div className="price-sub">
                {T(e.finalidade)} · {e.cidade}, {paisLabel}
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
                      {T("Ver site oficial ↗")}
                    </a>
                  )}
                  {e.links?.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener" className="prop-link-item">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              )}
              <h3 className="aside-form-titulo">{T("Tenho interesse")}</h3>
              <p className="aside-form-ref">
                <strong>[{referenciaDe(e)}]</strong> {e.nome}
              </p>
              <ContactForm
                assuntoInicial={`[${referenciaDe(e)}] ${e.nome} — ${e.cidade}, ${paisLabel}`}
                origem={e.slug}
              />
              <ContactosDiretos
                empresa={empresa}
                lang={lang}
                mensagem={tf(lang, "Olá! Tenho interesse no empreendimento {nome} (ref. {ref}).", { nome: e.nome, ref: referenciaDe(e) })}
                assunto={`[${referenciaDe(e)}] ${e.nome}`}
              />
            </aside>
          </div>
        </div>
      </section>

      {/* Botão fixo em mobile: leva ao formulário de interesse. */}
      <a href="#interesse" className="prop-sticky-cta btn btn-primary">
        {T("Tenho interesse")}
      </a>

      {e.video && (
        <section style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal>
              <h2 style={{ fontSize: "1.5rem", marginBottom: 18 }}>{T("Vídeo")}</h2>
              <VideoEmbed url={e.video} />
            </Reveal>
          </div>
        </section>
      )}

      {e.imagens && e.imagens.length > 3 && (
        <section style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal>
              <h2 style={{ fontSize: "1.5rem", marginBottom: 18 }}>{T("Galeria")}</h2>
              <GaleriaExtra imagens={e.imagens} nome={e.nome} />
            </Reveal>
          </div>
        </section>
      )}

      {regiao && (
        <section>
          <div className="container">
            <Reveal className="section-head" style={{ marginBottom: 28 }}>
              <span className="eyebrow">{T("A zona")}</span>
              <h2>{tf(lang, "Conhece {nome}", { nome: regiao.nome })}</h2>
              <p>
                {tf(lang, "Este empreendimento fica em {nome}. Descobre as vantagens da região, a sua história e os pontos de interesse.", { nome: regiao.nome })}
              </p>
            </Reveal>
            <Reveal>
              <RegionBanner regiao={cartaoRegiao(regiao)} />
            </Reveal>
          </div>
        </section>
      )}

      {semelhantes.length > 0 && (
        <section className="bg-soft">
          <div className="container">
            <Reveal className="section-head" style={{ marginBottom: 28 }}>
              <span className="eyebrow">{T("Continuar a explorar")}</span>
              <h2>{tf(lang, "Outros empreendimentos em {pais}", { pais: paisLabel })}</h2>
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
