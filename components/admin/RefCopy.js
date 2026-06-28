"use client";

import { useState } from "react";

// Mostra a referência e copia para a área de transferência ao clicar.
export default function RefCopy({ valor }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      className="ref-copy"
      title="Copiar referência"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard?.writeText(valor);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1500);
      }}
    >
      {copiado ? "✓ copiado" : `Ref. ${valor}`}
    </button>
  );
}
