"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const linhasParaArray = (s) =>
  (s || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

const arrayParaLinhas = (a) => (Array.isArray(a) ? a.join("\n") : "");

export default function EmpreendimentoForm({ initial = null }) {
  const editing = !!initial;
  const router = useRouter();
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  const [f, setF] = useState({
    slug: initial?.slug || "",
    nome: initial?.nome || "",
    pais: initial?.pais || "portugal",
    cidade: initial?.cidade || "",
    zona: initial?.zona || "",
    tipo: initial?.tipo || "Apartamento",
    finalidade: initial?.finalidade || "Investimento",
    preco: initial?.preco ?? "",
    moeda: initial?.moeda || "EUR",
    quartos: initial?.quartos ?? 1,
    casasBanho: initial?.casasBanho ?? 1,
    area: initial?.area ?? "",
    estado: initial?.estado || "Em construção",
    destaque: initial?.destaque ?? false,
    construtora: initial?.construtora || "",
    morada: initial?.morada || "",
    resumo: initial?.resumo || "",
    descricao: initial?.descricao || "",
    caracteristicas: arrayParaLinhas(initial?.caracteristicas),
    tipologias: arrayParaLinhas(initial?.tipologias),
    proximidades: arrayParaLinhas(initial?.proximidades),
    imagens: arrayParaLinhas(initial?.imagens),
  });

  const set = (campo) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setF((p) => ({ ...p, [campo]: v }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });

    const doc = {
      slug: f.slug.trim(),
      nome: f.nome.trim(),
      pais: f.pais,
      cidade: f.cidade.trim(),
      zona: f.zona.trim(),
      tipo: f.tipo.trim(),
      finalidade: f.finalidade,
      preco: Number(f.preco) || 0,
      moeda: f.moeda,
      quartos: Number(f.quartos) || 0,
      casasBanho: Number(f.casasBanho) || 0,
      area: Number(f.area) || 0,
      estado: f.estado,
      destaque: !!f.destaque,
      resumo: f.resumo.trim(),
      descricao: f.descricao.trim(),
      caracteristicas: linhasParaArray(f.caracteristicas),
      imagens: linhasParaArray(f.imagens),
    };
    if (f.construtora.trim()) doc.construtora = f.construtora.trim();
    if (f.morada.trim()) doc.morada = f.morada.trim();
    if (linhasParaArray(f.tipologias).length)
      doc.tipologias = linhasParaArray(f.tipologias);
    if (linhasParaArray(f.proximidades).length)
      doc.proximidades = linhasParaArray(f.proximidades);

    try {
      const url = editing
        ? `/api/admin/empreendimentos/${initial.slug}`
        : "/api/admin/empreendimentos";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        router.push("/admin/empreendimentos");
        router.refresh();
      } else {
        setEstado({ a: "erro", msg: json.erro || "Erro ao guardar." });
      }
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="admin-form-grid">
        <label>
          Slug (URL) {editing && <small>— não editável</small>}
          <input value={f.slug} onChange={set("slug")} required readOnly={editing} placeholder="ex: vibe-meireles-fortaleza" />
        </label>
        <label>
          Nome
          <input value={f.nome} onChange={set("nome")} required />
        </label>
        <label>
          País
          <select value={f.pais} onChange={set("pais")}>
            <option value="portugal">Portugal</option>
            <option value="brasil">Brasil</option>
          </select>
        </label>
        <label>
          Cidade
          <input value={f.cidade} onChange={set("cidade")} required />
        </label>
        <label>
          Zona
          <input value={f.zona} onChange={set("zona")} required />
        </label>
        <label>
          Tipo
          <input value={f.tipo} onChange={set("tipo")} placeholder="Apartamento, Moradia, Estúdio…" />
        </label>
        <label>
          Finalidade
          <select value={f.finalidade} onChange={set("finalidade")}>
            <option>Investimento</option>
            <option>Habitação</option>
            <option>Férias</option>
          </select>
        </label>
        <label>
          Estado
          <select value={f.estado} onChange={set("estado")}>
            <option>Pronto</option>
            <option>Em construção</option>
            <option>Em planta</option>
          </select>
        </label>
        <label>
          Preço
          <input type="number" value={f.preco} onChange={set("preco")} required />
        </label>
        <label>
          Moeda
          <select value={f.moeda} onChange={set("moeda")}>
            <option value="EUR">EUR (€)</option>
            <option value="BRL">BRL (R$)</option>
          </select>
        </label>
        <label>
          Quartos
          <input type="number" value={f.quartos} onChange={set("quartos")} />
        </label>
        <label>
          Casas de banho
          <input type="number" value={f.casasBanho} onChange={set("casasBanho")} />
        </label>
        <label>
          Área (m²)
          <input type="number" value={f.area} onChange={set("area")} />
        </label>
        <label>
          Construtora (opcional)
          <input value={f.construtora} onChange={set("construtora")} placeholder="marca como 'real' e aparece primeiro" />
        </label>
        <label className="full">
          Morada (opcional)
          <input value={f.morada} onChange={set("morada")} />
        </label>
        <label className="check-inline">
          <input type="checkbox" checked={f.destaque} onChange={set("destaque")} />
          Em destaque (aparece na Home)
        </label>
      </div>

      <label className="full">
        Resumo (frase do card)
        <textarea rows={2} value={f.resumo} onChange={set("resumo")} />
      </label>
      <label className="full">
        Descrição
        <textarea rows={5} value={f.descricao} onChange={set("descricao")} />
      </label>
      <div className="admin-form-grid">
        <label>
          Características (uma por linha)
          <textarea rows={6} value={f.caracteristicas} onChange={set("caracteristicas")} />
        </label>
        <label>
          Tipologias (uma por linha, opcional)
          <textarea rows={6} value={f.tipologias} onChange={set("tipologias")} />
        </label>
        <label>
          Proximidades (uma por linha, opcional)
          <textarea rows={6} value={f.proximidades} onChange={set("proximidades")} />
        </label>
        <label>
          Imagens — URLs (uma por linha)
          <textarea rows={6} value={f.imagens} onChange={set("imagens")} />
        </label>
      </div>

      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar alterações" : "Criar empreendimento"}
        </button>
      </div>
    </form>
  );
}
