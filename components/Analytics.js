"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  lerConsentimento,
  revogarAnalytics,
  EVENTO_CONSENTIMENTO,
} from "@/lib/consentimento";

// Google Analytics 4 (gratuito), com Consent Mode v2:
//  - o consentimento começa "denied" (definido no HTML, antes de o GA carregar);
//  - o gtag.js só é carregado se NEXT_PUBLIC_GA_ID existir e o visitante
//    tiver ACEITE os cookies (RGPD);
//  - se depois rejeitar, o consentimento passa a "denied" e os cookies _ga*
//    são apagados.
// O "default: denied" é escrito no HTML pelo layout (CONSENT_PADRAO, em
// lib/consentimento.js), antes de qualquer script do GA.

// Páginas privadas (link da estadia e áreas com login): o GA não carrega,
// para os tokens dos links (/estadia/<token>, ?t=<token>) não irem no page_view.
const PRIVADAS = /^(\/en)?\/(estadia|stay|proprietario|owner)(\/|$)/;

export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  const privada = PRIVADAS.test(usePathname() || "");
  const [consentido, setConsentido] = useState(false);

  useEffect(() => {
    const ver = () => {
      const ok = lerConsentimento() === "accept";
      setConsentido(ok);
      if (!ok) {
        revogarAnalytics(id);
      } else if (id && typeof window.gtag === "function") {
        // Voltou a aceitar na mesma visita (o gtag.js já estava carregado).
        window[`ga-disable-${id}`] = false;
        window.gtag("consent", "update", { analytics_storage: "granted" });
      }
    };
    ver();
    window.addEventListener(EVENTO_CONSENTIMENTO, ver);
    return () => window.removeEventListener(EVENTO_CONSENTIMENTO, ver);
  }, [id]);

  if (!id || !consentido || privada) return null;

  return (
    <>
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){dataLayer.push(arguments);};
          gtag('consent', 'update', { analytics_storage: 'granted' });
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
    </>
  );
}
