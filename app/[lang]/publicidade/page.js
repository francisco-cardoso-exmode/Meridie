import L from "@/components/L";
import Reveal from "@/components/Reveal";
import AnuncioCard from "@/components/AnuncioCard";
import { allAnuncios } from "@/lib/anuncios";
import { CATEGORIAS_PARCEIRO } from "@/lib/categoriasParceiro";
import { getConteudo } from "@/lib/conteudo";
import { t, tf } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;
export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPagina(lang, "/publicidade", {
    titulo: t(lang, "Parceiros & Patrocinadores"),
    descricao: t(lang, "Companhias aéreas, hotéis, restaurantes e guias que acompanham os clientes da Meridie Investments entre Portugal e o Brasil."),
  });
}

export default async function PaginaPublicidade({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("publicidade", lang);
  const anuncios = traduzLista(await allAnuncios(), lang);
  const principal = anuncios.find((a) => a.principal);
  const resto = anuncios.filter((a) => a !== principal);
  // Agrupa por categoria (pela ordem da lista); sem categoria vai para "Outros".
  const grupoDe = (a) => (CATEGORIAS_PARCEIRO.includes(a.categoria) ? a.categoria : "Outros parceiros");
  const grupos = [...CATEGORIAS_PARCEIRO, "Outros parceiros"]
    .map((cat) => [cat, resto.filter((a) => grupoDe(a) === cat)])
    .filter(([, l]) => l.length);
  const soUmGrupo = grupos.length === 1;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{c.heroEyebrow}</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      {principal && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{c.principalEyebrow}</span>
            </Reveal>
            <Reveal>
              <div className="pub-principal">
                <AnuncioCard anuncio={principal} />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {grupos.map(([cat, lista], gi) => (
        <section key={cat} className={(gi + (principal ? 1 : 0)) % 2 ? "bg-soft" : undefined}>
          <div className="container">
            {!soUmGrupo && (
              <Reveal className="section-head">
                <h2>{T(cat)}</h2>
              </Reveal>
            )}
            <div className="region-grid">
              {lista.map((a, i) => (
                <Reveal key={a.slug} delay={(i % 2) * 0.1}>
                  <AnuncioCard anuncio={a} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {anuncios.length === 0 && (
        <section>
          <div className="container">
            <div className="empty-state"><p>{T("Em breve, parceiros em destaque.")}</p></div>
          </div>
        </section>
      )}

      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>{c.ctaTitulo}</h2>
            <p>{c.ctaTexto}</p>
            <L href="/contactos" className="btn btn-primary">{T("Pedir condições")}</L>
          </Reveal>
        </div>
      </section>
    </>
  );
}
