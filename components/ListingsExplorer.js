"use client";

import { useMemo, useState } from "react";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";

const ORDENACOES = {
  destaque: "Em destaque",
  "preco-asc": "Preço (mais baixo)",
  "preco-desc": "Preço (mais alto)",
  "area-desc": "Área (maior)",
};

const ESTADO_INICIAL = {
  zona: "",
  tipo: "",
  finalidade: "",
  quartos: "",
  ordenacao: "destaque",
};

export default function ListingsExplorer({ empreendimentos, zonas, tipos, finalidades }) {
  const [f, setF] = useState(ESTADO_INICIAL);

  const set = (campo) => (ev) => setF((prev) => ({ ...prev, [campo]: ev.target.value }));
  const reset = () => setF(ESTADO_INICIAL);

  const resultados = useMemo(() => {
    let lista = empreendimentos.filter((e) => {
      if (f.zona && e.zona !== f.zona) return false;
      if (f.tipo && e.tipo !== f.tipo) return false;
      if (f.finalidade && e.finalidade !== f.finalidade) return false;
      if (f.quartos && e.quartos < Number(f.quartos)) return false;
      return true;
    });

    const ord = {
      "preco-asc": (a, b) => a.preco - b.preco,
      "preco-desc": (a, b) => b.preco - a.preco,
      "area-desc": (a, b) => b.area - a.area,
      destaque: (a, b) => Number(b.destaque) - Number(a.destaque),
    }[f.ordenacao];

    return [...lista].sort(ord);
  }, [empreendimentos, f]);

  const ativo =
    f.zona || f.tipo || f.finalidade || f.quartos || f.ordenacao !== "destaque";

  return (
    <>
      <div className="filters">
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
          <label htmlFor="f-tipo">Tipo</label>
          <select id="f-tipo" value={f.tipo} onChange={set("tipo")}>
            <option value="">Todos os tipos</option>
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
        <div className="filter">
          <label htmlFor="f-quartos">Quartos (mín.)</label>
          <select id="f-quartos" value={f.quartos} onChange={set("quartos")}>
            <option value="">Indiferente</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
        <div className="filter">
          <label htmlFor="f-ord">Ordenar por</label>
          <select id="f-ord" value={f.ordenacao} onChange={set("ordenacao")}>
            {Object.entries(ORDENACOES).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

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
          <p>Nenhum empreendimento corresponde aos filtros selecionados.</p>
          <button type="button" className="btn-reset" onClick={reset}>
            Limpar filtros
          </button>
        </div>
      )}
    </>
  );
}
