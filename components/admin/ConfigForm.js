"use client";

import { useState } from "react";

export default function ConfigForm({ inicial = [] }) {
  const [texto, setTexto] = useState(inicial.join("\n"));
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  async function guardar(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    const destinatarios = texto
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatarios }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setTexto((json.destinatarios || []).join("\n"));
        setEstado({
          a: "ok",
          msg: `Guardado. As mensagens passam a ir para ${json.destinatarios.length} email(s).`,
        });
      } else {
        setEstado({ a: "erro", msg: "Não foi possível guardar." });
      }
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
  }

  return (
    <form className="admin-form" onSubmit={guardar} style={{ maxWidth: 560 }}>
      <label className="full">
        Emails que recebem o formulário (um por linha)
        <textarea
          rows={5}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={"helder@meridieinvestments.com\npaulo@meridieinvestments.com"}
        />
      </label>
      <p className="email-note">
        Todas as mensagens do formulário de contacto e dos pedidos &quot;Tenho
        interesse&quot; passam a ser enviadas para estes endereços.
      </p>
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
