import Link from "next/link";
import Icon from "@/components/Icon";
import PrecoDual from "@/components/PrecoDual";
import { referenciaDe } from "@/lib/empreendimentos";
import CompareToggle from "@/components/compare/CompareToggle";

export default function EmpreendimentoCard({ e }) {
  return (
    <Link href={`/empreendimentos/${e.slug}`} className="prop-card">
      <div className="prop-media">
        <img src={e.imagens?.[0] || ""} alt={e.nome} loading="lazy" />
        <div className="prop-badges">
          <span className="badge gold">{e.tipo}</span>
          <span className="badge">{e.estado}</span>
        </div>
        <CompareToggle e={e} />
      </div>
      <div className="prop-body">
        <div className="prop-loc">
          {e.cidade} · {e.zona}
          <span className="prop-ref">Ref. {referenciaDe(e)}</span>
        </div>
        <h3>{e.nome}</h3>
        <p className="prop-resumo">{e.resumo}</p>
        <div className="prop-specs">
          <span><Icon name="bed" size={16} /> {e.quartos} {e.quartos === 1 ? "quarto" : "quartos"}</span>
          <span><Icon name="bath" size={16} /> {e.casasBanho}</span>
          <span><Icon name="ruler" size={16} /> {e.area} m²</span>
        </div>
        <div className="prop-foot">
          <div className="prop-price">
            <PrecoDual preco={e.preco} moeda={e.moeda} tipo={e.precoTipo} />
            <small>{e.finalidade}</small>
          </div>
          <span className="badge navy">Ver →</span>
        </div>
      </div>
    </Link>
  );
}
