"use client";

import { useState } from "react";
import { pedidoAdmin, useAvisoSaida } from "@/lib/adminCliente";

// `porDefeito`: para onde vão as mensagens quando a lista fica vazia
// (variável CONTACT_TO / SMTP_USER). `bloqueado`: a leitura falhou — não gravar.
export default function ConfigForm({ inicial = [], porDefeito = [], bloqueado = false }) {
  const [texto, setTexto] = useState(inicial.join("\n"));
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const [gravado, setGravado] = useState(texto);
  useAvisoSaida(texto !== gravado);

  const lista = texto
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  async function guardar(e) {
    e.preventDefault();
    if (bloqueado) return;
    setEstado({ a: "loading", msg: "" });
    const r = await pedidoAdmin("/api/admin/config", { body: { destinatarios: lista } });
    if (r.ok) {
      const novo = (r.destinatarios || []).join("\n");
      setTexto(novo);
      setGravado(novo);
      setEstado({
        a: "ok",
        msg: r.destinatarios.length
          ? `Guardado. As mensagens passam a ir para ${r.destinatarios.length} email(s).`
          : porDefeito.length
          ? `Guardado. Lista vazia: as mensagens vão para ${porDefeito.join(", ")} (endereço por defeito).`
          : "Guardado, mas a lista está vazia e não há endereço por defeito — as mensagens não chegam a ninguém!",
      });
    } else {
      setEstado({ a: "erro", msg: r.erro });
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
        interesse&quot; passam a ser enviadas para estes endereços.{" "}
        {porDefeito.length ? (
          <>
            Se deixares a lista vazia, vão para <strong>{porDefeito.join(", ")}</strong> (endereço
            por defeito, definido na Vercel).
          </>
        ) : (
          <strong>
            Se deixares a lista vazia, as mensagens não são enviadas a ninguém (não há endereço por
            defeito configurado).
          </strong>
        )}
      </p>
      {lista.length === 0 && (
        <div className="form-msg erro">
          Lista vazia —{" "}
          {porDefeito.length
            ? `as mensagens vão para ${porDefeito.join(", ")}.`
            : "as mensagens não chegam a ninguém."}
        </div>
      )}
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
