"use client";

import L from "@/components/L";
import { useT } from "@/components/LangProvider";
import Foto from "@/components/Foto";

/**
 * Banner de destaque regional (estilo "sponsor").
 * Liga à página da região, onde se veem as vantagens e os empreendimentos.
 *
 * Props:
 *  - regiao: objeto de lib/regioes.js
 *  - compact: versão mais baixa (para grelhas com vários banners)
 */
export default function RegionBanner({ regiao, compact = false }) {
  const { t } = useT();
  return (
    <L
      href={`/regioes/${regiao.slug}`}
      className={`region-banner${compact ? " compact" : ""}`}
    >
      {regiao.imagem && (
        <Foto src={regiao.imagem} alt={regiao.nome} fill sizes={compact ? "(max-width: 860px) 100vw, 50vw" : "(max-width: 1240px) 100vw, 1200px"} />
      )}
      <div className="rb-content">
        <span className="rb-tag">
          {t("Destaque regional")} · {regiao.pais === "brasil" ? t("Brasil") : "Portugal"}
        </span>
        <h3>{regiao.nome}</h3>
        <p>{regiao.tagline}</p>
        <span className="rb-cta">{t("Descobrir as vantagens →")}</span>
      </div>
    </L>
  );
}
