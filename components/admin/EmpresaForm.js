"use client";

import { useState } from "react";
import { pedidoAdmin, useAvisoSaida } from "@/lib/adminCliente";

// `bloqueado`: a leitura da base falhou — não gravar valores vazios por cima dos reais.
export default function EmpresaForm({ inicial, bloqueado = false }) {
  const [f, setF] = useState({
    denominacao: inicial?.denominacao || "",
    nif: inicial?.nif || "",
    morada: inicial?.morada || "",
    email: inicial?.email || "",
    telefone: inicial?.telefone || "",
    locais: inicial?.locais || "",
  });
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const [gravado, setGravado] = useState(() => JSON.stringify(f));
  useAvisoSaida(JSON.stringify(f) !== gravado);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function guardar(e) {
    e.preventDefault();
    if (bloqueado) return;
    setEstado({ a: "loading", msg: "" });
    const r = await pedidoAdmin("/api/admin/empresa", { body: f });
    if (r.ok) setGravado(JSON.stringify(f));
    setEstado(r.ok ? { a: "ok", msg: "Guardado. Aparece nas páginas legais e no rodapé." } : { a: "erro", msg: r.erro });
  }

  return (
    <form className="admin-form" onSubmit={guardar} style={{ maxWidth: 620 }}>
      <div className="admin-form-grid">
        <label>
          Denominação social
          <input value={f.denominacao} onChange={set("denominacao")} placeholder="Meridie Investments, Lda." />
        </label>
        <label>
          NIF / NIPC
          <input value={f.nif} onChange={set("nif")} placeholder="500 000 000" />
        </label>
        <label className="full">
          Morada / sede
          <input value={f.morada} onChange={set("morada")} placeholder="Rua …, 0000-000 Lisboa, Portugal" />
        </label>
        <label>
          Email de contacto
          <input value={f.email} onChange={set("email")} placeholder="geral@meridieinvestments.com" />
        </label>
        <label>
          Telefone
          <input value={f.telefone} onChange={set("telefone")} placeholder="+351 210 000 000" />
        </label>
        <label className="full">
          Locais (rodapé)
          <input value={f.locais} onChange={set("locais")} placeholder="Lisboa · São Paulo" />
        </label>
      </div>
      {estado.a === "ok" && <div className="form-msg ok">{estado.msg}</div>}
      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={bloqueado || estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
