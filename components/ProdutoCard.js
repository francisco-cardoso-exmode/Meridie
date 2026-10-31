"use client";

import L from "@/components/L";
import Foto from "@/components/Foto";
import PrecoProduto from "@/components/PrecoProduto";
import { useT } from "@/components/LangProvider";
import { hrefProduto } from "@/lib/catalogo";

// Cartão de um produto (catálogo, página da marca, relacionados).
// `p`: cartaoProduto(...) + `marcaNome`.
export default function ProdutoCard({ p }) {
  const { t } = useT();
  return (
    <L href={hrefProduto(p)} className="marca-card produto-card rep-produto-card">
      <div className="marca-foto">
        {p.imagem && <Foto src={p.imagem} alt={p.nome} width={480} height={480} sizes="(max-width: 700px) 100vw, 300px" />}
        {!p.disponivel && <span className="rep-indisponivel">{t("Indisponível")}</span>}
      </div>
      <div className="marca-body">
        {p.marcaNome && <span className="marca-origem">{p.marcaNome}</span>}
        <h3>{p.nome}</h3>
        {p.resumo && <p>{p.resumo}</p>}
        <PrecoProduto p={p} />
      </div>
    </L>
  );
}
