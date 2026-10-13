"use client";

// Abre a impressão do browser — permite "Guardar como PDF" a ficha da marca.
export default function BotaoPdf() {
  return (
    <button type="button" className="btn btn-ghost btn-pdf" onClick={() => window.print()}>
      Guardar fichas em PDF
    </button>
  );
}
