"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConteudoForm({ pagina, campos, valores }) {
  const router = useRouter();
  const [f, setF] = useState(() => {
    const o = {};
    campos.forEach((c) => (o[c.k] = valores?.[c.k] ?? ""));
    return o;
  });
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function guardar(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    try {
      const res = await fetch(`/api/admin/paginas/${pagina}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campos: f }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setEstado({ a: "ok", msg: "Guardado. O site atualiza em ~1 minuto." });
        router.refresh();
      } else {
        setEstado({ a: "erro", msg: "Não foi possível guardar." });
      }
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
  }

  return (
    <form className="admin-form" onSubmit={guardar}>
      {campos.map((c) => (
        <label className="full" key={c.k}>
          {c.label}
          {c.tipo === "textarea" ? (
            <textarea rows={3} value={f[c.k]} onChange={set(c.k)} />
          ) : (
            <input value={f[c.k]} onChange={set(c.k)} />
          )}
        </label>
      ))}
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
