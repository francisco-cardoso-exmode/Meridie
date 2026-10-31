"use client";

import { Fragment, useState } from "react";
import VersaoInglesa from "@/components/admin/VersaoInglesa";
import Icon, { NOMES_ICONES } from "@/components/Icon";
import { pedidoAdmin, useAvisoSaida, useEnEditado, novoId } from "@/lib/adminCliente";

// Editor de uma lista (cartões, passos, perguntas…): acrescentar, remover,
// reordenar e editar cada campo. Os itens vão pelo id, não pela posição.
function ListaEditor({ campo, itens, onChange }) {
  const max = campo.max || 60;
  const muda = (id, k, v) => onChange(itens.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const move = (i, d) => {
    const l = [...itens];
    [l[i], l[i + d]] = [l[i + d], l[i]];
    onChange(l);
  };
  const novo = () => ({ id: novoId(), ...Object.fromEntries(campo.itens.map((c) => [c.k, ""])) });

  return (
    <div className="uploader-field full">
      <span className="uf-label">{campo.label} ({itens.length})</span>
      <div className="prod-editor">
        {itens.map((item, i) => (
          <div className="prod-editor-row lista-editor-row" key={item.id}>
            <div className="prod-editor-campos">
              {campo.itens.map((c) => (
                <label key={c.k}>
                  {c.label}
                  {c.tipo === "icone" ? (
                    <span className="lista-editor-icone">
                      <select value={item[c.k] || ""} onChange={(e) => muda(item.id, c.k, e.target.value)}>
                        <option value="">— sem ícone —</option>
                        {NOMES_ICONES.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      {item[c.k] && <Icon name={item[c.k]} size={22} />}
                    </span>
                  ) : c.tipo === "textarea" ? (
                    <textarea rows={3} value={item[c.k] || ""} onChange={(e) => muda(item.id, c.k, e.target.value)} />
                  ) : (
                    <input value={item[c.k] || ""} onChange={(e) => muda(item.id, c.k, e.target.value)} />
                  )}
                </label>
              ))}
              <div className="prod-editor-acoes">
                <button type="button" className="btn-ghost" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" className="btn-ghost" onClick={() => move(i, 1)} disabled={i === itens.length - 1}>↓</button>
                <button type="button" className="admin-del" onClick={() => onChange(itens.filter((x) => x.id !== item.id))}>
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
        {itens.length < max && (
          <button type="button" className="btn-ghost" onClick={() => onChange([...itens, novo()])}>
            + Acrescentar
          </button>
        )}
      </div>
    </div>
  );
}

export default function ConteudoForm({ pagina, campos, valores, enMostrado = {} }) {
  const [f, setF] = useState(() => {
    const o = {};
    campos.forEach((c) => (o[c.k] = c.tipo === "lista" ? (Array.isArray(valores?.[c.k]) ? valores[c.k] : []) : valores?.[c.k] ?? ""));
    return o;
  });
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  // Só os campos ingleses corrigidos à mão nesta edição (o servidor junta-os
  // ao inglês atual da base).
  const en = useEnEditado(enMostrado);
  // Aviso ao sair com alterações por gravar (deixa de avisar depois de gravar).
  const instantaneo = () => JSON.stringify([f, en.enEditado]);
  const [gravado, setGravado] = useState(() => JSON.stringify([f, {}]));
  useAvisoSaida(instantaneo() !== gravado);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  // Nome legível no painel inglês: "diferenciais.dif1.titulo" → "Cartões #1 · Título".
  function rotulo(caminho) {
    const [k, id, sub] = caminho.split(".");
    const c = campos.find((x) => x.k === k);
    if (!c) return null;
    const pre = c.grupo ? `${c.grupo} · ` : "";
    if (c.tipo !== "lista") return pre + c.label;
    const i = (valores?.[k] || []).findIndex((x) => x.id === id);
    const item = c.itens.find((x) => x.k === sub);
    return `${pre}${c.label} #${i + 1} · ${item?.label || sub}`;
  }

  async function guardar(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    const r = await pedidoAdmin(`/api/admin/paginas/${encodeURIComponent(pagina)}`, {
      body: en.temEnEditado ? { campos: f, enEditado: en.enEditado } : { campos: f },
    });
    if (r.ok) {
      setGravado(instantaneo());
      setEstado({ a: "ok", msg: "Guardado. A versão inglesa é atualizada automaticamente." });
    } else {
      setEstado({ a: "erro", msg: r.erro });
    }
  }

  return (
    <form className="admin-form" onSubmit={guardar}>
      {campos.map((c, i) => (
        <Fragment key={c.k}>
          {c.grupo && c.grupo !== campos[i - 1]?.grupo && <h2 className="conteudo-grupo">{c.grupo}</h2>}
          {c.tipo === "lista" ? (
            <ListaEditor campo={c} itens={f[c.k]} onChange={(l) => setF((p) => ({ ...p, [c.k]: l }))} />
          ) : (
            <label className="full">
              {c.label}
              {c.tipo === "textarea" ? (
                <textarea rows={3} value={f[c.k]} onChange={set(c.k)} />
              ) : (
                <input value={f[c.k]} onChange={set(c.k)} />
              )}
            </label>
          )}
        </Fragment>
      ))}
      {estado.a === "ok" && <div className="form-msg ok">{estado.msg}</div>}
      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      <VersaoInglesa
        colecao="paginas"
        doc={{ campos: valores }}
        en={en.enMostrado}
        onChange={en.mudarEn}
        rotulo={rotulo}
      />
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
