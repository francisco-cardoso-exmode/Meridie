import L from "@/components/L";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { t, tf, traduzDoc, traduzLista, alternates } from "@/lib/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: t(lang, "Parcerias"),
    description: t(lang, "A rede Meridie reúne corretores certificados, advogados e contabilistas verificados em Portugal e no Brasil. Conheça os nossos parceiros ou candidate-se a integrar a rede."),
    alternates: alternates(lang, "/parcerias"),
  };
}

const rede = [
  {
    icon: "briefcase",
    t: "Corretores certificados",
    d: "Profissionais com licença e historial comprovado no mercado local — selecionam e apresentam imóveis alinhados com o perfil do investidor.",
  },
  {
    icon: "scale",
    t: "Advogados",
    d: "Especialistas em direito imobiliário e em negócios transfronteiriços, responsáveis pela due diligence, contratos e registo de propriedade.",
  },
  {
    icon: "calculator",
    t: "Contabilistas",
    d: "Peritos em tributação internacional que estruturam o investimento de forma eficiente nos dois sistemas fiscais.",
  },
  {
    icon: "key",
    t: "Gestão local",
    d: "Parceiros de gestão de imóveis e arrendamento que garantem rendimento e manutenção mesmo à distância.",
  },
];

export default async function Parcerias({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{T("Parcerias")}</span>
          <h1>{T("Uma rede verificada nos dois países.")}</h1>
          <p>
            {T("Cada parceiro da Meridie passa por um processo de seleção rigoroso. Trabalhamos apenas com profissionais de credenciais verificadas e historial comprovado — em Portugal e no Brasil.")}
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{T("A rede")}</span>
            <h2>{T("Quem trabalha por ti")}</h2>
          </Reveal>
          <div className="profile-grid">
            {rede.map((p, i) => (
              <Reveal className="profile-card" key={p.t} delay={(i % 2) * 0.1}>
                <div className="pico"><Icon name={p.icon} /></div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", marginBottom: 6 }}>{T(p.t)}</h3>
                  <p>{T(p.d)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "center", gap: 48 }}>
            <Reveal>
              <span className="eyebrow">{T("Tornar-se parceiro")}</span>
              <h2 style={{ fontSize: "1.9rem", marginBottom: 14 }}>
                {T("És corretor, advogado ou contabilista?")}
              </h2>
              <p style={{ marginBottom: 14 }}>
                {T("Estamos sempre a expandir a rede em Portugal e no Brasil. Se tens credenciais sólidas e queres aceder a um fluxo qualificado de investidores transfronteiriços, fala connosco.")}
              </p>
              <L href="/contactos" className="btn btn-primary">
                {T("Candidatar-me à rede")}
              </L>
            </Reveal>
            <Reveal as="ul" delay={0.1} className="value-list">
              <li>
                <span className="check"><Icon name="check" size={18} /></span>
                <span>{T("Acesso a investidores qualificados nos dois mercados.")}</span>
              </li>
              <li>
                <span className="check"><Icon name="check" size={18} /></span>
                <span>{T("Processo coordenado — foca-te na tua especialidade.")}</span>
              </li>
              <li>
                <span className="check"><Icon name="check" size={18} /></span>
                <span>{T("Relação transparente e de longo prazo.")}</span>
              </li>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
