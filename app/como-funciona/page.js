import Link from "next/link";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { getConteudo } from "@/lib/conteudo";

export const revalidate = 60;

export const metadata = {
  title: "Como Funciona",
  description:
    "O processo Meridie em 5 passos e os três pilares de serviço — intermediação imobiliária, assessoria fiscal e assessoria jurídica nos dois países.",
};

const passos = [
  {
    n: 1,
    t: "Contacto e análise do perfil",
    d: "Começa com uma conversa. Compreendemos os teus objetivos, orçamento, preferências de mercado e situação fiscal. Sem compromisso — apenas a base para um serviço personalizado.",
  },
  {
    n: 2,
    t: "Seleção de oportunidades",
    d: "Apresentamos um conjunto curado de imóveis com análise de rentabilidade estimada, localização, estado legal e contexto de mercado.",
  },
  {
    n: 3,
    t: "Due diligence jurídica e fiscal",
    d: "Antes de qualquer compromisso financeiro, analisamos o imóvel, o vendedor, os documentos e as implicações tributárias nos dois países. Zero surpresas depois da compra.",
  },
  {
    n: 4,
    t: "Negociação e contratos",
    d: "Apoiamos a negociação de preço e condições. Os advogados parceiros redigem ou revêm todos os contratos — da promessa à escritura — protegendo os teus interesses.",
  },
  {
    n: 5,
    t: "Escritura e pós-venda",
    d: "Acompanhamos até ao registo definitivo. Se precisares de gestão do imóvel, arrendamento ou declarações fiscais, a nossa rede continua disponível.",
  },
];

const pilares = [
  {
    icon: "link",
    t: "Intermediação imobiliária",
    d: "Ligamos-te aos melhores corretores certificados no país de destino, com base no teu perfil e objetivos de rentabilidade — da seleção de imóveis à assinatura do contrato.",
  },
  {
    icon: "scale",
    t: "Assessoria jurídica",
    d: "Due diligence legal, revisão e elaboração de contratos (CPCV), representação por procuração, Golden Visa e acompanhamento até à escritura e registo.",
  },
  {
    icon: "percent",
    t: "Assessoria fiscal",
    d: "Estruturação fiscal eficiente, apoio com NIF/NHR (Portugal) e CPF/não-residentes (Brasil), tributação de rendimentos e mais-valias, evitando dupla tributação.",
  },
];

export default async function ComoFunciona() {
  const c = await getConteudo("como-funciona");
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Como Funciona</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">O processo</span>
            <h2>Os 5 passos</h2>
          </Reveal>
          <div className="steps">
            {passos.map((p, i) => (
              <Reveal className="step" key={p.n} delay={i * 0.08}>
                <div className="n">{p.n}</div>
                <div>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Os nossos serviços</span>
            <h2>Três pilares, um processo coordenado</h2>
            <p>
              Não somos uma agência tradicional. Coordenamos toda a cadeia — da
              identificação do imóvel à conclusão legal e fiscal do negócio.
            </p>
          </Reveal>
          <div className="grid grid-3">
            {pilares.map((p, i) => (
              <Reveal className="card" key={p.t} delay={i * 0.1}>
                <div className="icon"><Icon name={p.icon} /></div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>Pronto para começar?</h2>
            <p>
              O primeiro passo é só uma conversa. Conta-nos os teus objetivos e
              traçamos o caminho contigo.
            </p>
            <Link href="/contactos" className="btn btn-primary">
              Falar com um especialista
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
