"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Lista do backoffice com pesquisa, filtros e ordenação (tudo no browser).
 * As linhas vêm já desenhadas do servidor (`node`); aqui só se escolhe quais
 * mostrar e por que ordem. O estado fica no URL para se poder partilhar.
 *
 * itens:   [{ id, busca: "texto em minúsculas", facetas: { k: valor }, ordem: { k: valor }, node }]
 * facetas: [{ k, label, opcoes: [{ v, label }] }]  (opções vazias = geradas a partir dos itens)
 * ordens:  [{ k, label, desc }]
 * periodo: chave de `ordem` com a data em ms → mostra o filtro "Últimos N dias"
 */
const PERIODOS = [
  ["", "Sempre"],
  ["7", "Últimos 7 dias"],
  ["30", "Últimos 30 dias"],
  ["90", "Últimos 90 dias"],
  ["365", "Último ano"],
];

// Sem acentos e em minúsculas, para "conceicao" encontrar "Conceição".
export function normaliza(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function lerUrl() {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams();
  }
}

export default function ListaFiltravel({
  itens,
  facetas = [],
  ordens = [],
  ordemPadrao,
  periodo,
  placeholder = "Pesquisar…",
  vazio = "Nada encontrado com estes filtros.",
  className = "admin-list",
}) {
  const [q, setQ] = useState("");
  const [filtros, setFiltros] = useState({});
  const [ordem, setOrdem] = useState(ordemPadrao || ordens[0]?.k || "");
  const [dias, setDias] = useState("");

  // Estado inicial a partir do URL (depois de montar, para não haver diferenças de hidratação).
  useEffect(() => {
    const p = lerUrl();
    setQ(p.get("q") || "");
    const f = {};
    for (const { k } of facetas) if (p.get(k)) f[k] = p.get(k);
    setFiltros(f);
    if (p.get("ordem") && ordens.some((o) => o.k === p.get("ordem"))) setOrdem(p.get("ordem"));
    if (periodo && p.get("dias")) setDias(p.get("dias"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guarda no URL sem recarregar.
  useEffect(() => {
    const p = lerUrl();
    const pôr = (k, v) => (v ? p.set(k, v) : p.delete(k));
    pôr("q", q);
    for (const { k } of facetas) pôr(k, filtros[k]);
    pôr("ordem", ordem && ordem !== (ordemPadrao || ordens[0]?.k) ? ordem : "");
    if (periodo) pôr("dias", dias);
    const qs = p.toString();
    try {
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    } catch {}
  }, [q, filtros, ordem, dias, facetas, ordens, ordemPadrao, periodo]);

  // Um item passa nos filtros? `menos`: faceta a ignorar (para contar as opções dela).
  const passa = useMemo(() => {
    const termos = normaliza(q).split(/\s+/).filter(Boolean);
    const limite = periodo && dias ? Date.now() - Number(dias) * 864e5 : null;
    return (it, menos) => {
      if (termos.length && !termos.every((t) => normaliza(it.busca).includes(t))) return false;
      for (const [k, v] of Object.entries(filtros)) {
        if (k !== menos && v && String(it.facetas?.[k] ?? "") !== v) return false;
      }
      if (limite && !((it.ordem?.[periodo] || 0) >= limite)) return false;
      return true;
    };
  }, [q, filtros, dias, periodo]);

  // Opções de cada filtro: só as que existem com os OUTROS filtros aplicados
  // (escolhida a categoria, a marca mostra só as marcas dessa categoria), com
  // a contagem. A opção escolhida fica sempre, mesmo a zero.
  const opcoes = useMemo(() => {
    const out = {};
    for (const f of facetas) {
      const conta = new Map();
      for (const it of itens) {
        if (!passa(it, f.k)) continue;
        const v = it.facetas?.[f.k];
        if (v !== undefined && v !== null && v !== "") conta.set(String(v), (conta.get(String(v)) || 0) + 1);
      }
      const base = f.opcoes?.length
        ? f.opcoes
        : [...conta.keys()].sort((a, b) => a.localeCompare(b, "pt")).map((v) => ({ v, label: v }));
      out[f.k] = base
        .filter((o) => conta.get(String(o.v)) || filtros[f.k] === String(o.v))
        .map((o) => ({ v: o.v, label: `${o.label} (${conta.get(String(o.v)) || 0})` }));
    }
    return out;
  }, [facetas, itens, passa, filtros]);

  const visiveis = useMemo(() => {
    const lista = itens.filter((it) => passa(it));
    const o = ordens.find((x) => x.k === ordem);
    if (o) {
      const dir = o.desc ? -1 : 1;
      lista.sort((a, b) => {
        const va = a.ordem?.[o.k];
        const vb = b.ordem?.[o.k];
        // Vazios sempre no fim.
        if (va === undefined || va === null || va === "") return 1;
        if (vb === undefined || vb === null || vb === "") return -1;
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
        return String(va).localeCompare(String(vb), "pt", { numeric: true }) * dir;
      });
    }
    return lista;
  }, [itens, passa, ordem, ordens]);

  const ativos = !!q || Object.values(filtros).some(Boolean) || !!dias;

  return (
    <>
      <div className="lf-barra">
        <input
          type="search"
          className="lf-busca"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label="Pesquisar"
        />
        {facetas.map((f) => (
          <select
            key={f.k}
            value={filtros[f.k] || ""}
            onChange={(e) => setFiltros((x) => ({ ...x, [f.k]: e.target.value }))}
            aria-label={f.label}
          >
            <option value="">{f.label}: todos</option>
            {opcoes[f.k].map((o) => (
              <option key={o.v} value={o.v}>{o.label}</option>
            ))}
          </select>
        ))}
        {periodo && (
          <select value={dias} onChange={(e) => setDias(e.target.value)} aria-label="Período">
            {PERIODOS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        )}
        {ordens.length > 1 && (
          <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar por">
            {ordens.map((o) => (
              <option key={o.k} value={o.k}>Ordenar: {o.label}</option>
            ))}
          </select>
        )}
        {ativos && (
          <button
            type="button"
            className="lf-limpar"
            onClick={() => {
              setQ("");
              setFiltros({});
              setDias("");
            }}
          >
            Limpar
          </button>
        )}
        <span className="lf-contagem" role="status">
          {visiveis.length === itens.length ? `${itens.length}` : `${visiveis.length} de ${itens.length}`}
        </span>
      </div>
      <div className={className}>
        {visiveis.length === 0 && itens.length > 0 ? (
          <div className="empty-state"><p>{vazio}</p></div>
        ) : (
          visiveis.map((it) => <div key={it.id} className="lf-item">{it.node}</div>)
        )}
      </div>
    </>
  );
}
