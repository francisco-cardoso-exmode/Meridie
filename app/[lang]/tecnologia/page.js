import L from "@/components/L";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { notFound } from "next/navigation";
import { getConteudo } from "@/lib/conteudo";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { t, tf, alternates } from "@/lib/i18n";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const c = await getConteudo("tecnologia", lang);
  return {
    title: t(lang, "Tecnologia"),
    description: c.heroTexto,
    alternates: alternates(lang, "/tecnologia"),
  };
}

export default async function PaginaTecnologia({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  if (!TECNOLOGIA_VISIVEL) notFound();
  const c = await getConteudo("tecnologia", lang);
  const cards = [
    ["share", c.card1Titulo, c.card1Texto],
    ["code", c.card2Titulo, c.card2Texto],
    ["check", c.card3Titulo, c.card3Texto],
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{T("Tecnologia")}</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="grid grid-3">
            {cards.map(([icon, tit, d], i) => (
              <Reveal className="card" key={icon} delay={i * 0.1}>
                <div className="icon"><Icon name={icon} /></div>
                <h3>{tit}</h3>
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
              <L href="/contactos" className="btn btn-primary">{T("Procuro uma solução")}</L>
              <L href="/contactos" className="btn btn-outline">{T("Quero representar a minha solução")}</L>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
