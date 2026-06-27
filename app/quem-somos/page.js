import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Quem Somos",
  description:
    "A Meridie Investments convergimos dois mercados, dois sistemas jurídicos e duas realidades fiscais num processo único, coordenado e transparente.",
};

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

export default function QuemSomos() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Quem Somos</span>
          <h1>Convergimos dois mundos num só processo.</h1>
          <p>
            O nome Meridie vem do latim <em>meridies</em> — convergência, sul,
            ponto de encontro. É exatamente o que fazemos: fazer convergir dois
            mercados, dois sistemas jurídicos e duas realidades fiscais.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "start", gap: 48 }}>
            <Reveal>
              <span className="eyebrow">A nossa missão</span>
              <h2 style={{ fontSize: "1.9rem", marginBottom: 16 }}>
                O investidor que olha além-fronteiras merece um parceiro que
                domine os dois lados.
              </h2>
              <p style={{ marginBottom: 14 }}>
                Conectar investidores portugueses e brasileiros às melhores
                oportunidades imobiliárias em ambos os países, com um serviço
                integrado de intermediação, assessoria jurídica e fiscal que
                torna o investimento transfronteiriço simples, seguro e rentável.
              </p>
              <p>
                Não vendemos imóveis. Coordenamos os melhores profissionais
                locais, gerimos o processo de ponta a ponta e garantimos que cada
                decisão é tomada com informação completa e segurança jurídica.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="eyebrow">A nossa visão</span>
              <p style={{ fontSize: "1.15rem", color: "var(--ink)", marginTop: 8 }}>
                Ser a referência de confiança no investimento imobiliário entre
                Portugal e o Brasil — reconhecida pela qualidade dos parceiros,
                pela transparência do processo e pelo impacto real na vida
                financeira dos nossos clientes.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Os nossos valores</span>
            <h2>Aquilo em que não cedemos</h2>
          </Reveal>
          <Reveal className="value-table">
            {valores.map(([k, v], i) => (
              <div className="vrow" key={k}>
                <div className={`vk${i % 2 === 1 ? " alt" : ""}`}>{k}</div>
                <div className="vv">{v}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Diferenciais</span>
            <h2>Porque escolher a Meridie</h2>
          </Reveal>
          <div className="grid grid-2">
            {diferenciais.map(([t, d], i) => (
              <Reveal className="card" key={t} delay={(i % 2) * 0.1}>
                <h3>{t}</h3>
                <p>{d}</p>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/contactos" className="btn btn-primary">
              Trabalhar connosco
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
