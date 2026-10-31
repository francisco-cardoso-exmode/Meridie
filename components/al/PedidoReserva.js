"use client";

import { useRef, useState } from "react";
import { useT } from "@/components/LangProvider";
import L from "@/components/L";
import { resolverDesafio } from "@/lib/resolverDesafio";
import { noitesEntre, erroDatas, formatarValor, somaDias, taxaServicoDe } from "@/lib/al/regras";

/**
 * "Pedir reserva" na página de uma casa. Mostra a estimativa (noites ×
 * preço + limpeza + taxa de serviço) na moeda da casa. Não se paga aqui: a
 * equipa confirma e o hóspede paga depois na página da estadia.
 */
export default function PedidoReserva({ casa, ocupadas = [], hoje, pctTaxa = 0, pagaOnline = false }) {
  const { t, tf, lang } = useT();
  const inicio = useRef(Date.now());
  const [f, setF] = useState({ entrada: "", saida: "", hospedes: 2, nome: "", email: "", telefone: "", mensagem: "", website: "" });
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const noites = noitesEntre(f.entrada, f.saida);
  const moeda = casa.moeda || "EUR";
  const estadia = noites * (casa.precoNoite || 0);
  const taxa = taxaServicoDe(estadia, casa.limpeza, pctTaxa);
  const ocupado = new Set(ocupadas);
  let conflito = false;
  for (let i = 0; i < noites; i++) if (ocupado.has(somaDias(f.entrada, i))) conflito = true;
  const invalido = f.entrada && f.saida ? erroDatas({ entrada: f.entrada, saida: f.saida, hoje, estadiaMinima: casa.estadiaMinima }) : null;

  async function enviar(e) {
    e.preventDefault();
    if (invalido || conflito) return;
    setEstado({ a: "loading", msg: t("A enviar...") });
    try {
      const prova = await resolverDesafio();
      const res = await fetch("/api/alojamento/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, casa: casa.slug, lang, prova, t: Date.now() - inicio.current }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) setEstado({ a: "ok", msg: t("Pedido enviado! Vais receber um email de confirmação do pedido. A nossa equipa confirma a disponibilidade em breve.") });
      else setEstado({ a: "erro", msg: t(j.erro || "Ocorreu um erro ao enviar o pedido. Tenta novamente.") });
    } catch {
      setEstado({ a: "erro", msg: t("Erro de ligação. Verifica a internet e tenta de novo.") });
    }
  }

  if (estado.a === "ok") return <p className="al-msg ok">{estado.msg}</p>;

  return (
    <form className="al-pedido" onSubmit={enviar}>
      <div className="al-linha2">
        <label>
          {t("Entrada")}
          <input type="date" value={f.entrada} min={hoje} onChange={set("entrada")} required />
        </label>
        <label>
          {t("Saída")}
          <input type="date" value={f.saida} min={f.entrada || hoje} onChange={set("saida")} required />
        </label>
      </div>
      <label>
        {t("Hóspedes")}
        <input type="number" min={1} max={casa.capacidade || 20} value={f.hospedes} onChange={set("hospedes")} required />
      </label>
      {noites > 0 && !invalido && (
        <div className="al-estimativa">
          <div>
            {tf("{n} noites × {p}", { n: noites, p: formatarValor(casa.precoNoite, moeda, lang) })}
            <strong>{formatarValor(estadia, moeda, lang)}</strong>
          </div>
          {casa.limpeza > 0 && (
            <div>
              {t("Limpeza")} <strong>{formatarValor(casa.limpeza, moeda, lang)}</strong>
            </div>
          )}
          {taxa > 0 && (
            <div>
              {t("Taxa de serviço")} <strong>{formatarValor(taxa, moeda, lang, { decimais: 2 })}</strong>
            </div>
          )}
          <div className="total">
            {t("Total estimado")} <strong>{formatarValor(estadia + (casa.limpeza || 0) + taxa, moeda, lang, { decimais: taxa > 0 ? 2 : 0 })}</strong>
          </div>
          <small>
            {t(
              pagaOnline
                ? "Taxa turística, se aplicável, à parte. Não pagas nada agora: pagas online depois de confirmarmos a disponibilidade."
                : "Taxa turística, se aplicável, à parte. Sem pagamento agora."
            )}
          </small>
        </div>
      )}
      {invalido && <p className="al-msg erro">{t(invalido)}</p>}
      {conflito && <p className="al-msg erro">{t("Algumas destas noites já estão ocupadas. Escolhe outras datas.")}</p>}
      <label>
        {t("Nome")}
        <input value={f.nome} onChange={set("nome")} required maxLength={100} autoComplete="name" />
      </label>
      <label>
        {t("Email")}
        <input type="email" value={f.email} onChange={set("email")} required autoComplete="email" />
      </label>
      <label>
        {t("Telefone")}
        <input type="tel" value={f.telefone} onChange={set("telefone")} maxLength={40} autoComplete="tel" />
      </label>
      <label>
        {t("Mensagem (opcional)")}
        <textarea rows={3} value={f.mensagem} onChange={set("mensagem")} maxLength={2000} />
      </label>
      <input className="campo-armadilha" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} aria-hidden="true" />
      {estado.a === "erro" && <p className="al-msg erro">{estado.msg}</p>}
      <button type="submit" className="al-btn al-btn-grande" disabled={estado.a === "loading" || !!invalido || conflito}>
        {estado.a === "loading" ? estado.msg : t("Pedir reserva")}
      </button>
      <p className="form-privacidade">
        {t("Ao enviar, aceitas que usemos estes dados para tratar o teu pedido, conforme a")} <L href="/privacidade">{t("Política de Privacidade")}</L>.
      </p>
    </form>
  );
}
