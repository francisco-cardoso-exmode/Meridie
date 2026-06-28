"use client";

import { useEffect, useState } from "react";

// Converte o texto da IA em parágrafos / listas simples.
function render(texto) {
  const linhas = (texto || "").split("\n").map((l) => l.trim());
  const blocos = [];
  let lista = null;
  linhas.forEach((l, i) => {
    if (!l) {
      if (lista) {
        blocos.push({ tipo: "ul", itens: lista });
        lista = null;
      }
      return;
    }
    if (/^[-•*]\s+/.test(l)) {
      lista = lista || [];
      lista.push(l.replace(/^[-•*]\s+/, ""));
    } else {
      if (lista) {
        blocos.push({ tipo: "ul", itens: lista });
        lista = null;
      }
      blocos.push({ tipo: "p", texto: l.replace(/\*\*/g, "") });
    }
    if (i === linhas.length - 1 && lista) blocos.push({ tipo: "ul", itens: lista });
  });
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
        if (vivo)
          setEstado({ a: "erro", texto: "", erro: "Erro de ligação." });
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
          {render(estado.texto).map((bl, i) =>
            bl.tipo === "ul" ? (
              <ul key={i}>
                {bl.itens.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            ) : (
              <p key={i}>{bl.texto}</p>
            )
          )}
          <p className="comp-ia-nota">
            Análise gerada por IA com base nos dados dos empreendimentos. Confirme
            sempre os detalhes com a nossa equipa.
          </p>
        </div>
      )}
    </section>
  );
}
