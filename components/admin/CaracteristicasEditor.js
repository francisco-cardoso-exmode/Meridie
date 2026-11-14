"use client";

import { useState } from "react";

/**
 * Editor das características de uma categoria (filtros do catálogo): cada
 * característica tem um nome («Tipo», «Região») e opções («Tinto», «Douro»).
 * Os ids dos já gravados mantêm-se (os produtos guardam a escolha pelo id);
 * os novos ganham id no servidor, a partir do nome. O texto ainda por
 * adicionar no campo "Nova opção" junta-se ao gravar (opcoesPendentes).
 * value/onChange: [{ id?, nome, opcoes: [{ id?, nome }] }]
 */
export default function CaracteristicasEditor({ value = [], onChange }) {
  const [nova, setNova] = useState({}); // texto da "nova opção" por característica (índice)
  const muda = (i, fn) => onChange(value.map((c, j) => (j === i ? fn(c) : c)));
  const tira = (i) => onChange(value.filter((_, j) => j !== i));
  const move = (i, d) => {
    const l = [...value];
    [l[i], l[i + d]] = [l[i + d], l[i]];
    onChange(l);
  };

  // Aceita várias de uma vez, separadas por vírgula ou linha («Branco, Tinto, Rosé»).
  function juntaOpcoes(i) {
    const nomes = String(nova[i] || "")
      .split(/[,\n]/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (!nomes.length) return;
    muda(i, (c) => {
      const ja = new Set(c.opcoes.map((o) => o.nome.toLowerCase()));
      return { ...c, opcoes: [...c.opcoes, ...nomes.filter((n) => !ja.has(n.toLowerCase())).map((nome) => ({ nome }))] };
    });
    setNova((x) => ({ ...x, [i]: "" }));
  }

  return (
    <div className="caracs">
      {value.map((c, i) => (
        <div key={c.id || `n${i}`} className="carac">
          <div className="carac-topo">
            <input
              value={c.nome}
              onChange={(e) => muda(i, (x) => ({ ...x, nome: e.target.value }))}
              placeholder="Nome (ex.: Tipo, Região, Casta)"
              aria-label="Nome da característica"
              required
            />
            <button type="button" className="btn-ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
            <button type="button" className="btn-ghost" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Descer">↓</button>
            <button type="button" className="btn-ghost perigo" onClick={() => tira(i)}>Remover</button>
          </div>
          <div className="carac-opcoes">
            {c.opcoes.map((o, k) => (
              <span key={o.id || `n${k}`} className="carac-opcao">
                <input
                  value={o.nome}
                  size={Math.max(4, o.nome.length)}
                  onChange={(e) =>
                    muda(i, (x) => ({ ...x, opcoes: x.opcoes.map((y, m) => (m === k ? { ...y, nome: e.target.value } : y)) }))
                  }
                  aria-label={`Opção ${k + 1} de ${c.nome || "característica"}`}
                />
                <button
                  type="button"
                  aria-label={`Tirar ${o.nome}`}
                  onClick={() => muda(i, (x) => ({ ...x, opcoes: x.opcoes.filter((_, m) => m !== k) }))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="carac-nova">
            <input
              value={nova[i] || ""}
              onChange={(e) => setNova((x) => ({ ...x, [i]: e.target.value }))}
              data-carac-nova={i}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  juntaOpcoes(i);
                }
              }}
              placeholder="Nova opção — ou várias separadas por vírgulas: Branco, Tinto, Rosé"
              aria-label="Novas opções"
            />
            <button type="button" className="btn btn-outline escuro" onClick={() => juntaOpcoes(i)}>
              Adicionar
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline escuro" onClick={() => onChange([...value, { nome: "", opcoes: [] }])}>
        + Característica
      </button>
    </div>
  );
}

/** Junta às características o texto que ficou escrito em "Nova opção" sem carregar em Adicionar. */
export function opcoesPendentes(form, caracteristicas) {
  return caracteristicas.map((c, i) => {
    const texto = form.querySelector(`input[data-carac-nova="${i}"]`)?.value || "";
    const ja = new Set(c.opcoes.map((o) => o.nome.trim().toLowerCase()));
    const novas = texto
      .split(/[,\n]/)
      .map((x) => x.trim())
      .filter((n) => n && !ja.has(n.toLowerCase()) && ja.add(n.toLowerCase()));
    return novas.length ? { ...c, opcoes: [...c.opcoes, ...novas.map((nome) => ({ nome }))] } : c;
  });
}
