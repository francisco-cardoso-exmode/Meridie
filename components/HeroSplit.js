"use client";

import L from "@/components/L";
import Icon from "@/components/Icon";
import { useT } from "@/components/LangProvider";
import Foto from "@/components/Foto";

/**
 * Hero principal — ecrã dividido Portugal / Brasil a toda a altura (100svh).
 * Os dois painéis começam ao meio; ao passar o rato por cima de um, esse
 * painel estica e revela o texto completo + CTA, enquanto o outro encolhe.
 * Interação 100% CSS (ver .hero-split em globals.css). Em mobile empilha.
 */
export default function HeroSplit({
  slogan = "Capital sem fronteiras. Investimento com precisão.",
}) {
  const { t } = useT();
  return (
    <section className="hero-split" aria-label={t("Escolhe o teu mercado")}>
      <div className="hs-overlay-center">
        {/* Título principal da Home: a marca (só para leitores de ecrã e
            motores de busca) + a proposta de valor visível. */}
        <h1 className="hs-brand">
          <span className="sr-only">Meridie Investments — </span>
          {slogan}
        </h1>
      </div>

      <L href="/portugal" className="split-panel panel-pt">
        <Foto
          src="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1500&q=72"
          alt={t("Lisboa, Portugal")}
          fill
          sizes="(max-width: 860px) 100vw, 75vw"
          priority
        />
        <div className="sp-content">
          <span className="flag"><Icon name="pin" size={24} /></span>
          <h2>Portugal</h2>
          <p className="sp-teaser">{t("Segurança jurídica europeia.")}</p>
          <div className="sp-more">
            <p>
              {t("Valorização consistente, residência no espaço Schengen e proteção patrimonial em Euro. Lisboa, Porto e Algarve.")}
            </p>
            <span className="btn btn-primary">{t("Explorar Portugal →")}</span>
          </div>
        </div>
      </L>

      <L href="/brasil" className="split-panel panel-br">
        <Foto
          src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1500&q=72"
          alt={t("Rio de Janeiro, Brasil")}
          fill
          sizes="(max-width: 860px) 100vw, 75vw"
          priority
        />
        <div className="sp-content">
          <span className="flag"><Icon name="pin" size={24} /></span>
          <h2>{t("Brasil")}</h2>
          <p className="sp-teaser">{t("Yields acima da média europeia.")}</p>
          <div className="sp-more">
            <p>
              {t("Mercado em expansão e preços competitivos, do litoral às grandes metrópoles. São Paulo, Rio, Nordeste e Sul.")}
            </p>
            <span className="btn btn-primary">{t("Explorar Brasil →")}</span>
          </div>
        </div>
      </L>
    </section>
  );
}
