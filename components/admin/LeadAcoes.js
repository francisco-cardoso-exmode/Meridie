"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pedidoAdmin } from "@/lib/adminCliente";
import { ESTADOS_LEAD } from "@/lib/lead";

const dataCurta = (d) =>
  new Date(d).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Lisbon" });

// Estado da lead (grava ao escolher) + notas internas, sem recarregar a lista.
export default function LeadAcoes({ id, estado: estadoInicial, notas: notasIniciais = [] }) {
  const [estado, setEstado] = useState(estadoInicial);
  const [notas, setNotas] = useState(notasIniciais);
  const [nota, setNota] = useState("");
  const [aberta, setAberta] = useState(false);
  const [r, setR] = useState({ a: "idle", msg: "" });
  const router = useRouter();

  async function gravar(corpo) {
    setR({ a: "loading", msg: "" });
    const res = await pedidoAdmin(`/api/admin/leads/${id}`, { method: "PATCH", body: corpo });
    if (!res.ok) {
      setR({ a: "erro", msg: res.erro });
      return false;
    }
    setR({ a: "ok", msg: "Guardado." });
    router.refresh(); // atualiza os números do menu
    return true;
  }

  async function mudarEstado(e) {
    const novo = e.target.value;
    const antes = estado;
    setEstado(novo);
    if (!(await gravar({ estado: novo }))) setEstado(antes);
  }

  async function juntarNota() {
    const texto = nota.trim();
    if (!texto || !(await gravar({ nota: texto }))) return;
    setNotas((l) => [...l, { em: new Date().toISOString(), texto }]);
    setNota("");
    setAberta(false);
  }

  return (
    <div className="lead-acoes">
      <div className="lead-acoes-linha">
        <select value={estado} onChange={mudarEstado} disabled={r.a === "loading"} aria-label="Estado" className={`lead-estado e-${estado}`}>
          {Object.entries(ESTADOS_LEAD).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {!aberta && (
          <button type="button" className="admin-link" onClick={() => setAberta(true)}>
            + Nota
          </button>
        )}
        {r.a === "ok" && <span className="lead-ok">{r.msg}</span>}
        {r.a === "erro" && <span className="form-msg erro">{r.msg}</span>}
      </div>
      {notas.length > 0 && (
        <ul className="lead-notas">
          {notas.map((n, i) => (
            <li key={i}>
              <span>{dataCurta(n.em)}{n.por ? ` · ${n.por}` : ""}</span> {n.texto}
            </li>
          ))}
        </ul>
      )}
      {aberta && (
        <div className="lead-nota-nova">
          <textarea
            rows={2}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Nota interna — ex.: liguei a 01/11, quer T2 no Porto até 300 mil"
            autoFocus
          />
          <div>
            <button type="button" className="btn btn-primary" disabled={!nota.trim() || r.a === "loading"} onClick={juntarNota}>
              Guardar nota
            </button>{" "}
            <button type="button" className="admin-link" onClick={() => (setAberta(false), setNota(""))}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
