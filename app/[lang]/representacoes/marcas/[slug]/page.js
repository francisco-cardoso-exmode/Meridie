import L from "@/components/L";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import MarcaGaleria from "@/components/MarcaGaleria";
import ProdutoCard from "@/components/ProdutoCard";
import Foto from "@/components/Foto";
import { allMarcas, marcaBySlug } from "@/lib/marcas";
import { allCategorias, allProdutos, cartoesProdutos } from "@/lib/representacoes";
import { arvoreCategorias, hrefCategoria, hrefMarca } from "@/lib/catalogo";
import { t, tf } from "@/lib/i18n";
import { metaPagina, metaNaoEncontrado } from "@/lib/seo";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const m = traduzDoc(await marcaBySlug(slug), lang);
  if (!m || m.ativo === false) return metaNaoEncontrado(lang, t(lang, "Marca não encontrada"));
  return metaPagina(lang, hrefMarca(m.slug), {
    titulo: m.nome,
    descricao: m.texto || tf(lang, "{nome} — marca representada pela Meridie Investments.", { nome: m.nome }),
    imagem: m.imagens?.[0],
  });
}

export default async function PaginaMarca({ params }) {
  const { slug, lang } = await params;
  const T = (x) => t(lang, x);
  const m = traduzDoc(await marcaBySlug(slug), lang);
  if (!m || m.ativo === false) notFound();
  const [outrasPt, produtosPt, catsPt] = await Promise.all([allMarcas(), allProdutos({ marca: m.slug }), allCategorias()]);
  const outras = traduzLista(outrasPt, lang).filter((x) => x.slug !== m.slug);
  const produtos = cartoesProdutos(traduzLista(produtosPt, lang), [m]);
  // Produtos agrupados pela categoria de topo (pela ordem das categorias).
  const grupos = arvoreCategorias(traduzLista(catsPt, lang))
    .map((c) => [c, produtos.filter((p) => p.categoria === c.slug)])
    .filter(([, l]) => l.length);
  const externo = m.url && /^https?:\/\//.test(m.url);
  // Galeria: só as fotos que não aparecem já nos produtos.
  const fotosProdutos = new Set(produtos.map((p) => p.imagem).filter(Boolean));
  const galeria = (m.imagens || []).filter((src) => !fotosProdutos.has(src));
  // Montra do topo: até 5 fotos de produto, lado a lado.
  const montra = [...fotosProdutos].slice(0, 5);

  return (
    <div className="marca-pagina">
      <section className="page-hero">
        <div className="container marca-hero">
          <div>
            <L href="/representacoes/marcas" className="marca-voltar">{T("← Todas as marcas")}</L>
            <span className="eyebrow">{m.origem || T("Representações comerciais")}</span>
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
                <Foto key={src} src={src} alt="" width={300} height={300} sizes="(max-width: 860px) 20vw, 120px" />
              ))}
            </div>
          )}
        </div>
      </section>

      {grupos.map(([c, lista], gi) => (
        <section key={c.slug} className={gi % 2 ? "bg-soft" : undefined}>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">
                <L href={hrefCategoria(c.slug)}>{c.nome}</L>
              </span>
              <h2>{gi === 0 ? tf(lang, "A gama {nome}", { nome: m.nome }) : c.nome}</h2>
            </Reveal>
            <div className="produto-grid">
              {lista.map((p) => (
                <ProdutoCard key={p.slug} p={{ ...p, marcaNome: "" }} />
              ))}
            </div>
          </div>
        </section>
      ))}

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
            <p>{T("Distribuição, restauração, retalho ou eventos — acrescenta os produtos ao pedido ou fala connosco e enviamos as condições.")}</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <L href="/pedido" className="btn btn-primary">{T("Ver o meu pedido")}</L>
              <L href="/contactos" className="btn btn-outline">{T("Falar com a Meridie")}</L>
            </div>
          </Reveal>
          {outras.length > 0 && (
            <div className="marca-outras">
              <span>{T("Outras marcas:")}</span>
              {outras.map((o) => (
                <L key={o.slug} href={hrefMarca(o.slug)}>{o.nome}</L>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
