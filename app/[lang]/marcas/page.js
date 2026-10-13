import L from "@/components/L";
import Reveal from "@/components/Reveal";
import MarcaCard from "@/components/MarcaCard";
import { allMarcas, AREAS_MARCA } from "@/lib/marcas";
import { getConteudo } from "@/lib/conteudo";
import { t, tf, traduzDoc, traduzLista, alternates } from "@/lib/i18n";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const c = await getConteudo("marcas", lang);
  return {
    title: t(lang, "Marcas representadas"),
    description: c.heroTexto,
    alternates: alternates(lang, "/marcas"),
  };
}

export default async function PaginaMarcas({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("marcas", lang);
  const marcas = traduzLista(await allMarcas(), lang);
  // Agrupa por área, pela ordem de AREAS_MARCA (áreas sem marcas não aparecem).
  const grupos = Object.entries(AREAS_MARCA)
    .map(([k, label]) => [label, marcas.filter((m) => m.area === k)])
    .filter(([, l]) => l.length);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{T("Bebidas & Alimentação")}</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      {grupos.map(([label, lista], gi) => (
        <section key={label} className={gi % 2 ? "bg-soft" : undefined}>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{T(label)}</span>
              <h2>{label === "Bebidas" ? T("Vinhos e bebidas") : T(label)}</h2>
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
            <L href="/contactos" className="btn btn-primary">
              {T("Quero representar a minha marca")}
            </L>
          </Reveal>
        </div>
      </section>
    </>
  );
}
