"use client";

import { useT } from "@/components/LangProvider";
// Abre a impressão do browser — permite "Guardar como PDF" a ficha da marca.
export default function BotaoPdf() {
  const { t, tf } = useT();
  return (
    <button type="button" className="btn btn-ghost btn-pdf" onClick={() => window.print()}>
      {t("Guardar fichas em PDF")}
    </button>
  );
}
