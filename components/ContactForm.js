"use client";

import { useState } from "react";

export default function ContactForm({ assuntoInicial = "" }) {
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  async function onSubmit(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });

    const form = e.currentTarget;
    const dados = {
      nome: form.nome.value,
      email: form.email.value,
      assunto: form.assunto.value,
      mensagem: form.mensagem.value,
    };

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        setEstado({
          a: "ok",
          msg: "Mensagem enviada! Enviámos-te um email de confirmação e a nossa equipa entrará em contacto muito em breve.",
        });
        form.reset();
      } else {
        setEstado({ a: "erro", msg: json.erro || "Não foi possível enviar." });
      }
    } catch {
      setEstado({
        a: "erro",
        msg: "Erro de ligação. Verifica a internet e tenta novamente.",
      });
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="nome">Nome *</label>
        <input id="nome" name="nome" type="text" required placeholder="O teu nome" />
      </div>
      <div className="field">
        <label htmlFor="email">Email *</label>
        <input id="email" name="email" type="email" required placeholder="email@exemplo.pt" />
      </div>
      <div className="field full">
        <label htmlFor="assunto">Assunto</label>
        <input
          id="assunto"
          name="assunto"
          type="text"
          defaultValue={assuntoInicial}
          placeholder="Sobre o que queres falar?"
        />
      </div>
      <div className="field full">
        <label htmlFor="mensagem">Mensagem *</label>
        <textarea id="mensagem" name="mensagem" rows={6} required placeholder="Escreve a tua mensagem..." />
      </div>

      {estado.a === "ok" && <div className="form-msg ok">{estado.msg}</div>}
      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}

      <div className="field full">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A enviar..." : "Enviar mensagem"}
        </button>
      </div>
    </form>
  );
}
