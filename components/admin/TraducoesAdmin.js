"use client";

import { useEffect, useState } from "react";

const NOMES = {
  empreendimentos: "Empreendimentos",
  regioes: "Regiões & Zonas",
  marcas: "Marcas",
  anuncios: "Parceiros",
  paginas: "Páginas",
};

// Lista o que falta traduzir e traduz um documento de cada vez (com progresso).
export default function TraducoesAdmin() {
  const [dados, setDados] = useState(null);
  const [corre, setCorre] = useState(null); // { feito, total, atual }
  const [erros, setErros] = useState([]);

  async function carregar() {
    const r = await fetch("/api/admin/traducoes").then((x) => x.json()).catch(() => null);
    setDados(r);
  }
  useEffect(() => {
    carregar();
  }, []);

  const tarefas = dados?.estado
    ? Object.entries(dados.estado).flatMap(([colecao, docs]) =>
        docs.filter((d) => d.falta > 0).map((d) => ({ colecao, ...d }))
      )
    : [];

  async function traduzirTudo() {
    setErros([]);
    const lista = [...tarefas];
    for (let i = 0; i < lista.length; i++) {
      const t = lista[i];
      setCorre({ feito: i, total: lista.length, atual: `${NOMES[t.colecao]} · ${t.nome}` });
      const r = await fetch("/api/admin/traducoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colecao: t.colecao, id: t.id }),
      })
        .then((x) => x.json())
        .catch(() => ({ ok: false, erro: "Erro de ligação." }));
      if (!r.ok) setErros((e) => [...e, `${NOMES[t.colecao]} · ${t.nome}: ${r.erro || "falhou"}`]);
    }
    setCorre(null);
    carregar();
  }

  if (!dados) return <p className="admin-sub">A carregar…</p>;
  if (!dados.ok) return <div className="form-msg erro">Não foi possível ler o estado das traduções.</div>;

  const totalTextos = tarefas.reduce((n, t) => n + t.falta, 0);

  return (
    <div className="admin-form" style={{ maxWidth: 760 }}>
      {!dados.chave && (
        <div className="form-msg erro">
          Falta configurar a chave da IA (<code>ANTHROPIC_API_KEY</code>) na Vercel — sem ela não há
          tradução automática.
        </div>
      )}
      {Object.entries(dados.estado).map(([colecao, docs]) => {
        const faltam = docs.filter((d) => d.falta > 0);
        return (
          <div key={colecao} className="trad-linha">
            <strong>{NOMES[colecao]}</strong>
            <span>
              {docs.length === 0
                ? "—"
                : faltam.length === 0
                ? "✓ tudo traduzido"
                : `${faltam.length} de ${docs.length} por traduzir`}
            </span>
          </div>
        );
      })}

      {corre ? (
        <div className="trad-progresso">
          <div className="trad-barra">
            <span style={{ width: `${Math.round((corre.feito / corre.total) * 100)}%` }} />
          </div>
          <p className="admin-sub">
            A traduzir {corre.feito + 1} de {corre.total}: {corre.atual}…
          </p>
        </div>
      ) : (
        <div className="admin-form-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!tarefas.length || !dados.chave}
            onClick={traduzirTudo}
          >
            {tarefas.length ? `Traduzir tudo (${tarefas.length} itens, ${totalTextos} textos)` : "Está tudo traduzido"}
          </button>
        </div>
      )}
      {erros.length > 0 && (
        <div className="form-msg erro">
          {erros.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      )}
    </div>
  );
}
