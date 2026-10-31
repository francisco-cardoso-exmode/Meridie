"use client";

import { useState } from "react";
import ListaFiltravel from "@/components/admin/ListaFiltravel";

// Backoffice → Utilizadores: a minha password, lista, novo utilizador.
export default function UtilizadoresAdmin({ lista, eu, definir }) {
  return (
    <>
      <MinhaPassword eu={eu} definir={definir} />
      <div style={{ marginTop: 28 }} />
      <ListaFiltravel
        placeholder="Pesquisar por nome ou email…"
        facetas={[
          { k: "password", label: "Password", opcoes: [{ v: "sim", label: "Com password" }, { v: "nao", label: "Sem password" }] },
        ]}
        ordens={[{ k: "nome", label: "Nome" }, { k: "email", label: "Email" }]}
        itens={lista.map((u) => ({
          id: u.email,
          busca: `${u.nome || ""} ${u.email}`,
          facetas: { password: u.temPassword ? "sim" : "nao" },
          ordem: { nome: u.nome || u.email, email: u.email },
          node: (
          <div className="admin-row">
            <div className="admin-row-main">
              <div className="admin-row-title">
                {u.nome || u.email}
                {u.email === eu && <span className="tag-dest">TU</span>}
                {!u.temPassword && <span className="tag-oculto">SEM PASSWORD</span>}
              </div>
              <div className="admin-row-sub">{u.email}</div>
            </div>
            <div className="admin-row-actions">
              {u.email !== eu && <ApagarUtilizador email={u.email} nome={u.nome || u.email} />}
            </div>
          </div>
          ),
        }))}
      />
      <NovoUtilizador />
    </>
  );
}

function MinhaPassword({ eu, definir }) {
  // Password atual: obrigatória para mudar uma password existente; quem
  // acabou de entrar pelo link do email não precisa dela.
  const [atual, setAtual] = useState("");
  const [password, setPassword] = useState("");
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  if (!eu) {
    return (
      <div className="form-msg">
        Entraste com a password global. Para teres a tua própria password, entra com o teu email
        (ou usa &quot;Esqueci-me da password&quot; no ecrã de entrada).
      </div>
    );
  }

  async function guardar(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    const res = await fetch("/api/admin/conta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, atual }),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && json.ok) {
      setPassword("");
      setAtual("");
      setEstado({ a: "ok", msg: "Password guardada. A partir de agora entras com o teu email e esta password." });
    } else {
      setEstado({ a: "erro", msg: json.erro || "Não foi possível guardar." });
    }
  }

  return (
    <form className="admin-form" onSubmit={guardar} style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: "1.15rem", margin: 0 }}>
        {definir ? "Define a tua password" : "A minha password"}
      </h2>
      <p className="admin-sub" style={{ margin: 0 }}>
        {eu} — mínimo 8 caracteres. Ao mudar a password, as tuas sessões noutros
        dispositivos terminam.
      </p>
      {!definir && (
        <label className="full">
          Password atual
          <input
            type="password"
            value={atual}
            onChange={(e) => setAtual(e.target.value)}
            autoComplete="current-password"
            placeholder="Vazio se ainda não tens password"
          />
        </label>
      )}
      <label className="full">
        Nova password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          maxLength={200}
          required
          autoFocus={definir}
          autoComplete="new-password"
        />
      </label>
      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      {estado.a === "ok" && <div className="form-msg ok">{estado.msg}</div>}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : "Guardar password"}
        </button>
      </div>
    </form>
  );
}

function NovoUtilizador() {
  const [f, setF] = useState({ nome: "", email: "", password: "" });
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function criar(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    const res = await fetch("/api/admin/utilizadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && json.ok) window.location.reload();
    else setEstado({ a: "erro", msg: json.erro || "Não foi possível criar." });
  }

  return (
    <form className="admin-form" onSubmit={criar} style={{ maxWidth: 520, marginTop: 28 }}>
      <h2 style={{ fontSize: "1.15rem", margin: 0 }}>Novo utilizador</h2>
      <label className="full">
        Nome
        <input value={f.nome} onChange={set("nome")} placeholder="Nome da pessoa" />
      </label>
      <label className="full">
        Email
        <input type="email" value={f.email} onChange={set("email")} required placeholder="email@exemplo.pt" />
      </label>
      <label className="full">
        Password (opcional)
        <input
          type="password"
          value={f.password}
          onChange={set("password")}
          minLength={8}
          maxLength={200}
          autoComplete="new-password"
          placeholder="Vazio: a pessoa define-a com 'Esqueci-me da password'"
        />
      </label>
      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A criar..." : "Criar utilizador"}
        </button>
      </div>
    </form>
  );
}

function ApagarUtilizador({ email, nome }) {
  const [a, setA] = useState("idle");
  async function apagar() {
    if (!confirm(`Remover o acesso de "${nome}"?`)) return;
    setA("loading");
    const res = await fetch("/api/admin/utilizadores", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && json.ok) window.location.reload();
    else {
      alert(json.erro || "Não foi possível apagar.");
      setA("idle");
    }
  }
  return (
    <button type="button" className="admin-del" onClick={apagar} disabled={a === "loading"}>
      {a === "loading" ? "..." : "Remover"}
    </button>
  );
}
