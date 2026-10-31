import L from "@/components/L";
import Reveal from "@/components/Reveal";
import AreasCards from "@/components/AreasCards";
import { getConteudo } from "@/lib/conteudo";
import { t, tf } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPagina(lang, "/quem-somos", {
    titulo: t(lang, "Quem Somos"),
    descricao: t(lang, "A Meridie Investments liga Portugal e o Brasil no imobiliário, na representação de bebidas e alimentação — com o mesmo rigor e acompanhamento em cada área."),
  });
}

export default async function QuemSomos({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const [c, areas] = await Promise.all([getConteudo("quem-somos", lang), getConteudo("areas", lang)]);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{c.heroEyebrow}</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{c.percursoEyebrow}</span>
            <h2>{c.percursoTitulo}</h2>
          </Reveal>
          <AreasCards textos={areas} />
        </div>
      </section>

      <section>
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "start", gap: 48 }}>
            <Reveal>
              <span className="eyebrow">{c.missaoEyebrow}</span>
              <h2 style={{ fontSize: "1.9rem", marginBottom: 16 }}>
                {c.missaoTitulo}
              </h2>
              <p style={{ marginBottom: 14 }}>{c.missaoTexto1}</p>
              <p>{c.missaoTexto2}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="eyebrow">{c.visaoEyebrow}</span>
              <p style={{ fontSize: "1.15rem", color: "var(--ink)", marginTop: 8 }}>
                {c.visaoTexto}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{c.valoresEyebrow}</span>
            <h2>{c.valoresTitulo}</h2>
          </Reveal>
          <Reveal className="value-table">
            {c.valores.map((v, i) => (
              <div className="vrow" key={v.id}>
                <div className={`vk${i % 2 === 1 ? " alt" : ""}`}>{v.titulo}</div>
                <div className="vv">{v.texto}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{c.diferenciaisEyebrow}</span>
            <h2>{c.diferenciaisTitulo}</h2>
          </Reveal>
          <div className="grid grid-2">
            {c.diferenciais.map((d, i) => (
              <Reveal className="card" key={d.id} delay={(i % 2) * 0.1}>
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <L href="/contactos" className="btn btn-primary">
              {T("Trabalhar connosco")}
            </L>
          </div>
        </div>
      </section>
    </>
  );
}
