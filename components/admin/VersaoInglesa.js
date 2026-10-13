"use client";

import { useState } from "react";
import { extrair, achata, desachata } from "@/lib/traducaoCampos";

// Nome legível de um caminho: "produtos.0.descricao" → "Produto 1 · descrição".
function rotulo(caminho) {
  return caminho
    .split(".")
    .map((p, i, arr) => (/^\d+$/.test(p) ? `#${Number(p) + 1}` : p.replace(/([A-Z])/g, " $1").toLowerCase()))
    .join(" · ");
}

/**
 * Painel "Versão inglesa" dos formulários do backoffice: para cada texto
 * traduzível mostra o português (guardado) e a tradução, que se pode corrigir.
 * A tradução é feita automaticamente ao gravar; aqui só se afina.
 */
export default function VersaoInglesa({ colecao, doc, en, onChange }) {
  const [aberto, setAberto] = useState(false);
  const pt = achata(extrair(colecao, doc || {}));
  const plano = achata(en || {});
  const chaves = Object.keys(pt);
  if (!chaves.length) return null;
  const traduzidos = chaves.filter((k) => plano[k]).length;

  function mudar(k, v) {
    const novo = { ...plano, [k]: v };
    onChange(desachata(novo));
  }

  return (
    <div className="versao-en">
      <button type="button" className="btn-ghost" onClick={() => setAberto((v) => !v)}>
        {aberto ? "▾" : "▸"} Versão inglesa ({traduzidos}/{chaves.length} textos traduzidos)
      </button>
      {aberto && (
        <div className="versao-en-lista">
          <p className="admin-sub" style={{ margin: 0 }}>
            A tradução é automática ao gravar. Se corrigires aqui, a tua versão mantém-se até mudares o
            texto em português.
          </p>
          {chaves.map((k) => (
            <label key={k} className="full versao-en-item">
              <span className="versao-en-rotulo">{rotulo(k)}</span>
              <span className="versao-en-pt">{pt[k]}</span>
              <textarea
                rows={Math.min(6, Math.max(1, Math.ceil(pt[k].length / 90)))}
                value={plano[k] || ""}
                placeholder="(ainda sem tradução — é gerada ao gravar)"
                onChange={(e) => mudar(k, e.target.value)}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
