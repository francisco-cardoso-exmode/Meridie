import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import MarcaGaleria from "@/components/MarcaGaleria";
import BotaoPdf from "@/components/BotaoPdf";
import { allMarcas, marcaBySlug, AREAS_MARCA } from "@/lib/marcas";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m = await marcaBySlug(slug);
  if (!m || m.ativo === false) return { title: "Marca não encontrada" };
  return {
    title: m.nome,
    description: m.texto || `${m.nome} — marca representada pela Meridie Investments.`,
    alternates: { canonical: `/marcas/${m.slug}` },
    openGraph: { images: m.imagens?.[0] ? [{ url: m.imagens[0] }] : undefined },
  };
}

export default async function PaginaMarca({ params }) {
  const { slug } = await params;
  const m = await marcaBySlug(slug);
  if (!m || m.ativo === false) notFound();
  const outras = (await allMarcas()).filter((x) => x.slug !== m.slug);
  const externo = m.url && /^https?:\/\//.test(m.url);
  // Galeria: só as fotos que não aparecem já nos produtos.
  const fotosProdutos = new Set((m.produtos || []).map((p) => p.imagem));
  const galeria = (m.imagens || []).filter((src) => !fotosProdutos.has(src));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Link href="/marcas" className="marca-voltar">← Todas as marcas</Link>
          <span className="eyebrow">{m.origem || AREAS_MARCA[m.area]}</span>
          <h1>{m.nome}</h1>
          {m.texto && <p>{m.texto}</p>}
          {m.url && (
            <a href={m.url} target={externo ? "_blank" : undefined} rel="noopener" className="btn btn-primary" style={{ marginTop: 22 }}>
              Site da marca ↗
            </a>
          )}
        </div>
      </section>

      {m.produtos?.length > 0 && (
        <section>
          <div className="container">
            <Reveal className="section-head ficha-head">
              <div>
                <span className="eyebrow">Fichas de produto</span>
                <h2>A gama {m.nome}</h2>
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
              <span className="eyebrow">Galeria</span>
            </Reveal>
            <MarcaGaleria imagens={galeria} nome={m.nome} />
          </div>
        </section>
      )}

      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>Interessado em {m.nome}?</h2>
            <p>Distribuição, restauração, retalho ou eventos — fala connosco e enviamos as condições.</p>
            <Link href="/contactos" className="btn btn-primary">Falar com a Meridie</Link>
          </Reveal>
          {outras.length > 0 && (
            <div className="marca-outras">
              <span>Outras marcas:</span>
              {outras.map((o) => (
                <Link key={o.slug} href={`/marcas/${o.slug}`}>{o.nome}</Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
