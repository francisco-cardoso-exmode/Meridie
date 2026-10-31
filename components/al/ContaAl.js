"use client";

import { useState } from "react";
import { useT } from "@/components/LangProvider";
import { pedidoAl } from "@/lib/al/cliente";

/**
 * Entrar / criar conta / recuperar password nas apps do Alojamento Local.
 * papel: "proprietario" (com registo) | "equipa" (só entrar e recuperar).
 * destino: para onde ir depois de entrar.
 */
export default function ContaAl({ papel, destino, registo = false, modoInicial = "entrar" }) {
  const { t, lang } = useT();
  const [modo, setModo] = useState(modoInicial);
  const [f, setF] = useState({ nome: "", email: "", telefone: "", password: "", plano: "gestao", website: "" });
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    const acao = modo === "registo" ? "registo" : modo === "recuperar" ? "recuperar" : "login";
    const r = await pedidoAl("/api/al/conta", { body: { ...f, acao, papel, lang } });
    if (!r.ok) return setEstado({ a: "erro", msg: t(r.erro) });
    if (acao === "recuperar") return setEstado({ a: "ok", msg: t(r.msg) });
    window.location.href = destino;
  }

  const titulo = { entrar: t("Entrar"), registo: t("Criar conta"), recuperar: t("Recuperar password") }[modo];

  return (
    <form className="al-cartao al-conta" onSubmit={enviar}>
      <h1>{titulo}</h1>
      {modo === "registo" && (
        <>
          <label>
            {t("Nome")}
            <input value={f.nome} onChange={set("nome")} required autoComplete="name" maxLength={120} />
          </label>
          <label>
            {t("Telefone")}
            <input value={f.telefone} onChange={set("telefone")} type="tel" autoComplete="tel" maxLength={40} />
          </label>
        </>
      )}
      <label>
        {t("Email")}
        <input value={f.email} onChange={set("email")} type="email" required autoComplete="username" />
      </label>
      {modo !== "recuperar" && (
        <label>
          {t("Password")}
          <input
            value={f.password}
            onChange={set("password")}
            type="password"
            required
            minLength={modo === "registo" ? 8 : undefined}
            autoComplete={modo === "registo" ? "new-password" : "current-password"}
          />
          {modo === "registo" && <small>{t("Pelo menos 8 caracteres.")}</small>}
        </label>
      )}
      {modo === "registo" && (
        <>
          <label>
            {t("Plano que te interessa")}
            <select value={f.plano} onChange={set("plano")}>
              <option value="gestao">{t("Gestão completa")}</option>
              <option value="anuncio">{t("Anúncio")}</option>
            </select>
          </label>
          <input className="campo-armadilha" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} aria-hidden="true" />
        </>
      )}
      {estado.msg && <p className={`al-msg ${estado.a === "erro" ? "erro" : "ok"}`}>{estado.msg}</p>}
      <button type="submit" className="al-btn al-btn-grande" disabled={estado.a === "loading"}>
        {estado.a === "loading" ? t("Um momento…") : modo === "recuperar" ? t("Enviar link") : titulo}
      </button>
      <div className="al-conta-links">
        {modo !== "entrar" && (
          <button type="button" className="link-botao" onClick={() => setModo("entrar")}>
            {t("Já tenho conta — entrar")}
          </button>
        )}
        {modo === "entrar" && registo && (
          <button type="button" className="link-botao" onClick={() => setModo("registo")}>
            {t("Ainda não tenho conta — criar")}
          </button>
        )}
        {modo !== "recuperar" && (
          <button type="button" className="link-botao" onClick={() => setModo("recuperar")}>
            {t("Esqueci-me da password")}
          </button>
        )}
      </div>
    </form>
  );
}

/** Definir nova password a partir do link do email (?t=…). */
export function ReporPasswordAl({ papel, token, destino }) {
  const { t } = useT();
  const [password, setPassword] = useState("");
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  async function enviar(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    const r = await pedidoAl("/api/al/conta", { body: { acao: "repor", papel, t: token, password } });
    if (!r.ok) return setEstado({ a: "erro", msg: t(r.erro) });
    window.location.href = destino;
  }
  return (
    <form className="al-cartao al-conta" onSubmit={enviar}>
      <h1>{t("Nova password")}</h1>
      <label>
        {t("Password")}
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" />
        <small>{t("Pelo menos 8 caracteres.")}</small>
      </label>
      {estado.msg && <p className="al-msg erro">{estado.msg}</p>}
      <button type="submit" className="al-btn al-btn-grande" disabled={estado.a === "loading"}>
        {t("Guardar e entrar")}
      </button>
    </form>
  );
}

export function SairAl({ papel, destino }) {
  const { t } = useT();
  return (
    <button
      type="button"
      className="link-botao"
      onClick={async () => {
        await pedidoAl("/api/al/conta", { body: { acao: "logout", papel } });
        window.location.href = destino;
      }}
    >
      {t("Sair")}
    </button>
  );
}
