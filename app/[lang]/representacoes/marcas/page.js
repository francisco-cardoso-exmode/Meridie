import L from "@/components/L";
import Reveal from "@/components/Reveal";
import MarcaCard from "@/components/MarcaCard";
import { allMarcas } from "@/lib/marcas";
import { allProdutos, marcasComProdutos } from "@/lib/representacoes";
import { t } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";
import { traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPagina(lang, "/representacoes/marcas", {
    titulo: t(lang, "Marcas representadas"),
    descricao: t(lang, "As marcas que a Meridie Investments representa — a história, as fotografias e os produtos de cada uma."),
  });
}

export default async function PaginaMarcas({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const [marcasPt, produtosPt] = await Promise.all([allMarcas(), allProdutos()]);
  const produtos = traduzLista(produtosPt, lang);
  // O cartão da marca mostra a foto e o número dos produtos (agora numa coleção à parte).
  const marcas = marcasComProdutos(traduzLista(marcasPt, lang), produtos);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb rep-migalhas" aria-label={T("Caminho")}>
            <L href="/representacoes">{T("Representações comerciais")}</L> · {T("Marcas")}
          </nav>
          <h1>{T("Marcas representadas")}</h1>
          <p>{T("As marcas que a Meridie Investments representa — a história, as fotografias e os produtos de cada uma.")}</p>
        </div>
      </section>
      <section>
        <div className="container">
          <div className="marca-grid">
            {marcas.map((m, i) => (
              <Reveal key={m.slug} delay={(i % 3) * 0.08}>
                <MarcaCard marca={m} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
