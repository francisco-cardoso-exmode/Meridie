import Link from "next/link";
import Reveal from "@/components/Reveal";
import Accordion from "@/components/Accordion";

export const metadata = {
  title: "Perguntas Frequentes",
  description:
    "Respostas às dúvidas mais comuns sobre investir em imóveis entre Portugal e o Brasil — processo, fiscalidade, custos e honorários.",
};

const categorias = [
  {
    cat: "Geral",
    itens: [
      {
        q: "O que faz exatamente a Meridie Investments?",
        a: "Somos uma plataforma de intermediação de investimento imobiliário entre Portugal e o Brasil. Conectamos investidores a corretores certificados e providenciamos assessoria jurídica e fiscal integrada nos dois países. Não vendemos imóveis diretamente — gerimos o processo e os profissionais certos para cada caso.",
      },
      {
        q: "Trabalham com qualquer tipo de imóvel?",
        a: "Principalmente imóveis residenciais e de rendimento (apartamentos, moradias, propriedades turísticas). Para projetos comerciais ou de grande escala, contacta-nos para avaliar caso a caso.",
      },
      {
        q: "É necessário estar presente no país onde se compra?",
        a: "Não necessariamente. Através de procuração conferida a um advogado local, podes concluir todo o processo sem deslocação. Muitos clientes fazem visitas por videoconferência e assinam por representação.",
      },
    ],
  },
  {
    cat: "Fiscalidade",
    itens: [
      {
        q: "Que impostos pago ao comprar um imóvel em Portugal?",
        a: "Os principais são o IMT (Imposto Municipal sobre Transmissões), o Imposto de Selo (0,8% sobre o valor de compra) e os custos notariais e de registo. A nossa equipa fiscal detalha o custo total antes de avançares.",
      },
      {
        q: "E ao comprar no Brasil?",
        a: "O principal imposto na transmissão é o ITBI (tipicamente entre 2% e 3% do valor venal, varia por município). Existem ainda custos de cartório, registo e, em certos casos, ITCMD para transmissões por herança ou doação.",
      },
      {
        q: "Vou pagar imposto nos dois países?",
        a: "Depende da tua residência fiscal e da Convenção para Evitar a Dupla Tributação entre Portugal e o Brasil — que existe. A nossa equipa analisa a tua situação e estrutura o investimento para evitar dupla tributação sempre que legalmente possível.",
      },
    ],
  },
  {
    cat: "Processo e Custos",
    itens: [
      {
        q: "Quanto tempo demora o processo de compra?",
        a: "Em Portugal, da promessa à escritura demora tipicamente 4 a 8 semanas. No Brasil, pode variar entre 4 semanas e 3 meses, dependendo do cartório e da documentação. Damos-te uma estimativa realista no início.",
      },
      {
        q: "Quais são os vossos honorários?",
        a: "O modelo combina um fee de intermediação sobre o negócio e honorários dos serviços jurídico e fiscal prestados. Para investidores particulares há pacotes com fee fixo; para premium, estruturamos de forma personalizada. Tudo é apresentado de forma clara antes de qualquer compromisso.",
      },
      {
        q: "Posso contratar apenas um dos serviços?",
        a: "Sim, os serviços são modulares. Podes contratar apenas a intermediação, apenas a assessoria jurídica para um negócio que já encontraste, ou o pacote completo. Recomendamos o processo integrado para maior segurança, mas a decisão é tua.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">FAQ</span>
          <h1>Perguntas frequentes</h1>
          <p>
            As dúvidas mais comuns sobre investir em imóveis entre Portugal e o
            Brasil. Não encontras a tua resposta? Fala connosco.
          </p>
        </div>
      </section>

      <section>
        <div className="container" style={{ maxWidth: 820 }}>
          {categorias.map((c) => (
            <Reveal key={c.cat}>
              <div className="faq-cat">{c.cat}</div>
              <Accordion itens={c.itens} />
            </Reveal>
          ))}

          <div className="cta-band" style={{ marginTop: 56 }}>
            <h2>Ainda tens dúvidas?</h2>
            <p>A nossa equipa responde a todas as mensagens em 24 horas úteis.</p>
            <Link href="/contactos" className="btn btn-primary">
              Falar connosco
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
