"use client";

import { useEffect, useCallback } from "react";

// Popup para ver as fotos em grande, com navegação (setas/teclado) e fecho.
// indice: número da foto aberta (ou null). onMudar: setter (aceita valor ou função).
export default function Lightbox({ imagens = [], nome = "", indice, onMudar }) {
  const total = imagens.length;
  const aberto = indice !== null && indice !== undefined;

  const fechar = useCallback(() => onMudar(null), [onMudar]);
  const prox = useCallback(() => onMudar((i) => (i + 1) % total), [onMudar, total]);
  const ant = useCallback(() => onMudar((i) => (i - 1 + total) % total), [onMudar, total]);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => {
      if (e.key === "Escape") fechar();
      else if (e.key === "ArrowRight") prox();
      else if (e.key === "ArrowLeft") ant();
    };
    window.addEventListener("keydown", onKey);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = anterior;
    };
  }, [aberto, fechar, prox, ant]);

  if (!aberto || !total) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={fechar}>
      <button type="button" className="lb-fechar" onClick={fechar} aria-label="Fechar">
        ×
      </button>
      {total > 1 && (
        <button
          type="button"
          className="lb-nav lb-ant"
          aria-label="Anterior"
          onClick={(e) => {
            e.stopPropagation();
            ant();
          }}
        >
          ‹
        </button>
      )}
      <img
        className="lb-img"
        src={imagens[indice]}
        alt={`${nome} — foto ${indice + 1} de ${total}`}
        onClick={(e) => e.stopPropagation()}
      />
      {total > 1 && (
        <button
          type="button"
          className="lb-nav lb-prox"
          aria-label="Seguinte"
          onClick={(e) => {
            e.stopPropagation();
            prox();
          }}
        >
          ›
        </button>
      )}
      <div className="lb-contador">
        {indice + 1} / {total}
      </div>
    </div>
  );
}
