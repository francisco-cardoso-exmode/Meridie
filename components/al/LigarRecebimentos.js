"use client";

import { useState } from "react";
import { useT } from "@/components/LangProvider";

/** Botão da área do proprietário que abre o registo (ou o painel) no Stripe. */
export default function LigarRecebimentos({ rotulo, secundario = false }) {
  const { t, lang } = useT();
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  async function abrir() {
    setEstado({ a: "loading", msg: "" });
    try {
      const res = await fetch("/api/al/recebimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.url) {
        window.location.assign(j.url);
        return;
      }
      setEstado({ a: "erro", msg: t(j.erro || "Não foi possível abrir o Stripe. Tenta novamente.") });
    } catch {
      setEstado({ a: "erro", msg: t("Erro de ligação. Verifica a internet e tenta de novo.") });
    }
  }

  return (
    <>
      <button type="button" className={`al-btn${secundario ? " al-btn-sec" : ""}`} onClick={abrir} disabled={estado.a === "loading"}>
        {estado.a === "loading" ? t("A abrir…") : rotulo}
      </button>
      {estado.a === "erro" && <p className="al-msg erro">{estado.msg}</p>}
    </>
  );
}
