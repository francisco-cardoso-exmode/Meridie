import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { getConteudo } from "@/lib/conteudo";
import { t, tf, traduzDoc, traduzLista, alternates } from "@/lib/i18n";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: t(lang, "Contactos"),
    description: t(lang, "Fala com a Meridie Investments sobre o teu investimento imobiliário entre Portugal e o Brasil. Respondemos em 24 horas úteis."),
    alternates: alternates(lang, "/contactos"),
  };
}

export default async function Contactos({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("contactos", lang);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{T("Contactos")}</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="grid grid-2" style={{ gap: 56, alignItems: "start" }}>
            <Reveal>
              <span className="eyebrow">{T("Fala connosco")}</span>
              <h2 style={{ fontSize: "1.8rem", marginBottom: 18 }}>
                {T("Onde nos encontrar")}
              </h2>
              <ul className="value-list" style={{ marginBottom: 28 }}>
                <li>
                  <span className="check"><Icon name="mail" size={20} /></span>
                  <span>
                    <strong>{T("Email")}</strong>
                    <br />
                    {c.email}
                  </span>
                </li>
                <li>
                  <span className="check"><Icon name="phone" size={20} /></span>
                  <span>
                    <strong>{T("Telefone")}</strong>
                    <br />
                    {c.telefone}
                  </span>
                </li>
                <li>
                  <span className="check"><Icon name="pin" size={20} /></span>
                  <span>
                    <strong>{T("Presença")}</strong>
                    <br />
                    {c.presenca}
                  </span>
                </li>
              </ul>
              <p>{T("Horário:")} {c.horario}</p>
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
