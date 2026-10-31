"use client";

import L from "@/components/L";
import { useT } from "@/components/LangProvider";
import Foto from "@/components/Foto";
import { hrefMarca } from "@/lib/catalogo";

// Card de uma marca representada (lista /representacoes/marcas) — abre a página da marca.
export default function MarcaCard({ marca: m }) {
  const { t, tf } = useT();
  const foto = m.produtos?.find((p) => p.imagem)?.imagem || m.imagens?.[0] || m.logo;
  const n = m.produtos?.length || 0;
  return (
    <L href={hrefMarca(m.slug)} className="marca-card">
      <div className="marca-foto">{foto && <Foto src={foto} alt={m.nome} width={600} height={600} sizes="(max-width: 700px) 100vw, 400px" />}</div>
      <div className="marca-body">
        {m.origem && <span className="marca-origem">{m.origem}</span>}
        <h3>{m.nome}</h3>
        {m.texto && <p>{m.texto}</p>}
        <span className="pub-cta">
          {n > 1 ? tf("Ver os {n} produtos →", { n }) : n === 1 ? t("Ver o produto →") : t("Conhecer a marca →")}
        </span>
      </div>
    </L>
  );
}
