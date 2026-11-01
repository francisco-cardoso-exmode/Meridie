"use client";

import { useState } from "react";
import { useT } from "@/components/LangProvider";
import { pedidoAl } from "@/lib/al/cliente";

/** Aviso na área do proprietário enquanto o email não está confirmado. */
export default function ConfirmarEmail({ email }) {
  const { t, lang } = useT();
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  async function reenviar() {
    setEstado({ a: "loading", msg: "" });
    const r = await pedidoAl("/api/al/conta", { body: { acao: "confirmacao", papel: "proprietario", lang } });
    setEstado({ a: r.ok ? "ok" : "erro", msg: t(r.ok ? r.msg : r.erro) });
  }

  return (
    <div className="al-cartao al-aviso-email">
      <p>
        <strong>{t("Confirma o teu email")}</strong> — {t("enviámos um link para")} <strong>{email}</strong>.{" "}
        {t("Só depois de confirmado podes ligar a conta bancária onde recebes os pagamentos.")}
      </p>
      {estado.a === "ok" || estado.a === "erro" ? (
        <p className={`al-msg ${estado.a === "erro" ? "erro" : ""}`}>{estado.msg}</p>
      ) : (
        <button type="button" className="al-btn al-btn-sec" onClick={reenviar} disabled={estado.a === "loading"}>
          {estado.a === "loading" ? t("A enviar…") : t("Reenviar o email")}
        </button>
      )}
    </div>
  );
}
