"use client";

import { useMemo, useState, useEffect } from "react";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";
import { referenciaDe, PAIS_LABEL, precoEmEuros } from "@/lib/empreendimentos";
import { useTaxaEurBrl } from "@/components/CambioProvider";
import { enviarEvento } from "@/components/Track";
import { useT } from "@/components/LangProvider";
import L from "@/components/L";

const ORDENACOES = {
  destaque: "Em destaque",
  "preco-asc": "Preço (mais baixo)",
  "preco-desc": "Preço (mais alto)",
  "area-desc": "Área (maior)",
};

// Faixas de preço, sempre em euros (os investidores pensam em €; imóveis em R$
// são convertidos ao câmbio do momento). No Brasil os valores são mais baixos,
// por isso a oferta só do Brasil (ou com o filtro Brasil) tem faixas próprias.
const FAIXAS_EUR = {
  "": "Qualquer preço",
  "0-200000": "Até 200.000 €",
  "200000-400000": "200.000 – 400.000 €",
  "400000-700000": "400.000 – 700.000 €",
  "700000-1000000": "700.000 € – 1M €",
  "1000000-": "Mais de 1M €",
};
const FAIXAS_BRL = {
  "": "Qualquer preço",
  "b0-70000": "Até 70.000 €",
  "b70000-100000": "70.000 – 100.000 €",
  "b100000-150000": "100.000 – 150.000 €",
  "b150000-250000": "150.000 – 250.000 €",
  "b250000-": "Mais de 250.000 €",
};
const FAIXAS = { ...FAIXAS_EUR, ...FAIXAS_BRL };

// Ordem canónica dos estados do imóvel (do mais inicial ao concluído).
export const ESTADOS_ORDEM = [
  "Em planta",
  "Pré-lançamento",
  "Lançamento",
  "Em construção",
  "Pronto",
];

// Imóvel sem preço publicado ("sob consulta" ou sem valor): não entra nos
// filtros de preço e fica sempre no fim quando se ordena por preço.
const semPreco = (e) => e.precoTipo === "consulta" || !(Number(e.preco) > 0);

