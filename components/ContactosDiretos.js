import Icon from "@/components/Icon";
import { t } from "@/lib/i18n";
import { telHref, mailHref, whatsappHref } from "@/lib/contactoLinks";

/**
 * Contacto direto (ligar, email, WhatsApp) com os dados da empresa do
 * backoffice. Cada ligação só aparece se o dado existir; sem nenhum, não
 * mostra nada.
 */
export default function ContactosDiretos({ empresa = {}, lang = "pt", mensagem, assunto }) {
  const T = (x) => t(lang, x);
  const tel = telHref(empresa.telefone);
  const mail = mailHref(empresa.email, assunto);
  const wa = whatsappHref(empresa.telefone, mensagem);
  if (!tel && !mail && !wa) return null;
  return (
    <div className="contactos-diretos">
      <p className="cd-titulo">{T("Ou fala diretamente connosco")}</p>
      <div className="cd-links">
        {tel && (
          <a href={tel} className="cd-link">
            <Icon name="phone" size={16} /> {T("Ligar")}
          </a>
        )}
        {wa && (
          <a href={wa} className="cd-link" target="_blank" rel="noopener">
            <Icon name="phone" size={16} /> WhatsApp
          </a>
        )}
        {mail && (
          <a href={mail} className="cd-link">
            <Icon name="mail" size={16} /> {T("Email")}
          </a>
        )}
      </div>
    </div>
  );
}
