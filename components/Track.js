"use client";

import { useEffect } from "react";

// Envia um evento de tracking para o nosso backend (e para o GA, se existir).
// Fire-and-forget — nunca atrasa nem parte a página.
export function enviarEvento(tipo, valor) {
  try {
    const body = JSON.stringify({ tipo, valor });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([body], { type: "application/json" })
      );
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", tipo, { valor });
    }
  } catch {}
}

// Componente para registar uma visualização (ex.: ver empreendimento, comparar).
export default function Track({ tipo, valor }) {
  useEffect(() => {
    if (tipo) enviarEvento(tipo, valor);
  }, [tipo, valor]);
  return null;
}
