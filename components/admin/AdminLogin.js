"use client";

import { useEffect, useState } from "react";

// Para onde ir depois de entrar: só caminhos internos do backoffice
// (?next=/admin/...), nunca outro site.
function destinoSeguro(next) {
  if (typeof next !== "string") return "/admin";
  if (next !== "/admin" && !next.startsWith("/admin/") && !next.startsWith("/admin?")) return "/admin";
  if (/[\\\s]/.test(next) || next.startsWith("/admin/login")) return "/admin";
  return next;
}

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  // "Esqueci-me da password": pede um link de acesso por email.
  const [recuperar, setRecuperar] = useState(false);
  const [email, setEmail] = useState("");
  // Token do link do email: só é gasto quando a pessoa carrega em "Entrar".
  const [acesso, setAcesso] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("link") === "invalido") {
      setEstado({ a: "erro", msg: "Este link já foi usado ou expirou. Pede um novo." });
      setRecuperar(true);
    }
    const t = p.get("acesso");
    if (t) {
      setAcesso(t);
      // Tira o token da barra de endereço (e do histórico).
      p.delete("acesso");
      const q = p.toString();
      window.history.replaceState(null, "", window.location.pathname + (q ? `?${q}` : ""));
    }
  }, []);

  async function entrarComLink() {
    setEstado({ a: "loading", msg: "" });
    try {
      const res = await fetch("/api/admin/acesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: acesso }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        window.location.href = destinoSeguro(json.destino);
      } else {
        setAcesso("");
        setRecuperar(true);
        setEstado({ a: "erro", msg: json.erro || "Este link já foi usado ou expirou. Pede um novo." });
      }
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
  }

  if (acesso) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            MERIDIE <span>INVESTMENTS</span>
          </div>
          <h1>Entrar no backoffice</h1>
          <p>Carrega em &quot;Entrar&quot; para usar o teu link de acesso (serve uma só vez).</p>
          {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
          <button
            type="button"
            className="btn btn-primary"
            onClick={entrarComLink}
            disabled={estado.a === "loading"}
            autoFocus
          >
            {estado.a === "loading" ? "A entrar..." : "Entrar"}
          </button>
        </div>
      </div>
    );
  }

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
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        window.location.href = destinoSeguro(new URLSearchParams(window.location.search).get("next"));
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
        <p>Entra com o teu email e password.</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
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
