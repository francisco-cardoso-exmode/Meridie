import L from "@/components/L";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import { getRedes, getEmpresa } from "@/lib/config";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { t } from "@/lib/i18n";

export default async function Footer({ lang = "pt" }) {
  const T = (x) => t(lang, x);
  const ano = new Date().getFullYear();
  const [redes, empresa] = await Promise.all([getRedes(), getEmpresa()]);
  const email = empresa.email || "geral@meridie.pt";
  const telefone = empresa.telefone || "+351 210 000 000";
  const locais = empresa.locais || "Lisboa · São Paulo";
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
                <L href="/marcas">{T("Bebidas & Alimentação")}</L>
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
              <li>{email}</li>
              <li>{telefone}</li>
              <li>{locais}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {ano} Meridie Investments. {T("Todos os direitos reservados.")}</span>
          <span className="footer-legal">
            <L href="/privacidade">{T("Privacidade")}</L>
            <L href="/cookies">{T("Cookies")}</L>
            <L href="/termos">{T("Termos")}</L>
          </span>
        </div>
      </div>
    </footer>
  );
}
