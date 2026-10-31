"use client";

/**
 * Banner hero a toda a altura (100svh) com imagem de fundo e texto sobreposto.
 * Usado no topo das páginas de mercado (Portugal / Brasil).
 */
import { useT } from "@/components/LangProvider";
import Foto from "@/components/Foto";

export default function MarketHero({ img, alt, eyebrow, titulo, children }) {
  const { t } = useT();
  return (
    <section className="market-hero" aria-label={titulo}>
      {img && <Foto src={img} alt={alt} fill sizes="100vw" priority />}
      <div className="container">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{titulo}</h1>
        {children && <p>{children}</p>}
        <span className="scroll-cue" aria-hidden="true">
          {t("Ver empreendimentos ↓")}
        </span>
      </div>
    </section>
  );
}
