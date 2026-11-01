import L from "@/components/L";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import MarcaGaleria from "@/components/MarcaGaleria";
import VideoEmbed from "@/components/VideoEmbed";
import PrecoProduto from "@/components/PrecoProduto";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { allSolucoes, solucaoBySlug } from "@/lib/solucoes";
import { hrefSolucao, TIPOS_SOLUCAO } from "@/lib/catalogo";
import { t, tf } from "@/lib/i18n";
import { metaPagina, metaNaoEncontrado, urlPublica, jsonLd } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";
import { emPrevisualizacao } from "@/lib/previsualizacao";
import AvisoPrevisualizacao from "@/components/AvisoPrevisualizacao";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

async function visivel(slug, lang) {
  if (!TECNOLOGIA_VISIVEL) return null;
  const s = traduzDoc(await solucaoBySlug(slug), lang);
  return s && (s.ativo !== false || (await emPrevisualizacao())) ? s : null;
}

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const s = await visivel(slug, lang);
  if (!s) return metaNaoEncontrado(lang, t(lang, "Solução não encontrada"));
  const meta = metaPagina(lang, hrefSolucao(s.slug), {
    titulo: s.nome,
    descricao: s.tagline || (s.problema ? s.problema.slice(0, 160) : s.nome),
    imagem: s.imagens?.[0],
  });
  return s.ativo === false ? { ...meta, robots: { index: false, follow: false } } : meta;
}

// Pedido de um só item (mesmo sistema das Representações).
const pedir = (s, motivo, plano) => `/pedido?item=solucao:${s.slug}${plano ? `:${plano}` : ""}&motivo=${motivo}`;

export default async function PaginaSolucao({ params }) {
  const { slug, lang } = await params;
  const T = (x) => t(lang, x);
  const s = await visivel(slug, lang);
  if (!s) notFound();
  const outras = traduzLista(await allSolucoes(), lang).filter((x) => x.slug !== s.slug);
  const planos = s.planos || [];
  const casos = (s.casos || []).filter((c) => c.titulo || c.texto);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.nome,
    url: urlPublica(lang, hrefSolucao(s.slug)),
    ...(s.tagline ? { description: s.tagline } : {}),
    provider: { "@type": "Organization", name: s.tipo === "representamos" && s.parceiro ? s.parceiro : SITE_NAME },
    ...(s.paraQuem?.length ? { audience: { "@type": "Audience", audienceType: s.paraQuem.join(", ") } } : {}),
  };

  return (
    <div className="sol-pagina">
      {s.ativo === false && <AvisoPrevisualizacao caminho={hrefSolucao(s.slug)} editar={`/admin/solucoes/${encodeURIComponent(s.slug)}`} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb rep-migalhas" aria-label={T("Caminho")}>
            <L href="/tecnologia">{T("Tecnologia")}</L> · {s.nome}
          </nav>
          <span className="eyebrow">
            {T(TIPOS_SOLUCAO[s.tipo] || "")}
            {s.parceiro ? ` · ${s.parceiro}` : ""}
          </span>
          <h1>{s.nome}</h1>
          {s.tagline && <p>{s.tagline}</p>}
          <div className="sol-ctas">
            <L href={pedir(s, "demonstracao")} className="btn btn-primary">{T("Pedir demonstração")}</L>
            <L href={pedir(s, "proposta")} className="btn btn-outline">{T("Pedir proposta")}</L>
          </div>
        </div>
      </section>

      {(s.problema || s.paraQuem?.length > 0) && (
        <section>
          <div className="container rep-produto-detalhe">
            {s.problema && (
              <div>
                <h2>{T("O problema que resolve")}</h2>
                {s.problema.split(/\n{2,}/).map((par, i) => (
                  <p key={i}>{par}</p>
                ))}
              </div>
            )}
            {s.paraQuem?.length > 0 && (
              <div>
                <h2>{T("Para quem")}</h2>
                <div className="rep-chips pequenos estaticos">
                  {s.paraQuem.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {s.funcionalidades?.length > 0 && (
        <section className="bg-soft">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{T("Funcionalidades")}</span>
              <h2>{T("O que faz")}</h2>
            </Reveal>
            <ul className="sol-funcionalidades">
              {s.funcionalidades.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {(s.imagens?.length > 0 || s.video) && (
        <section>
          <div className="container sol-media">
            {s.video && <VideoEmbed url={s.video} />}
            {s.imagens?.length > 0 && <MarcaGaleria imagens={s.imagens} nome={s.nome} />}
          </div>
        </section>
      )}

      {planos.length > 0 && (
        <section className="bg-soft">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{T("Planos e preços")}</span>
              <h2>{planos.length > 1 ? T("Escolhe o plano certo") : T("Preço")}</h2>
            </Reveal>
            <div className="sol-planos">
              {planos.map((p) => (
                <div className="sol-plano" key={p.id}>
                  <h3>{p.nome}</h3>
                  <PrecoProduto p={p} grande />
                  {p.descricao && <p>{p.descricao}</p>}
                  {p.itens?.length > 0 && (
                    <ul>
                      {p.itens.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  )}
                  <L href={pedir(s, "proposta", p.id)} className="btn btn-primary">{T("Pedir proposta")}</L>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {casos.length > 0 && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{T("Casos e testemunhos")}</span>
            </Reveal>
            <div className="grid grid-2">
              {casos.map((c) => (
                <blockquote className="card sol-caso" key={c.id}>
                  {c.titulo && <h3>{c.titulo}</h3>}
                  {c.texto && <p>{c.texto}</p>}
                  {c.autor && <cite>— {c.autor}</cite>}
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>{tf(lang, "Queres ver {nome} a funcionar?", { nome: s.nome })}</h2>
            <p>{T("Marcamos uma demonstração ou enviamos uma proposta à medida — sem compromisso.")}</p>
            <div className="sol-ctas centro">
              <L href={pedir(s, "demonstracao")} className="btn btn-primary">{T("Pedir demonstração")}</L>
              <L href={pedir(s, "proposta")} className="btn btn-outline">{T("Pedir proposta")}</L>
            </div>
          </Reveal>
          {outras.length > 0 && (
            <div className="marca-outras">
              <span>{T("Outras soluções:")}</span>
              {outras.map((o) => (
                <L key={o.slug} href={hrefSolucao(o.slug)}>{o.nome}</L>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
