import Link from "next/link";

/**
 * Banner de destaque regional (estilo "sponsor").
 * Liga à página da região, onde se veem as vantagens e os empreendimentos.
 *
 * Props:
 *  - regiao: objeto de lib/regioes.js
 *  - compact: versão mais baixa (para grelhas com vários banners)
 */
export default function RegionBanner({ regiao, compact = false }) {
  return (
    <Link
      href={`/regioes/${regiao.slug}`}
      className={`region-banner${compact ? " compact" : ""}`}
    >
      <img src={regiao.imagem} alt={regiao.nome} loading="lazy" />
      <div className="rb-content">
        <span className="rb-tag">
          Destaque regional · {regiao.pais === "brasil" ? "Brasil" : "Portugal"}
        </span>
        <h3>{regiao.nome}</h3>
        <p>{regiao.tagline}</p>
        <span className="rb-cta">Descobrir as vantagens →</span>
      </div>
    </Link>
  );
}
