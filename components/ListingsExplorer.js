"use client";

import { useMemo, useState } from "react";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";
import { referenciaDe, PAIS_LABEL } from "@/lib/empreendimentos";

const ORDENACOES = {
  destaque: "Em destaque",
  "preco-asc": "Preço (mais baixo)",
  "preco-desc": "Preço (mais alto)",
  "area-desc": "Área (maior)",
};

// Ordem canónica dos estados do imóvel (do mais inicial ao concluído).
export const ESTADOS_ORDEM = [
  "Em planta",
  "Pré-lançamento",
  "Lançamento",
  "Em construção",
  "Pronto",
];

const norm = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function ListingsExplorer({
  empreendimentos,
  zonas,
  tipos,
  finalidades,
  paises = [],
  comBusca = false,
  comPais = false,
  colapsavel = false,
}) {
  const ESTADO_INICIAL = {
    texto: "",
    pais: "",
    zona: "",
    tipo: "",
    finalidade: "",
    estado: "",
    ordenacao: "destaque",
  };
  const [f, setF] = useState(ESTADO_INICIAL);
  const [aberto, setAberto] = useState(!colapsavel);

  // Estados presentes nos dados, pela ordem canónica.
  const estados = ESTADOS_ORDEM.filter((s) =>
    empreendimentos.some((e) => e.estado === s)
  );

  const set = (campo) => (ev) => setF((prev) => ({ ...prev, [campo]: ev.target.value }));
  const reset = () => setF(ESTADO_INICIAL);

  const resultados = useMemo(() => {
    const q = norm(f.texto);
    let lista = empreendimentos.filter((e) => {
      if (comPais && f.pais && e.pais !== f.pais) return false;
      if (f.zona && e.zona !== f.zona) return false;
      if (f.tipo && e.tipo !== f.tipo) return false;
      if (f.finalidade && e.finalidade !== f.finalidade) return false;
      if (f.estado && e.estado !== f.estado) return false;
      if (q) {
        const alvo = norm(
          [
            e.nome,
            e.cidade,
            e.zona,
            e.tipo,
            e.finalidade,
            e.construtora,
            referenciaDe(e),
          ].join(" ")
        );
        if (!alvo.includes(q)) return false;
      }
      return true;
    });

    const ord = {
      "preco-asc": (a, b) => a.preco - b.preco,
      "preco-desc": (a, b) => b.preco - a.preco,
      "area-desc": (a, b) => b.area - a.area,
      destaque: (a, b) => Number(b.destaque) - Number(a.destaque),
    }[f.ordenacao];

    return [...lista].sort(ord);
  }, [empreendimentos, f, comPais]);

  const ativo =
    f.texto ||
    (comPais && f.pais) ||
    f.zona ||
    f.tipo ||
    f.finalidade ||
    f.estado ||
    f.ordenacao !== "destaque";

  return (
    <>
      {(comBusca || colapsavel) && (
        <div className="explorer-bar">
          {comBusca && (
            <div className="explorer-search">
              <span className="es-icon">⌕</span>
              <input
                type="search"
                value={f.texto}
                onChange={set("texto")}
                placeholder="Pesquisar por nome, cidade, zona, referência…"
                aria-label="Pesquisar empreendimentos"
              />
            </div>
          )}
          {colapsavel && (
            <button
              type="button"
              className={`btn-filtros${aberto ? " is-open" : ""}`}
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
            >
              Filtros {aberto ? "▴" : "▾"}
            </button>
          )}
        </div>
      )}

      {aberto && (
        <div className="filters">
          {comPais && (
            <div className="filter">
              <label htmlFor="f-pais">País</label>
              <select id="f-pais" value={f.pais} onChange={set("pais")}>
                <option value="">Portugal e Brasil</option>
                {paises.map((p) => (
                  <option key={p} value={p}>
                    {PAIS_LABEL[p] || p}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="filter">
            <label htmlFor="f-zona">Zona</label>
            <select id="f-zona" value={f.zona} onChange={set("zona")}>
              <option value="">Todas as zonas</option>
              {zonas.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
          <div className="filter">
            <label htmlFor="f-tipo">Tipologia</label>
            <select id="f-tipo" value={f.tipo} onChange={set("tipo")}>
              <option value="">Todas as tipologias</option>
              {tipos.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="filter">
            <label htmlFor="f-fin">Finalidade</label>
            <select id="f-fin" value={f.finalidade} onChange={set("finalidade")}>
              <option value="">Qualquer</option>
              {finalidades.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </div>
          {estados.length > 0 && (
            <div className="filter">
              <label htmlFor="f-estado">Estado</label>
              <select id="f-estado" value={f.estado} onChange={set("estado")}>
                <option value="">Qualquer estado</option>
                {estados.map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>
          )}
          <div className="filter">
            <label htmlFor="f-ord">Ordenar por</label>
            <select id="f-ord" value={f.ordenacao} onChange={set("ordenacao")}>
              {Object.entries(ORDENACOES).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="filters-meta">
        <span className="filters-count">
          <strong>{resultados.length}</strong>{" "}
          {resultados.length === 1 ? "empreendimento" : "empreendimentos"}
        </span>
        {ativo && (
          <button type="button" className="btn-reset" onClick={reset}>
            Limpar filtros
          </button>
        )}
      </div>

      {resultados.length > 0 ? (
        <div className="listing-grid">
          {resultados.map((e) => (
            <EmpreendimentoCard key={e.slug} e={e} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Nenhum empreendimento corresponde à pesquisa.</p>
          <button type="button" className="btn-reset" onClick={reset}>
            Limpar filtros
          </button>
        </div>
      )}
    </>
  );
}
