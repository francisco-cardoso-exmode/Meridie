"use client";

import { useEffect, useState } from "react";

// Negrito inline: **texto** → <strong>
function inline(texto, kp) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) => {
    if (/^\*\*[^*]+\*\*$/.test(parte)) {
      return <strong key={`${kp}-${i}`}>{parte.slice(2, -2)}</strong>;
    }
    return <span key={`${kp}-${i}`}>{parte}</span>;
  });
}

// Converte o texto da IA em blocos (subtítulos, parágrafos, listas, separadores).
function parse(texto) {
  const linhas = (texto || "").split("\n").map((l) => l.trim());
  const blocos = [];
  let lista = null;
  const fecharLista = () => {
    if (lista) {
      blocos.push({ tipo: "ul", itens: lista });
      lista = null;
    }
  };

  for (const l of linhas) {
    if (!l) {
      fecharLista();
      continue;
    }
    // Linha separadora de tabela markdown (|---|---|) — ignorar
    if (/^\|?[\s:|-]+\|[\s:|-]*$/.test(l)) continue;
    // Separador --- → ignorar (sem linhas no comparador)
    if (/^-{3,}$/.test(l)) {
      fecharLista();
      continue;
    }
    // Subtítulo markdown (# / ## / ###)
    if (/^#{1,4}\s+/.test(l)) {
      fecharLista();
      blocos.push({ tipo: "h", texto: l.replace(/^#{1,4}\s+/, "") });
      continue;
    }
    // Linha de tabela markdown — converter para frase legível
    if (/^\|.*\|/.test(l)) {
      const celulas = l
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (celulas.length) blocos.push({ tipo: "p", texto: celulas.join(" — ") });
      continue;
    }
    // Bullet
    if (/^[-•*]\s+/.test(l)) {
      lista = lista || [];
      lista.push(l.replace(/^[-•*]\s+/, ""));
      continue;
    }
    fecharLista();
    blocos.push({ tipo: "p", texto: l });
  }
  fecharLista();
  return blocos;
}

export default function CompareAnalysis({ a, b, nomeA, nomeB }) {
  const [estado, setEstado] = useState({ a: "loading", texto: "", erro: "" });

  useEffect(() => {
    let vivo = true;
    setEstado({ a: "loading", texto: "", erro: "" });
    fetch("/api/comparar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a, b }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!vivo) return;
        if (res.ok && json.analise) {
          setEstado({ a: "ok", texto: json.analise, erro: "" });
        } else {
          setEstado({
            a: "erro",
            texto: "",
            erro: json.erro || "Não foi possível gerar a análise agora.",
          });
        }
      })
      .catch(() => {
        if (vivo) setEstado({ a: "erro", texto: "", erro: "Erro de ligação." });
      });
    return () => {
      vivo = false;
    };
  }, [a, b]);

  return (
    <section className="comp-ia">
      <h3>
        <span className="comp-ia-badge">IA</span> Análise comparativa
      </h3>
      <p className="comp-ia-sub">
        Pontos fortes de cada um para te ajudar a decidir entre {nomeA} e {nomeB}.
      </p>

      {estado.a === "loading" && (
        <div className="comp-ia-load">
          <span className="spinner" /> A analisar os dois empreendimentos…
        </div>
      )}

      {estado.a === "erro" && <p className="muted">{estado.erro}</p>}

      {estado.a === "ok" && (
        <div className="comp-ia-texto">
          {parse(estado.texto).map((bl, i) => {
            if (bl.tipo === "hr") return <hr key={i} />;
            if (bl.tipo === "h") return <h4 key={i}>{inline(bl.texto, i)}</h4>;
            if (bl.tipo === "ul")
              return (
                <ul key={i}>
                  {bl.itens.map((it, j) => (
                    <li key={j}>{inline(it, `${i}-${j}`)}</li>
                  ))}
                </ul>
              );
            return <p key={i}>{inline(bl.texto, i)}</p>;
          })}
          <p className="comp-ia-nota">
            Análise gerada por IA com base nos dados dos empreendimentos. Confirme
            sempre os detalhes com a nossa equipa.
          </p>
        </div>
      )}
    </section>
  );
}
