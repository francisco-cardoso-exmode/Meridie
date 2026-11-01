"use client";

import { useState } from "react";
import { useT } from "@/components/LangProvider";
import FotosAl from "@/components/al/FotosAl";
import { pedidoAl } from "@/lib/al/cliente";
import Icon from "@/components/Icon";

/** "Reportar um problema" na página da estadia (com fotos). */
export default function ProblemaHospede({ token }) {
  const { t } = useT();
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [fotos, setFotos] = useState([]);
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  if (estado.a === "ok") return <p className="al-msg ok">{t("Recebemos a tua mensagem. A nossa equipa vai tratar do assunto e contactar-te.")}</p>;
  if (!aberto)
    return (
      <button type="button" className="al-btn al-btn-sec al-btn-grande" onClick={() => setAberto(true)}>
        <Icon name="alert" size={18} /> {t("Reportar um problema")}
      </button>
    );

  return (
    <form
      className="al-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setEstado({ a: "loading", msg: "" });
        const r = await pedidoAl("/api/estadia/problema", { body: { token, texto, fotos } });
        setEstado(r.ok ? { a: "ok", msg: "" } : { a: "erro", msg: t(r.erro) });
      }}
    >
      <label>
        {t("O que se passa?")}
        <textarea rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={3000} />
      </label>
      <FotosAl value={fotos} onChange={setFotos} rota="/api/estadia/upload" pasta="problemas" payload={{ token }} max={10} />
      {estado.msg && <p className="al-msg erro">{estado.msg}</p>}
      <button type="submit" className="al-btn al-btn-grande" disabled={estado.a === "loading"}>
        {t("Enviar")}
      </button>
    </form>
  );
}
