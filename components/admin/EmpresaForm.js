"use client";

import { useState } from "react";

export default function EmpresaForm({ inicial }) {
  const [f, setF] = useState({
    denominacao: inicial?.denominacao || "",
    nif: inicial?.nif || "",
    morada: inicial?.morada || "",
    email: inicial?.email || "",
    telefone: inicial?.telefone || "",
    locais: inicial?.locais || "",
  });
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function guardar(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    try {
      const res = await fetch("/api/admin/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const json = await res.json();
      setEstado(
        res.ok && json.ok
          ? { a: "ok", msg: "Guardado. Aparece nas páginas legais e no rodapé." }
          : { a: "erro", msg: "Não foi possível guardar." }
      );
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
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
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
