import L from "@/components/L";
import Reveal from "@/components/Reveal";
import AnuncioCard from "@/components/AnuncioCard";
import { allAnuncios } from "@/lib/anuncios";
import { CATEGORIAS_PARCEIRO } from "@/lib/categoriasParceiro";
import { t, tf, alternates } from "@/lib/i18n";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;
export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: t(lang, "Parceiros & Patrocinadores"),
    description: t(lang, "Companhias aéreas, hotéis, restaurantes e guias que acompanham os clientes da Meridie Investments entre Portugal e o Brasil."),
    alternates: alternates(lang, "/publicidade"),
  };
}

export default async function PaginaPublicidade({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
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
          <span className="eyebrow">{T("Parceiros e patrocinadores")}</span>
          <h1>{T("Quem nos acompanha entre Portugal e o Brasil.")}</h1>
          <p>
            {T("Da viagem à estadia, da mesa à descoberta do destino: as empresas que tornam cada visita mais simples para os nossos clientes.")}
          </p>
        </div>
      </section>

      {principal && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{T("Patrocinador principal")}</span>
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
            <h2>{T("Queres ver a tua empresa aqui?")}</h2>
            <p>
              {T("Trabalhamos com parcerias e com espaços de patrocínio, com destaque nesta página e na página inicial. Diz-nos o que procuras e enviamos as condições.")}
            </p>
            <L href="/contactos" className="btn btn-primary">{T("Pedir condições")}</L>
          </Reveal>
        </div>
      </section>
    </>
  );
}
