"use client";

import { useT } from "@/components/LangProvider";
import { reabrirConsentimento } from "@/lib/consentimento";

// "Gerir cookies": apaga a escolha guardada e volta a mostrar o aviso de
// consentimento (o visitante pode mudar de ideias a qualquer momento).
export default function GerirCookies({ className = "link-botao" }) {
  const { t } = useT();
  return (
    <button type="button" className={className} onClick={reabrirConsentimento}>
      {t("Gerir cookies")}
    </button>
  );
}
