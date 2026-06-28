import Link from "next/link";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import { getRedes, getEmpresa } from "@/lib/config";

export default async function Footer() {
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
            <Logo size={44} variant="stacked" />
            <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 340, marginTop: 18 }}>
              Plataforma de investimento imobiliário entre Portugal e o Brasil.
              Intermediação, assessoria jurídica e fiscal num único processo
              coordenado.
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
            <h4>Mercados</h4>
            <ul>
              <li>
                <Link href="/portugal">Investir em Portugal</Link>
              </li>
              <li>
                <Link href="/brasil">Investir no Brasil</Link>
              </li>
              <li>
                <Link href="/como-funciona">Como Funciona</Link>
              </li>
              <li>
                <Link href="/faq">Perguntas frequentes</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Empresa</h4>
            <ul>
              <li>
                <Link href="/quem-somos">Quem Somos</Link>
              </li>
              <li>
                <Link href="/parcerias">Parcerias</Link>
              </li>
              <li>
                <Link href="/publicidade">Parceiros</Link>
              </li>
              <li>
                <Link href="/contactos">Contactos</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contactos</h4>
            <ul>
              <li>{email}</li>
              <li>{telefone}</li>
              <li>{locais}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {ano} Meridie Investments. Todos os direitos reservados.</span>
          <span className="footer-legal">
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/termos">Termos</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
