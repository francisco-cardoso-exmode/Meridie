import L from "@/components/L";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import MarcaGaleria from "@/components/MarcaGaleria";
import BotaoPdf from "@/components/BotaoPdf";
import { allMarcas, marcaBySlug, AREAS_MARCA } from "@/lib/marcas";
import { t, tf, alternates } from "@/lib/i18n";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const m = traduzDoc(await marcaBySlug(slug), lang);
  if (!m || m.ativo === false) return { title: t(lang, "Marca não encontrada") };
  return {
    title: m.nome,
    description: m.texto || tf(lang, "{nome} — marca representada pela Meridie Investments.", { nome: m.nome }),
    alternates: alternates(lang, `/marcas/${m.slug}`),
    openGraph: { images: m.imagens?.[0] ? [{ url: m.imagens[0] }] : undefined },
  };
}

export default async function PaginaMarca({ params }) {
  const { slug, lang } = await params;
  const T = (x) => t(lang, x);
  const m = traduzDoc(await marcaBySlug(slug), lang);
  if (!m || m.ativo === false) notFound();
  const outras = traduzLista(await allMarcas(), lang).filter((x) => x.slug !== m.slug);
  const externo = m.url && /^https?:\/\//.test(m.url);
  // Galeria: só as fotos que não aparecem já nos produtos.
  const fotosProdutos = new Set((m.produtos || []).map((p) => p.imagem));
  const galeria = (m.imagens || []).filter((src) => !fotosProdutos.has(src));
  // Montra do topo: até 5 fotos de produto, lado a lado.
  const montra = [...fotosProdutos].filter(Boolean).slice(0, 5);

  return (
    <div className="marca-pagina">
      <section className="page-hero">
        <div className="container marca-hero">
          <div>
            <L href="/marcas" className="marca-voltar">{T("← Todas as marcas")}</L>
            <span className="eyebrow">{m.origem || T(AREAS_MARCA[m.area])}</span>
            <h1>{m.nome}</h1>
            {m.texto && <p>{m.texto}</p>}
            {m.url && (
              <a href={m.url} target={externo ? "_blank" : undefined} rel="noopener" className="btn btn-primary" style={{ marginTop: 22 }}>
                {T("Site da marca ↗")}
              </a>
            )}
          </div>
          {montra.length > 0 && (
            <div className="marca-montra" aria-hidden="true">
              {montra.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
            </div>
          )}
        </div>
      </section>

      {m.produtos?.length > 0 && (
        <section>
          <div className="container">
            <Reveal className="section-head ficha-head">
              <div>
                <span className="eyebrow">{T("Fichas de produto")}</span>
                <h2>{tf(lang, "A gama {nome}", { nome: m.nome })}</h2>
              </div>
              <BotaoPdf />
            </Reveal>
            <div className="ficha-lista">
              {m.produtos.map((p, i) => (
                <article className="ficha" key={`${p.nome}-${i}`}>
                  <div className="ficha-foto">
                    {p.imagem && <img src={p.imagem} alt={p.nome} loading="lazy" />}
                  </div>
                  <div className="ficha-texto">
                    <span className="marca-origem">{m.nome}</span>
                    <h3>{p.nome}</h3>
                    {p.descricao && <p>{p.descricao}</p>}
                    {p.caracteristicas?.length > 0 && (
                      <table className="ficha-tabela">
                        <tbody>
                          {p.caracteristicas.map(([k, v], j) => (
                            <tr key={j}>
                              <th>{k}</th>
                              <td>{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {galeria.length > 0 && (
        <section className="bg-soft">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{T("Galeria")}</span>
            </Reveal>
            <MarcaGaleria imagens={galeria} nome={m.nome} />
          </div>
        </section>
      )}

      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>{tf(lang, "Interessado em {nome}?", { nome: m.nome })}</h2>
            <p>{T("Distribuição, restauração, retalho ou eventos — fala connosco e enviamos as condições.")}</p>
            <L href="/contactos" className="btn btn-primary">{T("Falar com a Meridie")}</L>
          </Reveal>
          {outras.length > 0 && (
            <div className="marca-outras">
              <span>{T("Outras marcas:")}</span>
              {outras.map((o) => (
                <L key={o.slug} href={`/marcas/${o.slug}`}>{o.nome}</L>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
