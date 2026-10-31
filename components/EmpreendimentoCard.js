"use client";

import L from "@/components/L";
import Icon from "@/components/Icon";
import PrecoDual from "@/components/PrecoDual";
import { referenciaDe } from "@/lib/empreendimentos";
import CompareToggle from "@/components/compare/CompareToggle";
import { useT } from "@/components/LangProvider";
import Foto from "@/components/Foto";

export default function EmpreendimentoCard({ e }) {
  const { t } = useT();
  // O card inteiro é clicável através do link do título (::after estica-o por
  // cima do card) — assim o botão "Comparar" não fica dentro do <a>.
  return (
    <article className="prop-card">
      <div className="prop-media">
        {e.imagens?.[0] && (
          <Foto src={e.imagens[0]} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 400px" />
        )}
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
        <h3>
          <L href={`/empreendimentos/${e.slug}`} className="prop-card-link">
            {e.nome}
          </L>
        </h3>
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
          <span className="badge navy" aria-hidden="true">{t("Ver")}</span>
        </div>
      </div>
    </article>
  );
}
