"use client";

import { useCompare } from "@/components/compare/CompareProvider";
import { paisKey } from "@/lib/compare";
import { useT } from "@/components/LangProvider";

// Botão "Comparar" sobreposto ao card. Fica fora do link do card (HTML válido)
// e acima do ::after que torna o card clicável.
export default function CompareToggle({ e }) {
  const { toggle, estaSelecionado } = useCompare();
  const { t, tf } = useT();
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
      aria-label={
        ativo
          ? tf("Remover {nome} da comparação", { nome: e.nome })
          : tf("Comparar {nome}", { nome: e.nome })
      }
      title={ativo ? t("Remover da comparação") : t("Comparar este empreendimento")}
      onClick={() => toggle(item)}
    >
      <span aria-hidden="true">{ativo ? "✓" : "="}</span>
    </button>
  );
}
