"use client";

import { useState } from "react";
import { pedidoAdmin } from "@/lib/adminCliente";
import { ORIGENS, ROTULO_ORIGEM, TIPOS_TAREFA, ROTULO_TIPO_TAREFA } from "@/lib/al/regras";

/**
 * Componentes do backoffice do Alojamento Local (só PT).
 */

/** Botão que faz POST de uma ação; mostra o erro ou o link devolvido. */
export function BotaoAcao({ url, body, rotulo, confirmar, classe = "admin-link", recarregar = true }) {
  const [estado, setEstado] = useState({ a: "idle", msg: "", link: "" });
  async function clicar() {
    if (confirmar && !window.confirm(confirmar)) return;
    setEstado({ a: "loading", msg: "", link: "" });
    const r = await pedidoAdmin(url, { body });
    if (!r.ok) return setEstado({ a: "erro", msg: r.erro, link: "" });
    if (r.aviso) window.alert(r.aviso);
    if (r.link) {
      setEstado({ a: "ok", msg: r.emailEnviado ? "Link enviado ao hóspede por email." : "Copia o link e envia ao hóspede:", link: r.link });
      return;
    }
    if (recarregar) window.location.reload();
    else setEstado({ a: "ok", msg: "Feito.", link: "" });
  }
  return (
    <span className="al-acao">
      <button type="button" className={classe} onClick={clicar} disabled={estado.a === "loading"}>
        {estado.a === "loading" ? "…" : rotulo}
      </button>
      {estado.msg && <span className={`al-acao-msg ${estado.a}`}>{estado.msg}</span>}
      {estado.link && (
        <input
          className="al-link-copiar"
          readOnly
          value={estado.link}
          onFocus={(e) => e.target.select()}
          onClick={() => navigator.clipboard?.writeText(estado.link)}
        />
      )}
    </span>
  );
}

