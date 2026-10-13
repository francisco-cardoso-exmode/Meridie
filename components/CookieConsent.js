"use client";

import L from "@/components/L";
import { useEffect, useState } from "react";
import { useT } from "@/components/LangProvider";

// Banner de consentimento de cookies (RGPD). Guarda a escolha em localStorage e
// avisa o componente do Google Analytics para carregar (ou não).
export default function CookieConsent() {
  const { t } = useT();
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
    <div className="cookie-bar" role="dialog" aria-label={t("Consentimento de cookies")}>
      <div className="cookie-inner">
        <p className="cookie-txt">
          {t("Usamos cookies essenciais ao funcionamento do site e, com a tua autorização, cookies de análise (Google Analytics) para perceber como é usado e melhorá-lo.")}{" "}
          {t("Vê a")} <L href="/cookies">{t("Política de Cookies")}</L> {t("e a")}{" "}
          <L href="/privacidade">{t("Política de Privacidade")}</L>.
        </p>
        <div className="cookie-acoes">
          <button type="button" className="cookie-rej" onClick={() => decidir("reject")}>
            {t("Rejeitar")}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => decidir("accept")}>
            {t("Aceitar")}
          </button>
        </div>
      </div>
    </div>
  );
}
