import L from "@/components/L";
import { notFound, permanentRedirect } from "next/navigation";
import Reveal from "@/components/Reveal";
import MarcaGaleria from "@/components/MarcaGaleria";
import PrecoProduto from "@/components/PrecoProduto";
import ProdutoCard from "@/components/ProdutoCard";
import AdicionarAoPedido from "@/components/AdicionarAoPedido";
import { allMarcas } from "@/lib/marcas";
import { allCategorias, allProdutos, cartoesProdutos } from "@/lib/representacoes";
import { hrefCategoria, hrefMarca, hrefProduto, temPreco } from "@/lib/catalogo";
import { caminho, t, tf } from "@/lib/i18n";
import { metaPagina, metaNaoEncontrado, urlPublica, jsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

// Só os produtos visíveis (ativos, de marca e categoria ativas).
async function produtoVisivel(slug) {
  return (await allProdutos()).find((p) => p.slug === slug) || null;
}

const absoluto = (src) => (src?.startsWith("/") ? `${SITE_URL}${src}` : src);

export async function generateMetadata({ params }) {
  const { produto, lang } = await params;
  const p = traduzDoc(await produtoVisivel(produto), lang);
  if (!p) return metaNaoEncontrado(lang, t(lang, "Produto não encontrado"));
  const marca = (await allMarcas({ todos: true })).find((m) => m.slug === p.marca);
  return metaPagina(lang, hrefProduto(p), {
    titulo: marca ? `${p.nome} — ${marca.nome}` : p.nome,
    descricao: p.resumo || (p.descricao ? p.descricao.slice(0, 160) : p.nome),
    imagem: p.imagens?.[0],
    tipo: "website",
  });
}

export default async function PaginaProduto({ params }) {
  const { categoria, produto, lang } = await params;
  const T = (x) => t(lang, x);
  const pt = await produtoVisivel(produto);
  if (!pt) notFound();
  // Endereço com a categoria errada (o produto mudou de categoria): o certo.
  if (pt.categoria !== categoria) permanentRedirect(caminho(lang, hrefProduto(pt)));
  const p = traduzDoc(pt, lang);

  const [marcasPt, catsPt, irmaos] = await Promise.all([
    allMarcas({ todos: true }),
    allCategorias(),
    allProdutos({ categoria: p.categoria }),
  ]);
  const marcas = traduzLista(marcasPt, lang);
  const cats = traduzLista(catsPt, lang);
  const marca = marcas.find((m) => m.slug === p.marca && m.ativo !== false);
  const cat = cats.find((c) => c.slug === p.categoria);
  const sub = cats.find((c) => c.slug === p.subcategoria);
  // Relacionados: primeiro os da mesma subcategoria, depois o resto da categoria.
  const outros = irmaos.filter((x) => x.slug !== p.slug);
  const relacionados = cartoesProdutos(
    traduzLista(
      [...outros.filter((x) => p.subcategoria && x.subcategoria === p.subcategoria), ...outros.filter((x) => !p.subcategoria || x.subcategoria !== p.subcategoria)].slice(0, 4),
      lang
    ),
    marcas
  );
  const imagens = p.imagens?.length ? p.imagens : marca?.imagens?.slice(0, 1) || [];
  const disponivel = p.disponivel !== false;

  // Dados estruturados: Product, com Offer só quando há preço publicado.
  const url = urlPublica(lang, hrefProduto(p));
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nome,
    url,
    sku: p.slug,
    ...(imagens.length ? { image: imagens.map(absoluto) } : {}),
    ...(p.resumo || p.descricao ? { description: p.resumo || p.descricao } : {}),
    ...(marca ? { brand: { "@type": "Brand", name: marca.nome } } : {}),
    ...(cat ? { category: sub ? `${cat.nome} > ${sub.nome}` : cat.nome } : {}),
    ...(temPreco(p)
      ? {
          offers: {
            "@type": "Offer",
            price: Number(p.preco).toFixed(2),
            priceCurrency: "EUR",
            availability: disponivel ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url,
            ...(Number(p.minimo) > 1
              ? { eligibleQuantity: { "@type": "QuantitativeValue", minValue: Number(p.minimo) } }
              : {}),
          },
        }
      : {}),
  };
  const ldMigalhas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: T("Representações comerciais"), item: urlPublica(lang, "/representacoes") },
      ...(cat ? [{ name: cat.nome, item: urlPublica(lang, hrefCategoria(cat.slug)) }] : []),
      { name: p.nome, item: url },
    ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
  };

  const item = {
    tipo: "produto",
    slug: p.slug,
    nome: p.nome,
    imagem: imagens[0] || "",
    precoTipo: temPreco(p) ? "valor" : "consulta",
    preco: temPreco(p) ? Number(p.preco) : null,
    unidade: p.unidade || "",
    minimo: Math.max(1, Number(p.minimo) || 1),
    href: hrefProduto(p),
  };

  return (
    <div className="rep-produto-pagina">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ldMigalhas) }} />
      <section className="rep-produto-topo">
        <div className="container">
          <nav className="breadcrumb" aria-label={T("Caminho")}>
            <L href="/representacoes">{T("Representações comerciais")}</L>
            {cat && (
              <>
                {" · "}
                <L href={hrefCategoria(cat.slug)}>{cat.nome}</L>
              </>
            )}
            {sub && (
              <>
                {" · "}
                <L href={hrefCategoria(cat?.slug || p.categoria, sub.slug)}>{sub.nome}</L>
              </>
            )}
          </nav>
          <div className="rep-produto-grid">
            <div>
              {imagens.length > 0 ? (
                <MarcaGaleria imagens={imagens} nome={p.nome} />
              ) : (
                <div className="marca-galeria-main rep-sem-foto" aria-hidden="true" />
              )}
            </div>
            <div className="rep-produto-info">
              {marca && (
                <L href={hrefMarca(marca.slug)} className="marca-origem">
                  {marca.nome}
                </L>
              )}
              <h1>{p.nome}</h1>
              {p.resumo && <p className="rep-resumo">{p.resumo}</p>}
              <PrecoProduto p={p} grande />
              <p className={`rep-disp${disponivel ? "" : " nao"}`}>
                {disponivel ? T("Disponível") : T("Indisponível de momento")}
              </p>
              <AdicionarAoPedido item={item} disponivel={disponivel} />
              <p className="pedido-nota">
                {T("Sem pagamento online: envias o pedido e respondemos com a disponibilidade e as condições.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {(p.descricao || p.especificacoes?.length > 0) && (
        <section className="bg-soft">
          <div className="container rep-produto-detalhe">
            {p.descricao && (
              <div>
                <h2>{T("Descrição")}</h2>
                {p.descricao.split(/\n{2,}/).map((par, i) => (
                  <p key={i}>{par}</p>
                ))}
              </div>
            )}
            {p.especificacoes?.length > 0 && (
              <div>
                <h2>{T("Ficha técnica")}</h2>
                <table className="ficha-tabela">
                  <tbody>
                    {p.especificacoes.map(([k, v], j) => (
                      <tr key={j}>
                        <th>{k}</th>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {relacionados.length > 0 && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{cat?.nome}</span>
              <h2>{T("Produtos relacionados")}</h2>
            </Reveal>
            <div className="produto-grid">
              {relacionados.map((r) => (
                <ProdutoCard key={r.slug} p={r} />
              ))}
            </div>
            {marca && (
              <div className="marca-outras">
                <L href={hrefMarca(marca.slug)}>{tf(lang, "Toda a gama {nome} →", { nome: marca.nome })}</L>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