/** Nova reserva manual (ex.: vinda do Airbnb) ou pedido a confirmar depois. */
export function ReservaManualForm({ casas }) {
  const [f, setF] = useState({ casaSlug: "", nome: "", email: "", telefone: "", entrada: "", saida: "", valor: "", limpeza: "", origem: "airbnb", confirmar: true, nota: "", idioma: "pt" });
  const [estado, setEstado] = useState({ a: "idle", msg: "", link: "" });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const casa = casas.find((c) => c.slug === f.casaSlug);
  async function enviar(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "", link: "" });
    const r = await pedidoAdmin("/api/admin/alojamento/reservas", {
      body: { ...f, hospede: { nome: f.nome, email: f.email, telefone: f.telefone } },
    });
    if (!r.ok) return setEstado({ a: "erro", msg: r.erro, link: "" });
    setEstado({
      a: "ok",
      msg: r.link ? (r.emailEnviado ? "Reserva criada; link enviado ao hóspede." : "Reserva criada. Envia este link ao hóspede:") : "Reserva criada.",
      link: r.link || "",
    });
  }
  return (
    <form className="admin-form" onSubmit={enviar}>
      <div className="admin-form-grid">
        <label>
          Casa
          <select value={f.casaSlug} onChange={set("casaSlug")} required>
            <option value="">—</option>
            {casas.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.titulo} ({c.pais || "PT"})
              </option>
            ))}
          </select>
        </label>
        <label>
          Origem
          <select value={f.origem} onChange={set("origem")}>
            {ORIGENS.map((o) => (
              <option key={o} value={o}>
                {ROTULO_ORIGEM[o]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Idioma do hóspede
          <select value={f.idioma} onChange={set("idioma")}>
            <option value="pt">Português</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          Hóspede — nome
          <input value={f.nome} onChange={set("nome")} required />
        </label>
        <label>
          Email <small>(para o link)</small>
          <input type="email" value={f.email} onChange={set("email")} />
        </label>
        <label>
          Telefone
          <input value={f.telefone} onChange={set("telefone")} />
        </label>
        <label>
          Entrada
          <input type="date" value={f.entrada} onChange={set("entrada")} required />
        </label>
        <label>
          Saída
          <input type="date" value={f.saida} onChange={set("saida")} required />
        </label>
        <label>
          Valor da estadia {casa ? `(${casa.moeda || "EUR"})` : ""} <small>sem limpeza nem taxa turística</small>
          <input type="number" min={0} step="0.01" value={f.valor} onChange={set("valor")} />
        </label>
        <label>
          Limpeza
          <input type="number" min={0} step="0.01" value={f.limpeza} onChange={set("limpeza")} />
        </label>
        <label className="full">
          Nota interna
          <input value={f.nota} onChange={set("nota")} maxLength={1000} placeholder="ex.: código de reserva do Airbnb" />
        </label>
        <label className="check-inline full">
          <input type="checkbox" checked={f.confirmar} onChange={set("confirmar")} />
          Confirmar já (verifica sobreposições, cria as inspeções e envia o link ao hóspede)
        </label>
      </div>
      {estado.msg && <div className={`form-msg ${estado.a === "erro" ? "erro" : "ok"}`}>{estado.msg}</div>}
      {estado.link && <input className="al-link-copiar" readOnly value={estado.link} onFocus={(e) => e.target.select()} />}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          Criar reserva
        </button>
      </div>
    </form>
  );
}

/** Nova tarefa avulsa (ex.: limpeza). */
export function NovaTarefaForm({ casas, equipa }) {
  const [f, setF] = useState({ tipo: "limpeza", casaSlug: "", data: "", atribuidaA: "" });
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await pedidoAdmin("/api/admin/alojamento/tarefas", { body: { acao: "criar", ...f } });
        if (!r.ok) return setEstado({ a: "erro", msg: r.erro });
        window.location.reload();
      }}
    >
      <div className="admin-form-grid">
        <label>
          Tipo
          <select value={f.tipo} onChange={set("tipo")}>
            {TIPOS_TAREFA.map((t) => (
              <option key={t} value={t}>
                {ROTULO_TIPO_TAREFA[t]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Casa
          <select value={f.casaSlug} onChange={set("casaSlug")} required>
            <option value="">—</option>
            {casas.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.titulo}
              </option>
            ))}
          </select>
        </label>
        <label>
          Data
          <input type="date" value={f.data} onChange={set("data")} required />
        </label>
        <label>
          Atribuir a
          <select value={f.atribuidaA} onChange={set("atribuidaA")}>
            <option value="">— por atribuir —</option>
            {equipa.map((m) => (
              <option key={m.email} value={m.email}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>
      </div>
      {estado.msg && <div className="form-msg erro">{estado.msg}</div>}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary">
          Criar tarefa
        </button>
      </div>
    </form>
  );
}

/** Atribuir uma tarefa (grava ao mudar). */
export function AtribuirTarefa({ id, atual, equipa }) {
  const [v, setV] = useState(atual || "");
  const [erro, setErro] = useState("");
  return (
    <span>
      <select
        value={v}
        onChange={async (e) => {
          const email = e.target.value;
          setV(email);
          const r = await pedidoAdmin("/api/admin/alojamento/tarefas", { body: { acao: "atribuir", id, email } });
          setErro(r.ok ? "" : r.erro);
        }}
      >
        <option value="">— por atribuir —</option>
        {equipa.map((m) => (
          <option key={m.email} value={m.email}>
            {m.nome}
            {m.ativo === false ? " (inativo)" : ""}
          </option>
        ))}
      </select>
      {erro && <small className="al-acao-msg erro"> {erro}</small>}
    </span>
  );
}

async function pedirEquipa(body, setEstado) {
  setEstado({ a: "loading", msg: "" });
  const r = await pedidoAdmin("/api/admin/alojamento/equipa", { body });
  if (!r.ok) return setEstado({ a: "erro", msg: r.erro });
  if (r.aviso) window.alert(r.aviso);
  else if (body.acao === "convite") window.alert("Convite reenviado.");
  else if (body.acao === "criar") window.alert("Pessoa criada. Enviámos-lhe o convite por email para definir a password e instalar a app.");
  window.location.reload();
}

/** Ações de uma pessoa da equipa: reenviar convite, ativar/desativar, mudar password. */
export function AcoesMembro({ m }) {
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  return (
    <div className="admin-row-actions">
      {m.ativo !== false && (
        <button type="button" className="admin-link" onClick={() => pedirEquipa({ acao: "convite", email: m.email }, setEstado)}>
          Reenviar convite
        </button>
      )}
      <button type="button" className="admin-link" onClick={() => pedirEquipa({ acao: "ativo", email: m.email, ativo: m.ativo === false }, setEstado)}>
        {m.ativo === false ? "Reativar" : "Desativar"}
      </button>
      <button
        type="button"
        className="admin-link"
        onClick={() => {
          const p = window.prompt(`Nova password para ${m.nome} (mín. 8 caracteres):`);
          if (p) pedirEquipa({ acao: "password", email: m.email, password: p }, setEstado);
        }}
      >
        Mudar password
      </button>
      {estado.msg && <small className="al-acao-msg erro">{estado.msg}</small>}
    </div>
  );
}

/** Acrescentar uma pessoa à equipa. */
export function NovoMembro() {
  const [f, setF] = useState({ nome: "", email: "" });
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  return (
    <form
      className="admin-form"
      onSubmit={(e) => {
        e.preventDefault();
        pedirEquipa({ acao: "criar", ...f }, setEstado);
      }}
    >
      <div className="admin-form-grid">
        <label>
          Nome
          <input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
        </label>
      </div>
      <p className="admin-sub">
        A pessoa recebe um convite por email: define a própria password (link válido 7 dias) e tem as instruções para instalar a app no telemóvel.
      </p>
      {estado.msg && <div className="form-msg erro">{estado.msg}</div>}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          Criar e enviar convite
        </button>
      </div>
    </form>
  );
}

/** Definições: comissões das OTA e % dos planos. */
export function DefinicoesAl({ config }) {
  const [c, setC] = useState(config);
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const num = (grupo, k) => (
    <input
      type="number"
      min={0}
      max={100}
      step="0.1"
      value={c[grupo][k]}
      onChange={(e) => setC((x) => ({ ...x, [grupo]: { ...x[grupo], [k]: e.target.value } }))}
    />
  );
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await pedidoAdmin("/api/admin/alojamento/definicoes", { method: "PUT", body: c });
        setEstado(r.ok ? { a: "ok", msg: "Guardado." } : { a: "erro", msg: r.erro });
      }}
    >
      <h3>Comissão das plataformas (aprox., %)</h3>
      <div className="admin-form-grid">
        <label>Airbnb {num("comissaoOta", "airbnb")}</label>
        <label>Booking {num("comissaoOta", "booking")}</label>
      </div>
      <h3>Comissão Meridie por plano (%)</h3>
      <div className="admin-form-grid">
        <label>Anúncio {num("planos", "anuncio")}</label>
        <label>Gestão completa {num("planos", "gestao")}</label>
        <label>
          Gestão completa reduzida <small>2+ casas ou comprou através da Meridie</small> {num("planos", "reduzida")}
        </label>
      </div>
      <h3>Taxa de serviço do hóspede (%)</h3>
      <p className="admin-sub">
        Somada ao total das reservas diretas (estadia + limpeza) e igual para qualquer forma de pagamento — cobre parte do custo dos pagamentos. 0 =
        sem taxa.
      </p>
      <div className="admin-form-grid">
        <label>Portugal {num("taxaServico", "PT")}</label>
        <label>Brasil {num("taxaServico", "BR")}</label>
      </div>
      {estado.msg && <div className={`form-msg ${estado.a === "erro" ? "erro" : "ok"}`}>{estado.msg}</div>}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
}
