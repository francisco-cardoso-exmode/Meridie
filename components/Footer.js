import Link from "next/link";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import { getRedes } from "@/lib/config";

export default async function Footer() {
  const ano = new Date().getFullYear();
  const redes = await getRedes();
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
                <Link href="/contactos">Contactos</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contactos</h4>
            <ul>
              <li>geral@meridie.pt</li>
              <li>+351 210 000 000</li>
              <li>Lisboa · São Paulo</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {ano} Meridie Investments. Todos os direitos reservados.</span>
          <span>Portugal · Brasil</span>
        </div>
      </div>
    </footer>
  );
}
