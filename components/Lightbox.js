"use client";

import { useEffect, useCallback, useRef } from "react";
import { useT } from "@/components/LangProvider";

// Popup para ver as fotos em grande, com navegação (setas/teclado) e fecho.
// Acessível: o foco vai para o botão de fechar ao abrir, fica preso dentro do
// diálogo (Tab / Shift+Tab) e volta ao elemento que o abriu ao fechar.
// indice: número da foto aberta (ou null). onMudar: setter (aceita valor ou função).
export default function Lightbox({ imagens = [], nome = "", indice, onMudar }) {
  const { t, tf } = useT();
  const total = imagens.length;
  const aberto = indice !== null && indice !== undefined;

  const fechar = useCallback(() => onMudar(null), [onMudar]);
  const prox = useCallback(() => onMudar((i) => (i + 1) % total), [onMudar, total]);
  const ant = useCallback(() => onMudar((i) => (i - 1 + total) % total), [onMudar, total]);
  const dialogoRef = useRef(null);
  const fecharRef = useRef(null);

  // Foco: guarda quem abriu, foca o "fechar" e devolve o foco no fim.
  useEffect(() => {
    if (!aberto) return;
    const origem = document.activeElement;
    fecharRef.current?.focus();
    return () => {
      if (origem && typeof origem.focus === "function" && document.contains(origem)) origem.focus();
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => {
      if (e.key === "Escape") fechar();
      else if (e.key === "ArrowRight") prox();
      else if (e.key === "ArrowLeft") ant();
      else if (e.key === "Tab" && dialogoRef.current) {
        // Mantém o foco dentro do diálogo.
        const focaveis = [...dialogoRef.current.querySelectorAll("button")];
        if (!focaveis.length) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        const dentro = dialogoRef.current.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === primeiro || !dentro)) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && (document.activeElement === ultimo || !dentro)) {
          e.preventDefault();
          primeiro.focus();
        }
      }
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
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={nome ? tf("Fotos de {nome}", { nome }) : t("Galeria de fotos")}
      ref={dialogoRef}
      onClick={fechar}
    >
      <button type="button" className="lb-fechar" onClick={fechar} aria-label={t("Fechar")} ref={fecharRef}>
        ×
      </button>
      {total > 1 && (
        <button
          type="button"
          className="lb-nav lb-ant"
          aria-label={t("Anterior")}
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
        alt={tf("{nome} — foto {i} de {n}", { nome, i: indice + 1, n: total })}
        onClick={(e) => e.stopPropagation()}
      />
      {total > 1 && (
        <button
          type="button"
          className="lb-nav lb-prox"
          aria-label={t("Seguinte")}
          onClick={(e) => {
            e.stopPropagation();
            prox();
          }}
        >
          ›
        </button>
      )}
      <div className="lb-contador" aria-live="polite">
        {indice + 1} / {total}
      </div>
    </div>
  );
}
