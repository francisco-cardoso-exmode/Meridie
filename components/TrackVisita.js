"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { enviarEvento } from "@/components/Track";

// Classifica de onde veio o visitante (UTM ou referrer).
function classificarOrigem() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = params.get("utm_source");
    if (utm) return utm.trim().toLowerCase();

    const ref = document.referrer;
    if (!ref) return "Direto";

    const host = new URL(ref).hostname.replace(/^www\./, "").toLowerCase();
    const proprio = window.location.hostname.replace(/^www\./, "").toLowerCase();
    if (host === proprio || host.endsWith(`.${proprio}`)) return null; // navegação interna

    const mapa = [
      ["google", "Google"],
      ["bing", "Bing"],
      ["duckduckgo", "DuckDuckGo"],
      ["yahoo", "Yahoo"],
      ["instagram", "Instagram"],
      ["facebook", "Facebook"],
      ["fb.", "Facebook"],
      ["linkedin", "LinkedIn"],
      ["youtube", "YouTube"],
      ["t.co", "Twitter/X"],
      ["twitter", "Twitter/X"],
      ["x.com", "Twitter/X"],
      ["whatsapp", "WhatsApp"],
      ["wa.me", "WhatsApp"],
      ["t.me", "Telegram"],
      ["tiktok", "TikTok"],
    ];
    for (const [chave, nome] of mapa) if (host.includes(chave)) return nome;
    return host;
  } catch {
    return "Direto";
  }
}

// Último caminho registado (ao nível do módulo): em modo estrito o React corre
// o efeito duas vezes na montagem — assim a página só conta uma vez.
let ultimoCaminho = null;

// Regista a origem UMA vez por sessão (= uma visita) e cada página vista,
// também na navegação do lado do cliente. Anónimo, sem cookies (só
// sessionStorage, que se apaga ao fechar o separador).
export default function TrackVisita() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    try {
      if (!sessionStorage.getItem("meridie_origem")) {
        const origem = classificarOrigem();
        // Guarda a origem para juntar aos eventos seguintes ("-" = interna).
        sessionStorage.setItem("meridie_origem", origem ? origem.slice(0, 60) : "-");
        if (origem) enviarEvento("origem", origem);
      }
    } catch {}
    if (pathname === ultimoCaminho) return;
    ultimoCaminho = pathname;
    enviarEvento("pagina_vista", pathname);
  }, [pathname]);
  return null;
}
