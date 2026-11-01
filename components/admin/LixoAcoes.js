"use client";

import { useState } from "react";
import { pedidoAdmin } from "@/lib/adminCliente";

// Recuperar ou apagar de vez um item do lixo.
export default function LixoAcoes({ id, nome, editar }) {
  const [a, setA] = useState({ estado: "idle", msg: "" });

  async function fazer(acao) {
    if (acao === "apagar" && !confirm(`Apagar "${nome}" de vez? Já não se pode recuperar.`)) return;
    setA({ estado: "loading", msg: "" });
    const r = await pedidoAdmin("/api/admin/lixo", { body: { id, acao } });
    if (!r.ok) return setA({ estado: "erro", msg: r.erro });
    setA({ estado: acao === "restaurar" ? "restaurado" : "apagado", msg: "" });
  }

  if (a.estado === "restaurado")
    return (
      <span className="lixo-feito">
        Recuperado. <a href={editar} className="admin-link">Abrir →</a>
      </span>
    );
  if (a.estado === "apagado") return <span className="lixo-feito">Apagado de vez.</span>;
  return (
    <div className="admin-row-actions">
      {a.estado === "erro" && <span className="form-msg erro">{a.msg}</span>}
      <button type="button" className="admin-link" disabled={a.estado === "loading"} onClick={() => fazer("restaurar")}>
        Recuperar
      </button>
      <button type="button" className="admin-del" disabled={a.estado === "loading"} onClick={() => fazer("apagar")}>
        Apagar de vez
      </button>
    </div>
  );
}
