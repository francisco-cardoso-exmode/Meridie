import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { getConteudo } from "@/lib/conteudo";
import { t, tf } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";
import { telHref, mailHref, whatsappHref } from "@/lib/contactoLinks";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPagina(lang, "/contactos", {
    titulo: t(lang, "Contactos"),
    descricao: t(lang, "Fala com a Meridie Investments sobre o teu investimento imobiliário entre Portugal e o Brasil. Respondemos em 24 horas úteis."),
  });
}

export default async function Contactos({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("contactos", lang);
  const mail = mailHref(c.email);
  const tel = telHref(c.telefone);
  const wa = whatsappHref(c.telefone);
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
                {c.email && (
                  <li>
                    <span className="check"><Icon name="mail" size={20} /></span>
                    <span>
                      <strong>{T("Email")}</strong>
                      <br />
                      {mail ? <a href={mail}>{c.email}</a> : c.email}
                    </span>
                  </li>
                )}
                {c.telefone && (
                  <li>
                    <span className="check"><Icon name="phone" size={20} /></span>
                    <span>
                      <strong>{T("Telefone")}</strong>
                      <br />
                      {tel ? <a href={tel}>{c.telefone}</a> : c.telefone}
                      {wa && (
                        <>
                          {" · "}
                          <a href={wa} target="_blank" rel="noopener">WhatsApp</a>
                        </>
                      )}
                    </span>
                  </li>
                )}
                {c.presenca && (
                  <li>
                    <span className="check"><Icon name="pin" size={20} /></span>
                    <span>
                      <strong>{T("Presença")}</strong>
                      <br />
                      {c.presenca}
                    </span>
                  </li>
                )}
              </ul>
              {c.horario && <p>{T("Horário:")} {c.horario}</p>}
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
