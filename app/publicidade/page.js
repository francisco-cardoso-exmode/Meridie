import Link from "next/link";
import Reveal from "@/components/Reveal";
import AnuncioCard from "@/components/AnuncioCard";
import { allAnuncios } from "@/lib/anuncios";
import { CATEGORIAS_PARCEIRO } from "@/lib/categoriasParceiro";

export const revalidate = 60;
export const metadata = {
  title: "Parceiros & Patrocinadores",
  description:
    "Companhias aéreas, hotéis, restaurantes e guias que acompanham os clientes da Meridie Investments entre Portugal e o Brasil.",
};

export default async function PaginaPublicidade() {
  const anuncios = await allAnuncios();
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
          <span className="eyebrow">Parceiros e patrocinadores</span>
          <h1>Quem nos acompanha entre Portugal e o Brasil.</h1>
          <p>
            Da viagem à estadia, da mesa à descoberta do destino: as empresas que
            tornam cada visita mais simples para os nossos clientes.
          </p>
        </div>
      </section>

      {principal && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">Patrocinador principal</span>
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
                <h2>{cat}</h2>
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
            <div className="empty-state"><p>Em breve, parceiros em destaque.</p></div>
          </div>
        </section>
      )}

      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>Queres ver a tua empresa aqui?</h2>
            <p>
              Trabalhamos com parcerias e com espaços de patrocínio, com destaque
              nesta página e na página inicial. Diz-nos o que procuras e enviamos as condições.
            </p>
            <Link href="/contactos" className="btn btn-primary">Pedir condições</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
