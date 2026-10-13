import Link from "next/link";

// Card de uma marca representada (lista /marcas) — abre a página da marca.
export default function MarcaCard({ marca: m }) {
  const foto = m.imagens?.[0] || m.produtos?.find((p) => p.imagem)?.imagem || m.logo;
  const n = m.produtos?.length || 0;
  return (
    <Link href={`/marcas/${m.slug}`} className="marca-card">
      <div className="marca-foto">{foto && <img src={foto} alt={m.nome} loading="lazy" />}</div>
      <div className="marca-body">
        {m.origem && <span className="marca-origem">{m.origem}</span>}
        <h3>{m.nome}</h3>
        {m.texto && <p>{m.texto}</p>}
        <span className="pub-cta">
          {n > 0 ? `Ver ${n === 1 ? "o produto" : `os ${n} produtos`} →` : "Conhecer a marca →"}
        </span>
      </div>
    </Link>
  );
}
