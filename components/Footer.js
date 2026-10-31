import L from "@/components/L";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import { getRedes, getEmpresa } from "@/lib/config";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { t } from "@/lib/i18n";
import GerirCookies from "@/components/GerirCookies";
import { telHref, mailHref, whatsappHref } from "@/lib/contactoLinks";

export default async function Footer({ lang = "pt" }) {
  const T = (x) => t(lang, x);
  const ano = new Date().getFullYear();
  const [redes, empresa] = await Promise.all([getRedes(), getEmpresa()]);
  // Só mostra os contactos preenchidos no backoffice (nada de placeholders).
  const email = empresa.email || "";
  const telefone = empresa.telefone || "";
  const locais = empresa.locais || "Lisboa · São Paulo";
  const mail = mailHref(email);
  const tel = telHref(telefone);
  const wa = whatsappHref(telefone);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo size={44} />
            <div className="footer-marca">
              <p className="footer-marca-nome">Meridie Investments</p>
              <p className="footer-marca-slogan">
                {T("Capital sem fronteiras. Investimento com precisão.")}
              </p>
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 340, marginTop: 18 }}>
              {TECNOLOGIA_VISIVEL
                ? T("Investimento imobiliário entre Portugal e o Brasil, representação de bebidas e alimentação, e tecnologia — com o mesmo rigor e acompanhamento em cada área.")
                : T("Investimento imobiliário entre Portugal e o Brasil e representação de bebidas e alimentação — com o mesmo rigor e acompanhamento em cada área.")}
            </p>
            {(redes.instagram || redes.linkedin) && (
              <div className="footer-social">
                {redes.instagram && (
                  <a href={redes.instagram} target="_blank" rel="noopener" aria-label="Instagram">
                    <Icon name="instagram" size={20} />
                  </a>
                )}
                {redes.linkedin && (
                  <a href={redes.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">
                    <Icon name="linkedin" size={20} />
                  </a>
                )}
              </div>
            )}
          </div>
          <div>
            <h4>{T("Áreas")}</h4>
            <ul>
              <li>
                <L href="/portugal">{T("Investir em Portugal")}</L>
              </li>
              <li>
                <L href="/brasil">{T("Investir no Brasil")}</L>
              </li>
              <li>
                <L href="/representacoes">{T("Representações comerciais")}</L>
              </li>
              {TECNOLOGIA_VISIVEL && (
                <li>
                  <L href="/tecnologia">{T("Tecnologia")}</L>
                </li>
              )}
              <li>
                <L href="/como-funciona">{T("Como Funciona")}</L>
              </li>
              <li>
                <L href="/faq">{T("Perguntas frequentes")}</L>
              </li>
              <li>
                <L href="/alojamento">{T("Alojamento local")}</L>
              </li>
              <li>
                <L href="/inscreve-a-tua-casa">{T("Inscreve a tua casa")}</L>
              </li>
            </ul>
          </div>
          <div>
            <h4>{T("Empresa")}</h4>
            <ul>
              <li>
                <L href="/quem-somos">{T("Quem Somos")}</L>
              </li>
              <li>
                <L href="/parcerias">{T("Parcerias")}</L>
              </li>
              <li>
                <L href="/publicidade">{T("Parceiros")}</L>
              </li>
              <li>
                <L href="/contactos">{T("Contactos")}</L>
              </li>
            </ul>
          </div>
          <div>
            <h4>{T("Contactos")}</h4>
            <ul>
              {email && <li>{mail ? <a href={mail}>{email}</a> : email}</li>}
              {telefone && <li>{tel ? <a href={tel}>{telefone}</a> : telefone}</li>}
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener">WhatsApp</a>
                </li>
              )}
              {locais && <li>{locais}</li>}
              <li>
                <L href="/contactos">{T("Formulário de contacto")}</L>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {ano} Meridie Investments. {T("Todos os direitos reservados.")}</span>
          <span className="footer-legal">
            <L href="/privacidade">{T("Privacidade")}</L>
            <L href="/cookies">{T("Cookies")}</L>
            <L href="/termos">{T("Termos")}</L>
            <GerirCookies className="footer-gerir-cookies" />
          </span>
        </div>
      </div>
    </footer>
  );
}
