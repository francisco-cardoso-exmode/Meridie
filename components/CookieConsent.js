"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Banner de consentimento de cookies (RGPD). Guarda a escolha em localStorage e
// avisa o componente do Google Analytics para carregar (ou não).
export default function CookieConsent() {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("meridie_consent")) setMostrar(true);
  }, []);

  function decidir(valor) {
    try {
      localStorage.setItem("meridie_consent", valor);
      window.dispatchEvent(new Event("meridie-consent"));
    } catch {}
    setMostrar(false);
  }

  if (!mostrar) return null;

  return (
    <div className="cookie-bar" role="dialog" aria-label="Consentimento de cookies">
      <div className="cookie-inner">
        <p className="cookie-txt">
          Usamos cookies essenciais ao funcionamento do site e, com a tua autorização,
          cookies de análise (Google Analytics) para perceber como é usado e melhorá-lo.
          Vê a <Link href="/cookies">Política de Cookies</Link> e a{" "}
          <Link href="/privacidade">Política de Privacidade</Link>.
        </p>
        <div className="cookie-acoes">
          <button type="button" className="cookie-rej" onClick={() => decidir("reject")}>
            Rejeitar
          </button>
          <button type="button" className="btn btn-primary" onClick={() => decidir("accept")}>
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
