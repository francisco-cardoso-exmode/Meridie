"use client";

import { useState } from "react";
import { useT } from "@/components/LangProvider";

/** Botão "Pagar" da página da estadia: pede a sessão de pagamento e segue para lá. */
export default function PagarEstadia({ token, rotulo }) {
  const { t } = useT();
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  async function pagar() {
    setEstado({ a: "loading", msg: "" });
    try {
      const res = await fetch("/api/estadia/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.url) {
        window.location.assign(j.url);
        return;
      }
      setEstado({ a: "erro", msg: t(j.erro || "Não foi possível abrir o pagamento. Tenta novamente.") });
    } catch {
      setEstado({ a: "erro", msg: t("Erro de ligação. Verifica a internet e tenta de novo.") });
    }
  }

  return (
    <>
      <button type="button" className="al-btn al-btn-grande" onClick={pagar} disabled={estado.a === "loading"}>
        {estado.a === "loading" ? t("A abrir o pagamento…") : rotulo}
      </button>
      {estado.a === "erro" && <p className="al-msg erro">{estado.msg}</p>}
    </>
  );
}
