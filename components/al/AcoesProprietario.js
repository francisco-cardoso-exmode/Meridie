"use client";

import { useState } from "react";
import { useT } from "@/components/LangProvider";
import { pedidoAl } from "@/lib/al/cliente";

/** "Enviar para análise" (rascunho → em análise). */
export function EnviarAnalise({ slug }) {
  const { t } = useT();
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  async function enviar() {
    setEstado({ a: "loading", msg: "" });
    const r = await pedidoAl(`/api/proprietario/casas/${slug}`, { body: { acao: "enviar" } });
    if (!r.ok) return setEstado({ a: "erro", msg: t(r.erro) });
    window.location.reload();
  }
  return (
    <div>
      <button type="button" className="al-btn al-btn-grande" onClick={enviar} disabled={estado.a === "loading"}>
        {t("Enviar para análise")}
      </button>
      {estado.msg && <p className="al-msg erro">{estado.msg}</p>}
    </div>
  );
}

/** Bloquear datas (uso próprio, manutenção…) e retirar bloqueios. */
export function Bloqueios({ slug, bloqueios = [], hoje }) {
  const { t } = useT();
  const [f, setF] = useState({ entrada: "", saida: "", nota: "" });
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  async function acao(body) {
    setEstado({ a: "loading", msg: "" });
    const r = await pedidoAl(`/api/proprietario/casas/${slug}`, { body });
    if (!r.ok) return setEstado({ a: "erro", msg: t(r.erro) });
    window.location.reload();
  }
  return (
    <div className="al-bloqueios">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          acao({ acao: "bloquear", ...f });
        }}
      >
        <div className="al-linha2">
          <label>
            {t("De")}
            <input type="date" min={hoje} value={f.entrada} onChange={(e) => setF({ ...f, entrada: e.target.value })} required />
          </label>
          <label>
            {t("Até (dia de saída)")}
            <input type="date" min={f.entrada || hoje} value={f.saida} onChange={(e) => setF({ ...f, saida: e.target.value })} required />
          </label>
        </div>
        <label>
          {t("Nota (opcional)")}
          <input value={f.nota} maxLength={200} onChange={(e) => setF({ ...f, nota: e.target.value })} placeholder={t("ex.: uso próprio")} />
        </label>
        <button type="submit" className="al-btn" disabled={estado.a === "loading"}>
          {t("Bloquear datas")}
        </button>
      </form>
      {estado.msg && <p className="al-msg erro">{estado.msg}</p>}
      {bloqueios.length > 0 && (
        <ul className="al-lista-simples">
          {bloqueios.map((b) => (
            <li key={b.id}>
              <span>
                {b.entrada} → {b.saida} {b.nota ? `· ${b.nota}` : ""}
              </span>
              <button type="button" className="link-botao" onClick={() => acao({ acao: "desbloquear", id: b.id })}>
                {t("Desbloquear")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
