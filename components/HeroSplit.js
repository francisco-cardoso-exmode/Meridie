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
 * Os textos vêm da página Home do backoffice (`c` = getConteudo("home")).
 */
export default function HeroSplit({ c }) {
  const { t } = useT();
  const slogan = c.heroSlogan;
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
          alt={t("Porto, Portugal")}
          fill
          sizes="(max-width: 860px) 100vw, 75vw"
          priority
        />
        <div className="sp-content">
          <span className="flag"><Icon name="pin" size={24} /></span>
          <h2>{c.hsPtTitulo}</h2>
          <p className="sp-teaser">{c.hsPtTeaser}</p>
          <div className="sp-more">
            <p>{c.hsPtTexto}</p>
          </div>
          {/* O botão vê-se sempre (no toque não há "passar o rato"). */}
          <span className="btn btn-primary sp-cta">{c.hsPtCta}</span>
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
          <h2>{c.hsBrTitulo}</h2>
          <p className="sp-teaser">{c.hsBrTeaser}</p>
          <div className="sp-more">
            <p>{c.hsBrTexto}</p>
          </div>
          {/* O botão vê-se sempre (no toque não há "passar o rato"). */}
          <span className="btn btn-primary sp-cta">{c.hsBrCta}</span>
        </div>
      </L>
    </section>
  );
}
