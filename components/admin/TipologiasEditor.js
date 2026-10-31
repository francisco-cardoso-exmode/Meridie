"use client";

import { DISPONIBILIDADE } from "@/lib/tipologias";

// Editor das tipologias (uma linha por tipologia): nome, área, preço ou
// "sob consulta", e disponibilidade (disponível, reservado, vendido, esgotado).
export default function TipologiasEditor({ value, onChange, moeda = "EUR" }) {
  const lista = value || [];
  const muda = (i, campo, v) => onChange(lista.map((t, j) => (j === i ? { ...t, [campo]: v } : t)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= lista.length) return;
    const nova = [...lista];
    [nova[i], nova[j]] = [nova[j], nova[i]];
    onChange(nova);
  };

  return (
    <div className="tip-editor">
      {lista.length === 0 && <p className="muted">Ainda sem tipologias.</p>}
      {lista.map((t, i) => (
        <div className="tip-editor-row" key={i}>
          <input
            placeholder="Nome (ex.: T2, Studio, 1 Suíte)"
            value={t.nome || ""}
            onChange={(e) => muda(i, "nome", e.target.value)}
            aria-label="Nome da tipologia"
          />
          <input
            placeholder="Área / notas (ex.: 85 m² · 1 vaga)"
            value={t.area || ""}
            onChange={(e) => muda(i, "area", e.target.value)}
            aria-label="Área"
          />
          <select
            value={t.precoTipo === "consulta" ? "consulta" : "valor"}
            onChange={(e) => muda(i, "precoTipo", e.target.value)}
            aria-label="Tipo de preço"
          >
            <option value="valor">Preço</option>
            <option value="consulta">Sob consulta</option>
          </select>
          <input
            type="number"
            min="0"
            step="1000"
            placeholder={`Preço (${moeda})`}
            value={t.precoTipo === "consulta" ? "" : t.preco ?? ""}
            disabled={t.precoTipo === "consulta"}
            onChange={(e) => muda(i, "preco", e.target.value)}
            aria-label="Preço"
          />
          <select
            value={t.disponibilidade || "disponivel"}
            onChange={(e) => muda(i, "disponibilidade", e.target.value)}
            aria-label="Disponibilidade"
          >
            {DISPONIBILIDADE.map((d) => (
              <option key={d.v} value={d.v}>{d.label}</option>
            ))}
          </select>
          <div className="tip-editor-acoes">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === lista.length - 1} aria-label="Descer">↓</button>
            <button type="button" onClick={() => onChange(lista.filter((_, j) => j !== i))} aria-label="Remover">✕</button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => onChange([...lista, { nome: "", area: "", precoTipo: "valor", preco: "", disponibilidade: "disponivel" }])}
      >
        + Adicionar tipologia
      </button>
    </div>
  );
}
