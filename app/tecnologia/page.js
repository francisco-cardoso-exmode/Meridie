import Link from "next/link";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { notFound } from "next/navigation";
import { getConteudo } from "@/lib/conteudo";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";

export const revalidate = 60;

export async function generateMetadata() {
  const c = await getConteudo("tecnologia");
  return {
    title: "Tecnologia",
    description: c.heroTexto,
    alternates: { canonical: "/tecnologia" },
  };
}

export default async function PaginaTecnologia() {
  if (!TECNOLOGIA_VISIVEL) notFound();
  const c = await getConteudo("tecnologia");
  const cards = [
    ["share", c.card1Titulo, c.card1Texto],
    ["code", c.card2Titulo, c.card2Texto],
    ["check", c.card3Titulo, c.card3Texto],
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Tecnologia</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="grid grid-3">
            {cards.map(([icon, t, d], i) => (
              <Reveal className="card" key={icon} delay={i * 0.1}>
                <div className="icon"><Icon name={icon} /></div>
                <h3>{t}</h3>
                <p>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>{c.ctaTitulo}</h2>
            <p>{c.ctaTexto}</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contactos" className="btn btn-primary">Procuro uma solução</Link>
              <Link href="/contactos" className="btn btn-outline">Quero representar a minha solução</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
