import L from "@/components/L";
import Reveal from "@/components/Reveal";
import Foto from "@/components/Foto";
import ProdutoCard from "@/components/ProdutoCard";
import MarcasFaixa from "@/components/MarcasFaixa";
import { allMarcas } from "@/lib/marcas";
import { allCategorias, allProdutos, cartoesProdutos, marcasComProdutos } from "@/lib/representacoes";
import { arvoreCategorias, hrefCategoria } from "@/lib/catalogo";
import { getConteudo } from "@/lib/conteudo";
import { t, tf } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";
import { traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const c = await getConteudo("marcas", lang);
  return metaPagina(lang, "/representacoes", {
    titulo: t(lang, "Representações comerciais"),
    descricao: c.heroTexto,
  });
}

export default async function PaginaRepresentacoes({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("marcas", lang);
  const [catsPt, produtosPt, marcasPt] = await Promise.all([allCategorias(), allProdutos(), allMarcas()]);
  const marcas = traduzLista(marcasPt, lang);
  const produtos = traduzLista(produtosPt, lang);
  // Categorias de topo, com a contagem e a foto (a da categoria, ou a do 1.º produto).
  const categorias = arvoreCategorias(traduzLista(catsPt, lang))
    .map((cat) => {
      const daCat = produtos.filter((p) => p.categoria === cat.slug);
      return {
        ...cat,
        n: daCat.length,
        foto: cat.imagem || daCat.find((p) => p.imagens?.[0])?.imagens[0] || "",
        filhos: cat.filhos.filter((f) => daCat.some((p) => p.subcategoria === f.slug)),
      };
    })
    .filter((cat) => cat.n > 0);
  const destaques = cartoesProdutos(produtos.filter((p) => p.destaque), marcas).slice(0, 8);
  // Faixa: as marcas com produtos visíveis (ou todas, se nenhuma tiver).
  const comProdutos = new Set(produtos.map((p) => p.marca));
  const faixa = marcasComProdutos(marcas.filter((m) => comProdutos.has(m.slug)), produtos);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{c.heroEyebrow}</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      {categorias.length > 0 && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{c.categoriasEyebrow}</span>
              <h2>{c.categoriasTitulo}</h2>
            </Reveal>
            <div className="rep-cat-grid">
              {categorias.map((cat, i) => (
                <Reveal key={cat.slug} delay={(i % 3) * 0.08}>
                  <div className="rep-cat-card">
                    <L href={hrefCategoria(cat.slug)} className="rep-cat-foto">
                      {cat.foto && <Foto src={cat.foto} alt={cat.nome} fill sizes="(max-width: 700px) 100vw, 380px" />}
                    </L>
                    <div className="rep-cat-body">
                      <h3>
                        <L href={hrefCategoria(cat.slug)}>{cat.nome}</L>
                      </h3>
                      {cat.descricao && <p>{cat.descricao}</p>}
                      {cat.filhos.length > 0 && (
                        <div className="rep-chips pequenos">
                          {cat.filhos.map((f) => (
                            <L key={f.slug} href={hrefCategoria(cat.slug, f.slug)}>
                              {f.nome}
                            </L>
                          ))}
                        </div>
                      )}
                      <L href={hrefCategoria(cat.slug)} className="pub-cta">
                        {cat.n === 1 ? T("Ver o produto →") : tf(lang, "Ver os {n} produtos →", { n: cat.n })}
                      </L>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {destaques.length > 0 && (
        <section className="bg-soft">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{c.destaquesEyebrow}</span>
              <h2>{c.destaquesTitulo}</h2>
            </Reveal>
            <div className="produto-grid">
              {destaques.map((p) => (
                <ProdutoCard key={p.slug} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {faixa.length > 0 && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{c.marcasEyebrow}</span>
              <h2>{c.marcasTitulo}</h2>
            </Reveal>
            <MarcasFaixa marcas={faixa} />
            <div style={{ marginTop: 22 }}>
              <L href="/representacoes/marcas" className="pub-cta">{T("Todas as marcas →")}</L>
            </div>
          </div>
        </section>
      )}

      <section className="bg-soft">
        <div className="container">
          <Reveal className="rep-como">
            <div>
              <h2>{c.comoTitulo}</h2>
              <p>{c.comoTexto}</p>
            </div>
            <L href="/pedido" className="btn btn-primary">{T("Ver o meu pedido")}</L>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>{c.ctaTitulo}</h2>
            <p>{c.ctaTexto}</p>
            <L href="/contactos" className="btn btn-primary">
              {T("Quero representar a minha marca")}
            </L>
          </Reveal>
        </div>
      </section>
    </>
  );
}
