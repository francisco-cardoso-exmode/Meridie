"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  async function onSubmit(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        window.location.href = "/admin";
      } else {
        setEstado({ a: "erro", msg: json.erro || "Não foi possível entrar." });
      }
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={onSubmit}>
        <div className="admin-login-brand">
          MERIDIE <span>INVESTMENTS</span>
        </div>
        <h1>Backoffice</h1>
        <p>Introduz a password de administração.</p>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A entrar..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
