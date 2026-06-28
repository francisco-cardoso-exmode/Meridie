"use client";

import { useCompare } from "@/components/compare/CompareProvider";
import { paisKey } from "@/lib/compare";

// Botão "Comparar" sobreposto ao card. Como o card é um <Link>, travamos a
// navegação ao clicar no botão.
export default function CompareToggle({ e }) {
  const { toggle, estaSelecionado } = useCompare();
  const ativo = estaSelecionado(e.slug);

  const item = {
    slug: e.slug,
    nome: e.nome,
    zona: e.zona,
    cidade: e.cidade,
    pais: e.pais,
    imagem: e.imagens?.[0] || "",
    zk: paisKey(e),
  };

  return (
    <button
      type="button"
      className={`compare-toggle${ativo ? " is-on" : ""}`}
      aria-pressed={ativo}
      title={ativo ? "Remover da comparação" : "Comparar este empreendimento"}
      onClick={(ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        toggle(item);
      }}
    >
      {ativo ? "✓" : "="}
    </button>
  );
}
