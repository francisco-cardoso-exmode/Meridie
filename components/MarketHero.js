/**
 * Banner hero de 100vh com imagem de fundo e texto sobreposto.
 * Usado no topo das páginas de mercado (Portugal / Brasil).
 */
export default function MarketHero({ img, alt, eyebrow, titulo, children }) {
  return (
    <section className="market-hero" aria-label={titulo}>
      <img src={img} alt={alt} />
      <div className="container">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{titulo}</h1>
        {children && <p>{children}</p>}
        <span className="scroll-cue" aria-hidden="true">
          Ver empreendimentos ↓
        </span>
      </div>
    </section>
  );
}
