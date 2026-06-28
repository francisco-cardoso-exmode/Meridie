"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

// Google Analytics 4 (gratuito). Só carrega se:
//  - NEXT_PUBLIC_GA_ID estiver definido (ex.: G-XXXXXXXXXX), e
//  - o visitante tiver ACEITE os cookies (RGPD).
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  const [consentido, setConsentido] = useState(false);

  useEffect(() => {
    const ver = () =>
      setConsentido(localStorage.getItem("meridie_consent") === "accept");
    ver();
    window.addEventListener("meridie-consent", ver);
    return () => window.removeEventListener("meridie-consent", ver);
  }, []);

  if (!id || !consentido) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
