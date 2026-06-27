import Reveal from "@/components/Reveal";
import AnuncioCard from "@/components/AnuncioCard";
import { allAnuncios } from "@/lib/anuncios";

export const revalidate = 60;
export const metadata = {
  title: "Parceiros & Publicidade",
  description: "Hotéis, restaurantes e parceiros em destaque da Meridie Investments.",
};

export default async function PaginaPublicidade() {
  const anuncios = await allAnuncios();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Parceiros</span>
          <h1>Parceiros & destaques</h1>
          <p>Hotéis, restaurantes e parceiros recomendados nas nossas regiões.</p>
        </div>
      </section>

      <section>
        <div className="container">
          {anuncios.length > 0 ? (
            <div className="region-grid">
              {anuncios.map((a, i) => (
                <Reveal key={a.slug} delay={(i % 2) * 0.1}>
                  <AnuncioCard anuncio={a} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>Em breve, parceiros em destaque.</p></div>
          )}
        </div>
      </section>
    </>
  );
}
