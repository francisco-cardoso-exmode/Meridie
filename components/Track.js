"use client";

import { useEffect } from "react";

// Origem da sessão (guardada pelo TrackVisita em sessionStorage — sem cookies).
function fonteDaSessao() {
  try {
    const f = sessionStorage.getItem("meridie_origem");
    // "1" era o marcador antigo; "-" quer dizer navegação interna (sem origem).
    return f && f !== "1" && f !== "-" ? f : undefined;
  } catch {
    return undefined;
  }
}

// Envia um evento de tracking para o nosso backend (e para o GA, se existir).
// Junta a página atual (sem query) e a origem da sessão, para os filtros do
// backoffice. Fire-and-forget — nunca atrasa nem parte a página.
export function enviarEvento(tipo, valor) {
  try {
    const body = JSON.stringify({
      tipo,
      valor,
      caminho: typeof window !== "undefined" ? window.location.pathname : undefined,
      fonte: fonteDaSessao(),
    });
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
    // O GA já conta as páginas vistas sozinho.
    if (typeof window !== "undefined" && typeof window.gtag === "function" && tipo !== "pagina_vista") {
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
