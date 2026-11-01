"use client";

import { confirmar } from "@/lib/dialogo";
import { useState } from "react";
import FotosAl from "@/components/al/FotosAl";
import { pedidoAl } from "@/lib/al/cliente";
import Icon from "@/components/Icon";

// Verificações rápidas (opcionais) em cada divisão.
const CHECKLIST = {
  inspecao_entrada: ["Limpa", "Sem danos visíveis", "Roupa/toalhas no lugar", "Equipamentos a funcionar"],
  inspecao_saida: ["Sem danos", "Inventário completo", "Sem objetos esquecidos", "Equipamentos a funcionar"],
  limpeza: ["Pó e superfícies", "Chão", "Roupa trocada", "Consumíveis repostos"],
};

const ESTADOS = [
  { k: "ok", rot: "OK", cls: "ok" },
  { k: "atencao", rot: "Atenção", cls: "atencao" },
  { k: "dano", rot: "Dano", cls: "dano" },
];

/**
 * App da equipa — fluxo guiado de uma tarefa: começar → divisão a divisão
 * (fotos com a câmara, estado OK/Atenção/Dano, notas, verificações) →
 * concluir. Cada divisão é gravada logo (nada se perde se a rede falhar a
 * meio). Botões grandes para usar com uma mão.
 */
export default function TarefaFluxo({ tarefa, divisoes }) {
  const [t, setT] = useState(tarefa);
  const feitas = Object.fromEntries((t.relatorio?.porDivisao || []).map((d) => [d.divisao, d]));
  const todas = [...new Set([...(divisoes?.length ? divisoes : ["Geral"]), ...Object.keys(feitas)])];
  const [aberta, setAberta] = useState(null);
  const [rascunho, setRascunho] = useState(null);
  const [obs, setObs] = useState(t.relatorio?.observacoes || "");
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const lista = CHECKLIST[t.tipo] || [];

  async function acao(body) {
    setEstado({ a: "loading", msg: "" });
    const r = await pedidoAl(`/api/equipa/tarefas/${t.id}`, { body });
    if (!r.ok) {
      setEstado({ a: "erro", msg: r.status === 401 ? "A sessão expirou — entra de novo noutra janela." : r.erro });
      return false;
    }
    setEstado({ a: "idle", msg: "" });
    return true;
  }

  function abrir(nome) {
    const d = feitas[nome];
    setRascunho({
      divisao: nome,
      fotos: d?.fotos || [],
      estado: d?.estado || "ok",
      notas: d?.notas || "",
      checklist: lista.map((item) => ({ item, ok: !!d?.checklist?.find((c) => c.item === item)?.ok })),
    });
    setAberta(nome);
    window.scrollTo({ top: 0 });
  }

  async function guardarDivisao() {
    if (rascunho.estado !== "ok" && !rascunho.notas.trim() && !rascunho.fotos.length) {
      setEstado({ a: "erro", msg: "Descreve o problema ou tira uma foto." });
      return;
    }
    if (await acao({ acao: "divisao", divisao: rascunho })) {
      setT((x) => ({
        ...x,
        relatorio: { ...(x.relatorio || {}), porDivisao: [...(x.relatorio?.porDivisao || []).filter((d) => d.divisao !== rascunho.divisao), rascunho] },
      }));
      setAberta(null);
    }
  }

  if (t.estado === "concluida")
    return <p className="al-msg ok">Tarefa concluída. Obrigado!</p>;

  if (t.estado === "pendente")
    return (
      <div className="al-fluxo">
        {estado.msg && <p className="al-msg erro">{estado.msg}</p>}
        <button
          type="button"
          className="al-btn al-btn-enorme"
          disabled={estado.a === "loading"}
          onClick={async () => (await acao({ acao: "iniciar" })) && setT((x) => ({ ...x, estado: "em_curso" }))}
        >
          ▶ Começar
        </button>
      </div>
    );

  if (aberta && rascunho)
    return (
      <div className="al-fluxo">
        <button type="button" className="link-botao" onClick={() => setAberta(null)}>
          ← Divisões
        </button>
        <h2>{aberta}</h2>
        <FotosAl value={rascunho.fotos} onChange={(fotos) => setRascunho((r) => ({ ...r, fotos }))} rota="/api/equipa/upload" pasta="inspecoes" />
        <div className="al-estados" role="radiogroup" aria-label="Estado da divisão">
          {ESTADOS.map((e) => (
            <button
              key={e.k}
              type="button"
              role="radio"
              aria-checked={rascunho.estado === e.k}
              className={`al-estado-btn ${e.cls}${rascunho.estado === e.k ? " on" : ""}`}
              onClick={() => setRascunho((r) => ({ ...r, estado: e.k }))}
            >
              {e.rot}
            </button>
          ))}
        </div>
        {lista.length > 0 && (
          <div className="al-checklist">
            {rascunho.checklist.map((c, i) => (
              <label key={c.item} className="al-check al-check-grande">
                <input
                  type="checkbox"
                  checked={c.ok}
                  onChange={(e) =>
                    setRascunho((r) => ({ ...r, checklist: r.checklist.map((x, j) => (j === i ? { ...x, ok: e.target.checked } : x)) }))
                  }
                />
                {c.item}
              </label>
            ))}
          </div>
        )}
        <label className="al-campo">
          Notas
          <textarea rows={3} value={rascunho.notas} onChange={(e) => setRascunho((r) => ({ ...r, notas: e.target.value }))} maxLength={2000} />
        </label>
        {estado.msg && <p className="al-msg erro">{estado.msg}</p>}
        <div className="al-acoes-fixas">
          <button type="button" className="al-btn al-btn-enorme" disabled={estado.a === "loading"} onClick={guardarDivisao}>
            <Icon name="check" size={16} /> Guardar {aberta}
          </button>
        </div>
      </div>
    );

  const nFeitas = todas.filter((d) => feitas[d]).length;
  return (
    <div className="al-fluxo">
      <p className="al-progresso">
        {nFeitas} de {todas.length} divisões
      </p>
      <div className="al-divs-btns">
        {todas.map((d) => (
          <button key={d} type="button" className={`al-div-btn${feitas[d] ? ` feita ${feitas[d].estado}` : ""}`} onClick={() => abrir(d)}>
            <span>{d}</span>
            <small>{feitas[d] ? `${feitas[d].fotos?.length || 0} fotos · ${ESTADOS.find((e) => e.k === feitas[d].estado)?.rot}` : "por fazer"}</small>
          </button>
        ))}
      </div>
      <label className="al-campo">
        Observações gerais
        <textarea rows={3} value={obs} onChange={(e) => setObs(e.target.value)} maxLength={3000} />
      </label>
      {estado.msg && <p className="al-msg erro">{estado.msg}</p>}
      <div className="al-acoes-fixas">
        <button
          type="button"
          className="al-btn al-btn-enorme"
          disabled={estado.a === "loading" || nFeitas === 0}
          onClick={async () => {
            if (nFeitas < todas.length && !(await confirmar(`Faltam ${todas.length - nFeitas} divisões. Concluir mesmo assim?`, { ok: "Concluir" }))) return;
            if (await acao({ acao: "concluir", observacoes: obs })) setT((x) => ({ ...x, estado: "concluida" }));
          }}
        >
          <Icon name="check" size={16} /> Concluir tarefa
        </button>
      </div>
    </div>
  );
}
