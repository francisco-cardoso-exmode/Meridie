"use client";

import { useEffect, useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  // "Esqueci-me da password": pede um link de acesso por email.
  const [recuperar, setRecuperar] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("link") === "invalido") {
      setEstado({ a: "erro", msg: "Este link já foi usado ou expirou. Pede um novo." });
      setRecuperar(true);
    }
  }, []);

  async function pedirLink(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    try {
      const res = await fetch("/api/admin/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      setEstado({ a: "ok", msg: json.msg || "Pedido enviado." });
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
  }

  if (recuperar) {
    return (
      <div className="admin-login">
        <form className="admin-login-card" onSubmit={pedirLink}>
          <div className="admin-login-brand">
            MERIDIE <span>INVESTMENTS</span>
          </div>
          <h1>Recuperar acesso</h1>
          <p>Escreve o teu email. Se estiver autorizado, recebes um link para entrar (válido 30 minutos).</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
          {estado.a === "ok" && <div className="form-msg ok">{estado.msg}</div>}
          <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
            {estado.a === "loading" ? "A enviar..." : "Enviar link de acesso"}
          </button>
          <button
            type="button"
            className="admin-login-link"
            onClick={() => {
              setRecuperar(false);
              setEstado({ a: "idle", msg: "" });
            }}
          >
            ← Voltar à password
          </button>
        </form>
      </div>
    );
  }

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
        <button
          type="button"
          className="admin-login-link"
          onClick={() => {
            setRecuperar(true);
            setEstado({ a: "idle", msg: "" });
          }}
        >
          Esqueci-me da password
        </button>
      </form>
    </div>
  );
}
