"use client";

import { useState } from "react";
import VersaoInglesa from "@/components/admin/VersaoInglesa";
import ImageUploader from "@/components/admin/ImageUploader";
import { CATEGORIAS_PARCEIRO } from "@/lib/categoriasParceiro";

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function AnuncioForm({ initial = null }) {
  const editing = !!initial;
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const [en, setEn] = useState(initial?.en || null);
  const [f, setF] = useState({
    titulo: initial?.titulo || "",
    texto: initial?.texto || "",
    url: initial?.url || "",
    imagem: initial?.imagem || "",
    categoria: initial?.categoria || "",
    cidade: initial?.cidade || "",
    vantagem: initial?.vantagem || "",
    principal: !!initial?.principal,
    mostrarHome: initial?.mostrarHome ?? true,
    ativo: initial?.ativo !== false,
  });
  const set = (k) => (e) =>
    setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    const doc = {
      slug: editing ? initial.slug : slugify(f.titulo) || `anuncio-${Date.now()}`,
      titulo: f.titulo.trim(),
      texto: f.texto.trim(),
      url: f.url.trim(),
      imagem: f.imagem.trim(),
      categoria: f.categoria,
      cidade: f.cidade.trim(),
      vantagem: f.vantagem.trim(),
      principal: !!f.principal,
      mostrarHome: !!f.mostrarHome,
      ativo: !!f.ativo,
    };
    try {
      const url = editing ? `/api/admin/anuncios/${initial.slug}` : "/api/admin/anuncios";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(en ? { ...doc, en } : doc),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        window.location.href = "/admin/publicidade";
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
        Título
        <input value={f.titulo} onChange={set("titulo")} required placeholder="Hotel Meireles" />
      </label>
      <label className="full">
        Categoria
        <select value={f.categoria} onChange={set("categoria")}>
          <option value="">— sem categoria —</option>
          {CATEGORIAS_PARCEIRO.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="full">
        Cidade · país (opcional)
        <input value={f.cidade} onChange={set("cidade")} placeholder="Fortaleza · Brasil" />
      </label>
      <label className="full">
        Texto
        <textarea rows={2} value={f.texto} onChange={set("texto")} placeholder="Estadia com desconto para clientes Meridie" />
      </label>
      <label className="full">
        Link (site do hotel/restaurante, ou /regioes/fortaleza para uma região)
        <input value={f.url} onChange={set("url")} placeholder="https://... ou /regioes/fortaleza" />
      </label>
      <div className="uploader-field">
        <span className="uf-label">Imagem</span>
        <ImageUploader
          multiple={false}
          value={f.imagem ? [f.imagem] : []}
          onChange={(urls) => setF((p) => ({ ...p, imagem: urls[0] || "" }))}
        />
      </div>
      <label className="full">
        Vantagem para clientes Meridie (opcional)
        <input value={f.vantagem} onChange={set("vantagem")} placeholder="10% de desconto na estadia" />
      </label>
      <label className="check-inline">
        <input type="checkbox" checked={f.principal} onChange={set("principal")} />
        Patrocinador principal (aparece em grande no topo da página de parceiros)
      </label>
      <label className="check-inline">
        <input type="checkbox" checked={f.mostrarHome} onChange={set("mostrarHome")} />
        Mostrar na Home (antes do footer)
      </label>
      <label className="check-inline">
        <input type="checkbox" checked={f.ativo} onChange={set("ativo")} />
        Ativo
      </label>
      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      {initial && <VersaoInglesa colecao="anuncios" doc={initial} en={en} onChange={setEn} />}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar" : "Criar parceiro"}
        </button>
      </div>
    </form>
  );
}
