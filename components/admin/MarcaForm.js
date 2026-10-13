"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import { AREAS_MARCA } from "@/lib/areasMarca";

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function MarcaForm({ initial = null }) {
  const editing = !!initial;
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const [f, setF] = useState({
    nome: initial?.nome || "",
    area: initial?.area || "bebidas",
    origem: initial?.origem || "",
    texto: initial?.texto || "",
    url: initial?.url || "",
    logo: initial?.logo || "",
    imagens: initial?.imagens || [],
    ordem: initial?.ordem ?? "",
    mostrarHome: initial?.mostrarHome ?? true,
    ativo: initial?.ativo !== false,
  });
  const set = (k) => (e) =>
    setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    const doc = {
      slug: editing ? initial.slug : slugify(f.nome) || `marca-${Date.now()}`,
      nome: f.nome.trim(),
      area: f.area,
      origem: f.origem.trim(),
      texto: f.texto.trim(),
      url: f.url.trim(),
      logo: f.logo.trim(),
      imagens: f.imagens,
      ordem: Number(f.ordem) || 99,
      mostrarHome: !!f.mostrarHome,
      ativo: !!f.ativo,
    };
    try {
      const url = editing ? `/api/admin/marcas/${initial.slug}` : "/api/admin/marcas";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        window.location.href = "/admin/marcas";
      } else {
        setEstado({ a: "erro", msg: json.erro || "Erro ao guardar." });
      }
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit} style={{ maxWidth: 640 }}>
      <label className="full">
        Nome da marca
        <input value={f.nome} onChange={set("nome")} required placeholder="Quinta da Levada" />
      </label>
      <label className="full">
        Área
        <select value={f.area} onChange={set("area")}>
          {Object.entries(AREAS_MARCA).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </label>
      <label className="full">
        Origem / categoria (linha pequena por cima do nome)
        <input value={f.origem} onChange={set("origem")} placeholder="Vinho Verde · Amarante" />
      </label>
      <label className="full">
        Texto curto
        <textarea rows={3} value={f.texto} onChange={set("texto")} placeholder="Duas ou três linhas sobre a marca" />
      </label>
      <label className="full">
        Link (site ou loja da marca — opcional)
        <input value={f.url} onChange={set("url")} placeholder="https://..." />
      </label>
      <div className="uploader-field">
        <span className="uf-label">Fotografias (a primeira é a principal)</span>
        <ImageUploader value={f.imagens} onChange={(urls) => setF((p) => ({ ...p, imagens: urls }))} />
      </div>
      <div className="uploader-field">
        <span className="uf-label">Logótipo (opcional — aparece na faixa da Home)</span>
        <ImageUploader
          multiple={false}
          value={f.logo ? [f.logo] : []}
          onChange={(urls) => setF((p) => ({ ...p, logo: urls[0] || "" }))}
        />
      </div>
      <label className="full">
        Ordem (1 aparece primeiro)
        <input type="number" value={f.ordem} onChange={set("ordem")} placeholder="1" />
      </label>
      <label className="check-inline">
        <input type="checkbox" checked={f.mostrarHome} onChange={set("mostrarHome")} />
        Mostrar na Home
      </label>
      <label className="check-inline">
        <input type="checkbox" checked={f.ativo} onChange={set("ativo")} />
        Ativa (visível no site)
      </label>
      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar" : "Criar marca"}
        </button>
      </div>
    </form>
  );
}
