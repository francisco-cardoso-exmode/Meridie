"use client";

import { useState } from "react";
import VersaoInglesa from "@/components/admin/VersaoInglesa";
import { pedidoAdmin, useAvisoSaida, useEnEditado } from "@/lib/adminCliente";

export default function ConteudoForm({ pagina, campos, valores, enMostrado = {} }) {
  const [f, setF] = useState(() => {
    const o = {};
    campos.forEach((c) => (o[c.k] = valores?.[c.k] ?? ""));
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
      {campos.map((c) => (
        <label className="full" key={c.k}>
          {c.label}
          {c.tipo === "textarea" ? (
            <textarea rows={3} value={f[c.k]} onChange={set(c.k)} />
          ) : (
            <input value={f[c.k]} onChange={set(c.k)} />
          )}
        </label>
      ))}
      {estado.a === "ok" && <div className="form-msg ok">{estado.msg}</div>}
      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      <VersaoInglesa
        colecao="paginas"
        doc={{ campos: valores }}
        en={en.enMostrado}
        onChange={en.mudarEn}
      />
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
