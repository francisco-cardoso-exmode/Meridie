import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { getConteudo } from "@/lib/conteudo";

export const revalidate = 60;

export const metadata = {
  title: "Contactos",
  description:
    "Fala com a Meridie Investments sobre o teu investimento imobiliário entre Portugal e o Brasil. Respondemos em 24 horas úteis.",
};

export default async function Contactos() {
  const c = await getConteudo("contactos");
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Contactos</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
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
                    {c.email}
                  </span>
                </li>
                <li>
                  <span className="check"><Icon name="phone" size={20} /></span>
                  <span>
                    <strong>Telefone</strong>
                    <br />
                    {c.telefone}
                  </span>
                </li>
                <li>
                  <span className="check"><Icon name="pin" size={20} /></span>
                  <span>
                    <strong>Presença</strong>
                    <br />
                    {c.presenca}
                  </span>
                </li>
              </ul>
              <p>Horário: {c.horario}</p>
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
