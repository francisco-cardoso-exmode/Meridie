import Link from "next/link";
import Icon from "@/components/Icon";

/**
 * Hero principal — ecrã dividido Portugal / Brasil em 100vh.
 * Os dois painéis começam ao meio; ao passar o rato por cima de um, esse
 * painel estica e revela o texto completo + CTA, enquanto o outro encolhe.
 * Interação 100% CSS (ver .hero-split em globals.css). Em mobile empilha.
 */
export default function HeroSplit() {
  return (
    <section className="hero-split" aria-label="Escolhe o teu mercado">
      <div className="hs-overlay-center">
        <span className="hs-brand">
          Capital sem fronteiras. Investimento com precisão.
        </span>
      </div>

      <Link href="/portugal" className="split-panel panel-pt">
        <img
          src="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1500&q=72"
          alt="Lisboa, Portugal"
        />
        <div className="sp-content">
          <span className="flag"><Icon name="pin" size={24} /></span>
          <h2>Portugal</h2>
          <p className="sp-teaser">Segurança jurídica europeia.</p>
          <div className="sp-more">
            <p>
              Valorização consistente, residência no espaço Schengen e proteção
              patrimonial em Euro. Lisboa, Porto e Algarve.
            </p>
            <span className="btn btn-primary">Explorar Portugal →</span>
          </div>
        </div>
      </Link>

      <Link href="/brasil" className="split-panel panel-br">
        <img
          src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1500&q=72"
          alt="Rio de Janeiro, Brasil"
        />
        <div className="sp-content">
          <span className="flag"><Icon name="pin" size={24} /></span>
          <h2>Brasil</h2>
          <p className="sp-teaser">Yields acima da média europeia.</p>
          <div className="sp-more">
            <p>
              Mercado em expansão e preços competitivos, do litoral às grandes
              metrópoles. São Paulo, Rio, Nordeste e Sul.
            </p>
            <span className="btn btn-primary">Explorar Brasil →</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
