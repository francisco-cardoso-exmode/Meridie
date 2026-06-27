"use client";

import { useState } from "react";

export default function RedesForm({ inicial }) {
  const [f, setF] = useState({
    instagram: inicial?.instagram || "",
    linkedin: inicial?.linkedin || "",
  });
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function guardar(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    try {
      const res = await fetch("/api/admin/redes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const json = await res.json();
      setEstado(
        res.ok && json.ok
          ? { a: "ok", msg: "Guardado. Aparece no footer de todas as páginas." }
          : { a: "erro", msg: "Não foi possível guardar." }
      );
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
  }

  return (
    <form className="admin-form" onSubmit={guardar} style={{ maxWidth: 560 }}>
      <label className="full">
        Instagram (URL)
        <input value={f.instagram} onChange={set("instagram")} placeholder="https://instagram.com/meridieinvestments" />
      </label>
      <label className="full">
        LinkedIn (URL)
        <input value={f.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/company/..." />
      </label>
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
