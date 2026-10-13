import L from "@/components/L";
import Reveal from "@/components/Reveal";
import AreasCards from "@/components/AreasCards";
import { getConteudo } from "@/lib/conteudo";
import { t, tf, traduzDoc, traduzLista, alternates } from "@/lib/i18n";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: t(lang, "Quem Somos"),
    description: t(lang, "A Meridie Investments liga Portugal e o Brasil no imobiliário, na representação de bebidas e alimentação — com o mesmo rigor e acompanhamento em cada área."),
    alternates: alternates(lang, "/quem-somos"),
  };
}

const valores = [
  ["Confiança", "Cada parceiro da nossa rede é verificado. Sabes sempre com quem trabalhas."],
  ["Transparência", "Sem surpresas em fees, processo ou documentos. Tudo claro desde o primeiro contacto."],
  ["Rigor", "Processo jurídico e fiscal impecável nos dois países. Nada é deixado ao acaso."],
  ["Personalização", "Cada cliente tem objetivos únicos. O serviço adapta-se — nunca é produto de prateleira."],
  ["Conhecimento", "Operamos em ambos os mercados com profundidade real — legislação, fiscalidade e cultura."],
];

const diferenciais = [
  ["Conhecimento bilateral real", "Não somos uma agência com 'contactos do outro lado'. Operamos nos dois mercados com conhecimento profundo."],
  ["Rede de parceiros verificados", "Cada corretor, advogado e contabilista passa por seleção rigorosa, com credenciais verificadas."],
  ["Coordenação total", "Um ponto de contacto único coordena todo o processo — intermediação, jurídico e fiscal — nos dois países."],
  ["Transparência de custos", "Sabes exatamente quanto custa cada serviço antes de avançar. Sem custos escondidos."],
];

export default async function QuemSomos({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("quem-somos", lang);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{T("Quem Somos")}</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{T("O nosso percurso")}</span>
            <h2>{T("Começámos no imobiliário. Hoje investimos onde encontramos valor.")}</h2>
          </Reveal>
          <AreasCards />
        </div>
      </section>

      <section>
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "start", gap: 48 }}>
            <Reveal>
              <span className="eyebrow">{T("A nossa missão")}</span>
              <h2 style={{ fontSize: "1.9rem", marginBottom: 16 }}>
                {c.missaoTitulo}
              </h2>
              <p style={{ marginBottom: 14 }}>{c.missaoTexto1}</p>
              <p>{c.missaoTexto2}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="eyebrow">{T("A nossa visão")}</span>
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
            <span className="eyebrow">{T("Os nossos valores")}</span>
            <h2>{T("Aquilo em que não cedemos")}</h2>
          </Reveal>
          <Reveal className="value-table">
            {valores.map(([k, v], i) => (
              <div className="vrow" key={k}>
                <div className={`vk${i % 2 === 1 ? " alt" : ""}`}>{T(k)}</div>
                <div className="vv">{T(v)}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{T("Diferenciais")}</span>
            <h2>{T("Porque escolher a Meridie")}</h2>
          </Reveal>
          <div className="grid grid-2">
            {diferenciais.map(([tit, d], i) => (
              <Reveal className="card" key={tit} delay={(i % 2) * 0.1}>
                <h3>{T(tit)}</h3>
                <p>{T(d)}</p>
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
