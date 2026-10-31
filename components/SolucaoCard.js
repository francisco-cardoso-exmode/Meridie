"use client";

import L from "@/components/L";
import Foto from "@/components/Foto";
import { useT } from "@/components/LangProvider";
import { hrefSolucao, TIPOS_SOLUCAO } from "@/lib/catalogo";

// Cartão de uma solução tecnológica (página Tecnologia).
export default function SolucaoCard({ s }) {
  const { t } = useT();
  return (
    <L href={hrefSolucao(s.slug)} className="marca-card sol-card">
      <div className="sol-foto">
        {s.imagens?.[0] && <Foto src={s.imagens[0]} alt={s.nome} fill sizes="(max-width: 700px) 100vw, 380px" />}
        <span className={`sol-tipo ${s.tipo}`}>{t(TIPOS_SOLUCAO[s.tipo] || "")}</span>
      </div>
      <div className="marca-body">
        {s.parceiro && <span className="marca-origem">{s.parceiro}</span>}
        <h3>{s.nome}</h3>
        {s.tagline && <p>{s.tagline}</p>}
        <span className="pub-cta">{t("Conhecer a solução →")}</span>
      </div>
    </L>
  );
}