// Filtros ↔ query string (?q=&pais=&zona=…), para a pesquisa poder ser partilhada.
const PARAMS = {
  texto: "q",
  pais: "pais",
  zona: "zona",
  tipo: "tipo",
  finalidade: "fin",
  estado: "estado",
  preco: "preco",
  ordenacao: "ord",
};

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
  const { t: tr } = useT();
  const ESTADO_INICIAL = {
    texto: "",
    pais: "",
    zona: "",
    tipo: "",
    finalidade: "",
    estado: "",
    preco: "",
    ordenacao: "destaque",
  };
  const [f, setF] = useState(ESTADO_INICIAL);
  const [aberto, setAberto] = useState(!colapsavel);
  // Câmbio do momento: os imóveis em R$ são convertidos para € ao filtrar/ordenar.
  const taxa = useTaxaEurBrl();

  // Faixas em reais quando a oferta é só do Brasil (ou se filtrou o Brasil).
  const soBrasil = empreendimentos.length > 0 && empreendimentos.every((e) => e.moeda === "BRL");
  const faixas = soBrasil || f.pais === "brasil" ? FAIXAS_BRL : FAIXAS_EUR;
  useEffect(() => {
    if (f.preco && !(f.preco in faixas)) setF((prev) => ({ ...prev, preco: "" }));
  }, [faixas, f.preco]);

  // Estados presentes nos dados, pela ordem canónica.
  const estados = ESTADOS_ORDEM.filter((s) =>
    empreendimentos.some((e) => e.estado === s)
  );

  const set = (campo) => (ev) => setF((prev) => ({ ...prev, [campo]: ev.target.value }));
  // Como `set`, mas regista o filtro usado (analytics).
  const setFiltro = (campo) => (ev) => {
    set(campo)(ev);
    if (ev.target.value) enviarEvento("filtro", `${campo}: ${ev.target.value}`);
  };
  const reset = () => setF(ESTADO_INICIAL);

  // Ao montar, aplica os filtros que vierem no URL (só valores válidos).
  // Lê window.location em vez de useSearchParams para a página continuar
  // estática (e a lista completa no HTML) — os filtros entram depois.
  const [lidoDoUrl, setLidoDoUrl] = useState(false);
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const validos = {
      pais: paises,
      zona: zonas,
      tipo: tipos,
      finalidade: finalidades,
      estado: ESTADOS_ORDEM,
      preco: Object.keys(FAIXAS),
      ordenacao: Object.keys(ORDENACOES),
    };
    const novo = {};
    for (const [campo, chave] of Object.entries(PARAMS)) {
      const v = sp.get(chave);
      if (!v) continue;
      if (campo === "texto" ? comBusca : (validos[campo] || []).includes(v)) novo[campo] = v;
    }
    if (Object.keys(novo).length) {
      setF((prev) => ({ ...prev, ...novo }));
      if (colapsavel && Object.keys(novo).some((k) => k !== "texto")) setAberto(true);
    }
    setLidoDoUrl(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escreve os filtros ativos na query string (sem recarregar nem criar histórico).
  useEffect(() => {
    if (!lidoDoUrl) return;
    const url = new URL(window.location.href);
    for (const [campo, chave] of Object.entries(PARAMS)) {
      const v = f[campo];
      if (v && v !== ESTADO_INICIAL[campo]) url.searchParams.set(chave, v);
      else url.searchParams.delete(chave);
    }
    if (url.href !== window.location.href) {
      window.history.replaceState(window.history.state, "", url.href);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, lidoDoUrl]);

  // Regista a pesquisa (depois de o utilizador parar de escrever).
  useEffect(() => {
    const q = f.texto.trim().toLowerCase();
    if (q.length < 2) return;
    const t = setTimeout(() => enviarEvento("pesquisa", q), 900);
    return () => clearTimeout(t);
  }, [f.texto]);

  const resultados = useMemo(() => {
    const q = norm(f.texto);
    const precoEur = (e) => precoEmEuros(e, taxa);
    let lista = empreendimentos.filter((e) => {
      if (comPais && f.pais && e.pais !== f.pais) return false;
      if (f.zona && e.zona !== f.zona) return false;
      if (f.tipo && e.tipo !== f.tipo) return false;
      if (f.finalidade && e.finalidade !== f.finalidade) return false;
      if (f.estado && e.estado !== f.estado) return false;
      if (f.preco) {
        if (semPreco(e)) return false;
        const [min, max] = f.preco.replace(/^b/, "").split("-").map(Number);
        const v = precoEur(e);
        if (min && v < min) return false;
        if (max && v > max) return false;
      }
      if (q) {
        const alvo = norm(
          [
            e.nome,
            e.cidade,
            e.zona,
            e.tipo,
            e.finalidade,
            // Em inglês, também as etiquetas traduzidas ("Apartment", "Holiday"…).
            tr(e.tipo),
            tr(e.finalidade),
            tr(e.estado),
            tr(PAIS_LABEL[e.pais] || ""),
            e.construtora,
            referenciaDe(e),
          ].join(" ")
        );
        if (!alvo.includes(q)) return false;
      }
      return true;
    });

    // Sem preço vai sempre para o fim, nas duas ordens.
    const porPreco = (dir) => (a, b) =>
      semPreco(a) - semPreco(b) || dir * (precoEur(a) - precoEur(b));
    const ord = {
      "preco-asc": porPreco(1),
      "preco-desc": porPreco(-1),
      "area-desc": (a, b) => b.area - a.area,
      destaque: (a, b) => Number(b.destaque) - Number(a.destaque),
    }[f.ordenacao];

    return [...lista].sort(ord);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empreendimentos, f, comPais, taxa]);

  const ativo =
    f.texto ||
    (comPais && f.pais) ||
    f.zona ||
    f.tipo ||
    f.finalidade ||
    f.estado ||
    f.preco ||
    f.ordenacao !== "destaque";

  // Sem nenhum imóvel publicado (não é um filtro): convite ao contacto em vez
  // de "nenhum resultado" e de filtros que não filtram nada.
  if (!empreendimentos.length)
    return (
      <div className="empty-state sem-oferta">
        <h3>{tr("Estamos a selecionar os próximos imóveis")}</h3>
        <p>{tr("Diz-nos o que procuras — zona, tipologia e orçamento — e enviamos-te as oportunidades antes de serem publicadas.")}</p>
        <L href="/contactos" className="btn btn-primary">
          {tr("Dizer o que procuro")}
        </L>
      </div>
    );

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
                placeholder={tr("Pesquisar por nome, cidade, zona, referência…")}
                aria-label={tr("Pesquisar empreendimentos")}
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
              {tr("Filtros")} {aberto ? "▴" : "▾"}
            </button>
          )}
        </div>
      )}

      {aberto && (
        <div className="filters">
          {comPais && (
            <div className="filter">
              <label htmlFor="f-pais">{tr("País")}</label>
              <select id="f-pais" value={f.pais} onChange={setFiltro("pais")}>
                <option value="">{tr("Portugal e Brasil")}</option>
                {paises.map((p) => (
                  <option key={p} value={p}>
                    {tr(PAIS_LABEL[p] || p)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="filter">
            <label htmlFor="f-zona">{tr("Zona")}</label>
            <select id="f-zona" value={f.zona} onChange={setFiltro("zona")}>
              <option value="">{tr("Todas as zonas")}</option>
              {zonas.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
          <div className="filter">
            <label htmlFor="f-tipo">{tr("Tipologia")}</label>
            <select id="f-tipo" value={f.tipo} onChange={setFiltro("tipo")}>
              <option value="">{tr("Todas as tipologias")}</option>
              {tipos.map((t) => (
                <option key={t} value={t}>{tr(t)}</option>
              ))}
            </select>
          </div>
          {estados.length > 0 && (
            <div className="filter">
              <label htmlFor="f-estado">{tr("Estado")}</label>
              <select id="f-estado" value={f.estado} onChange={setFiltro("estado")}>
                <option value="">{tr("Qualquer estado")}</option>
                {estados.map((x) => (
                  <option key={x} value={x}>{tr(x)}</option>
                ))}
              </select>
            </div>
          )}
          <div className="filter">
            <label htmlFor="f-preco">{tr("Preço")}</label>
            <select id="f-preco" value={f.preco} onChange={setFiltro("preco")}>
              {Object.entries(faixas).map(([v, l]) => (
                <option key={v} value={v}>{tr(l)}</option>
              ))}
            </select>
          </div>
          <div className="filter">
            <label htmlFor="f-ord">{tr("Ordenar por")}</label>
            <select id="f-ord" value={f.ordenacao} onChange={set("ordenacao")}>
              {Object.entries(ORDENACOES).map(([v, l]) => (
                <option key={v} value={v}>{tr(l)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="filters-meta">
        <span className="filters-count">
          <strong>{resultados.length}</strong>{" "}
          {resultados.length === 1 ? tr("empreendimento") : tr("empreendimentos")}
        </span>
        {ativo && (
          <button type="button" className="btn-reset" onClick={reset}>
            {tr("Limpar filtros")}
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
          <p>{tr("Nenhum empreendimento corresponde à pesquisa.")}</p>
          <button type="button" className="btn-reset" onClick={reset}>
            {tr("Limpar filtros")}
          </button>
        </div>
      )}
    </>
  );
}
