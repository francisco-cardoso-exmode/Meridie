import L from "@/components/L";
import { notFound, permanentRedirect } from "next/navigation";
import CatalogoProdutos from "@/components/CatalogoProdutos";
import { allMarcas } from "@/lib/marcas";
import { allCategorias, allProdutos, cartoesProdutos } from "@/lib/representacoes";
import { hrefCategoria, porOrdem } from "@/lib/catalogo";
import { caminho, t, tf } from "@/lib/i18n";
import { metaPagina, metaNaoEncontrado } from "@/lib/seo";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

async function categoriaVisivel(slug, lang) {
  const cats = traduzLista(await allCategorias(), lang);
  return { cat: cats.find((c) => c.slug === slug) || null, cats };
}

export async function generateMetadata({ params }) {
  const { categoria, lang } = await params;
  const { cat } = await categoriaVisivel(categoria, lang);
  if (!cat || cat.parent) return metaNaoEncontrado(lang, t(lang, "Categoria não encontrada"));
  return metaPagina(lang, `/representacoes/${cat.slug}`, {
    titulo: tf(lang, "{nome} — Representações comerciais", { nome: cat.nome }),
    descricao: cat.descricao || tf(lang, "{nome}: produtos de marcas representadas pela Meridie Investments.", { nome: cat.nome }),
    imagem: cat.imagem || undefined,
  });
}

export default async function PaginaCategoria({ params }) {
  const { categoria, lang } = await params;
  const T = (x) => t(lang, x);
  const { cat, cats } = await categoriaVisivel(categoria, lang);
  if (!cat) notFound();
  // Uma subcategoria abre a página da categoria-mãe, já filtrada.
  if (cat.parent) permanentRedirect(caminho(lang, hrefCategoria(cat.parent, cat.slug)));

  const [produtosPt, marcasPt] = await Promise.all([allProdutos({ categoria: cat.slug }), allMarcas({ todos: true })]);
  const marcas = traduzLista(marcasPt, lang);
  const produtos = cartoesProdutos(traduzLista(produtosPt, lang), marcas);
  const subcategorias = cats
    .filter((c) => c.parent === cat.slug)
    .sort(porOrdem)
    .map((c) => ({ slug: c.slug, nome: c.nome }));
  const comProdutos = new Set(produtos.map((p) => p.marca));
  const marcasFiltro = marcas
    .filter((m) => comProdutos.has(m.slug) && m.ativo !== false)
    .map((m) => ({ slug: m.slug, nome: m.nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, lang));
  const outras = cats.filter((c) => !c.parent && c.slug !== cat.slug);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb rep-migalhas" aria-label={T("Caminho")}>
            <L href="/representacoes">{T("Representações comerciais")}</L> · {cat.nome}
          </nav>
          <h1>{cat.nome}</h1>
          {cat.descricao && <p>{cat.descricao}</p>}
        </div>
      </section>

      <section>
        <div className="container">
          {produtos.length ? (
            <CatalogoProdutos produtos={produtos} subcategorias={subcategorias} marcas={marcasFiltro} />
          ) : (
            <div className="empty-state">
              <p>{T("Ainda não há produtos nesta categoria. Fala connosco — podemos ter o que procuras.")}</p>
              <L href="/contactos" className="btn btn-primary">{T("Falar com a Meridie")}</L>
            </div>
          )}
          {outras.length > 0 && (
            <div className="marca-outras">
              <span>{T("Outras categorias:")}</span>
              {outras.map((o) => (
                <L key={o.slug} href={hrefCategoria(o.slug)}>{o.nome}</L>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
