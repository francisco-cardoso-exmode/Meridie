"use client";

import L from "@/components/L";
import Icon from "@/components/Icon";
import PrecoDual from "@/components/PrecoDual";
import { referenciaDe } from "@/lib/empreendimentos";
import CompareToggle from "@/components/compare/CompareToggle";
import { useT } from "@/components/LangProvider";

export default function EmpreendimentoCard({ e }) {
  const { t } = useT();
  return (
    <L href={`/empreendimentos/${e.slug}`} className="prop-card">
      <div className="prop-media">
        <img src={e.imagens?.[0] || ""} alt={e.nome} loading="lazy" />
        <div className="prop-badges">
          <span className="badge gold">{t(e.tipo)}</span>
          <span className="badge">{t(e.estado)}</span>
        </div>
        <CompareToggle e={e} />
      </div>
      <div className="prop-body">
        <div className="prop-loc">
          {e.cidade} · {e.zona}
          <span className="prop-ref">{t("Ref.")} {referenciaDe(e)}</span>
        </div>
        <h3>{e.nome}</h3>
        <p className="prop-resumo">{e.resumo}</p>
        <div className="prop-specs">
          {Number(e.quartos) > 0 && (
            <span><Icon name="bed" size={16} /> {e.quartos} {Number(e.quartos) === 1 ? t("quarto") : t("quartos")}</span>
          )}
          {Number(e.casasBanho) > 0 && <span><Icon name="bath" size={16} /> {e.casasBanho}</span>}
          {Number(e.area) > 0 && <span><Icon name="ruler" size={16} /> {e.area} m²</span>}
        </div>
        <div className="prop-foot">
          <div className="prop-price">
            <PrecoDual preco={e.preco} moeda={e.moeda} tipo={e.precoTipo} max={e.precoMax} />
            <small>{t(e.finalidade)}</small>
          </div>
          <span className="badge navy">{t("Ver")}</span>
        </div>
      </div>
    </L>
  );
}
