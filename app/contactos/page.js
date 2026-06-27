import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";

export const metadata = {
  title: "Contactos",
  description:
    "Fala com a Meridie Investments sobre o teu investimento imobiliário entre Portugal e o Brasil. Respondemos em 24 horas úteis.",
};

export default function Contactos() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Contactos</span>
          <h1>Vamos construir o teu próximo passo.</h1>
          <p>
            Conta-nos os teus objetivos de investimento. Respondemos a todas as
            mensagens em 24 horas úteis.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="grid grid-2" style={{ gap: 56, alignItems: "start" }}>
            <Reveal>
              <span className="eyebrow">Fala connosco</span>
              <h2 style={{ fontSize: "1.8rem", marginBottom: 18 }}>
                Onde nos encontrar
              </h2>
              <ul className="value-list" style={{ marginBottom: 28 }}>
                <li>
                  <span className="check"><Icon name="mail" size={20} /></span>
                  <span>
                    <strong>Email</strong>
                    <br />
                    geral@meridie.pt
                  </span>
                </li>
                <li>
                  <span className="check"><Icon name="phone" size={20} /></span>
                  <span>
                    <strong>Telefone</strong>
                    <br />
                    +351 210 000 000
                  </span>
                </li>
                <li>
                  <span className="check"><Icon name="pin" size={20} /></span>
                  <span>
                    <strong>Presença</strong>
                    <br />
                    Lisboa, Portugal · São Paulo, Brasil
                  </span>
                </li>
              </ul>
              <p>Horário: Segunda a sexta, das 9h às 18h (WET / BRT).</p>
            </Reveal>

            <Reveal delay={0.1}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
