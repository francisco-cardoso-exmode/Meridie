import Link from "next/link";
import Reveal from "@/components/Reveal";
import MarcaCard from "@/components/MarcaCard";
import { allMarcas, AREAS_MARCA } from "@/lib/marcas";
import { getConteudo } from "@/lib/conteudo";

export const revalidate = 60;

export async function generateMetadata() {
  const c = await getConteudo("marcas");
  return {
    title: "Marcas representadas",
    description: c.heroTexto,
    alternates: { canonical: "/marcas" },
  };
}

export default async function PaginaMarcas() {
  const c = await getConteudo("marcas");
  const marcas = await allMarcas();
  // Agrupa por área, pela ordem de AREAS_MARCA (áreas sem marcas não aparecem).
  const grupos = Object.entries(AREAS_MARCA)
    .map(([k, label]) => [label, marcas.filter((m) => m.area === k)])
    .filter(([, l]) => l.length);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Bebidas & Alimentação</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      {grupos.map(([label, lista], gi) => (
        <section key={label} className={gi % 2 ? "bg-soft" : undefined}>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{label}</span>
              <h2>{label === "Bebidas" ? "Vinhos e bebidas" : label}</h2>
            </Reveal>
            <div className="marca-grid">
              {lista.map((m, i) => (
                <Reveal key={m.slug} delay={(i % 3) * 0.08}>
                  <MarcaCard marca={m} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>{c.ctaTitulo}</h2>
            <p>{c.ctaTexto}</p>
            <Link href="/contactos" className="btn btn-primary">
              Quero representar a minha marca
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
