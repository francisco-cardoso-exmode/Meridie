"use client";

import { useEffect } from "react";
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

// Regista a origem UMA vez por sessão (anónimo, sem cookies).
export default function TrackVisita() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("meridie_origem")) return;
      const origem = classificarOrigem();
      sessionStorage.setItem("meridie_origem", "1");
      if (origem) enviarEvento("origem", origem);
    } catch {}
  }, []);
  return null;
}
