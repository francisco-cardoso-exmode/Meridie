"use client";

import { useState } from "react";
import { pedidoAdmin } from "@/lib/adminCliente";
import { ESTADOS_PEDIDO } from "@/lib/pedido";

// Estado do pedido + nota interna (cada mudança fica no histórico).
export default function PedidoAcoes({ id, estado: estadoInicial }) {
  const [estado, setEstado] = useState(estadoInicial);
  const [nota, setNota] = useState("");
  const [r, setR] = useState({ a: "idle", msg: "" });

  async function gravar(corpo) {
    setR({ a: "loading", msg: "" });
    const res = await pedidoAdmin(`/api/admin/pedidos/${id}`, { method: "PATCH", body: corpo });
    if (res.ok) window.location.reload();
    else setR({ a: "erro", msg: res.erro });
  }

  return (
    <div className="admin-form pedido-acoes">
      <label className="full">
        Estado
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          {Object.entries(ESTADOS_PEDIDO).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </label>
      <label className="full">
        Nota interna (só a equipa vê)
        <textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ex.: enviada proposta por email a 31/10" />
      </label>
      {r.a === "erro" && <div className="form-msg erro">{r.msg}</div>}
      <div className="admin-form-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={r.a === "loading" || (estado === estadoInicial && !nota.trim())}
          onClick={() => gravar({ ...(estado !== estadoInicial ? { estado } : {}), ...(nota.trim() ? { nota } : {}) })}
        >
          {r.a === "loading" ? "A guardar..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
