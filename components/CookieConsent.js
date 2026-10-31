"use client";

import L from "@/components/L";
import { useEffect, useState } from "react";
import { useT } from "@/components/LangProvider";
import {
  lerConsentimento,
  guardarConsentimento,
  EVENTO_CONSENTIMENTO,
} from "@/lib/consentimento";

// Banner de consentimento de cookies (RGPD). Guarda a escolha em localStorage e
// avisa o componente do Google Analytics para carregar (ou não). Volta a
// aparecer quando a escolha é apagada ("Gerir cookies" no rodapé).
export default function CookieConsent() {
  const { t } = useT();
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const ver = () => setMostrar(!lerConsentimento());
    ver();
    window.addEventListener(EVENTO_CONSENTIMENTO, ver);
    return () => window.removeEventListener(EVENTO_CONSENTIMENTO, ver);
  }, []);

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
          <button type="button" className="cookie-rej" onClick={() => guardarConsentimento("reject")}>
            {t("Rejeitar")}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => guardarConsentimento("accept")}>
            {t("Aceitar")}
          </button>
        </div>
      </div>
    </div>
  );
}
