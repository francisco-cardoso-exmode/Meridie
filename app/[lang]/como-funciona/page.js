import L from "@/components/L";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { getConteudo } from "@/lib/conteudo";
import { t, tf } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPagina(lang, "/como-funciona", {
    titulo: t(lang, "Como Funciona"),
    descricao: t(lang, "O processo Meridie em 5 passos e os três pilares de serviço — intermediação imobiliária, assessoria fiscal e assessoria jurídica nos dois países."),
  });
}

export default async function ComoFunciona({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("como-funciona", lang);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{c.heroEyebrow}</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{c.passosEyebrow}</span>
            <h2>{c.passosTitulo}</h2>
          </Reveal>
          <div className="steps">
            {c.passos.map((p, i) => (
              <Reveal className="step" key={p.id} delay={i * 0.08}>
                <div className="n">{i + 1}</div>
                <div>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{c.pilaresEyebrow}</span>
            <h2>{c.pilaresTitulo}</h2>
            <p>{c.pilaresTexto}</p>
          </Reveal>
          <div className="grid grid-3">
            {c.pilares.map((p, i) => (
              <Reveal className="card" key={p.id} delay={i * 0.1}>
                {p.icone && <div className="icon"><Icon name={p.icone} /></div>}
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
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
            <L href="/contactos" className="btn btn-primary">
              {T("Falar com um especialista")}
            </L>
          </Reveal>
        </div>
      </section>
    </>
  );
}
