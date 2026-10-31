"use client";

import { useState } from "react";
import VersaoInglesa from "@/components/admin/VersaoInglesa";
import ImageUploader from "@/components/admin/ImageUploader";
import { CATEGORIAS_PARCEIRO } from "@/lib/categoriasParceiro";
import { pedidoAdmin, useAvisoSaida, useEnEditado } from "@/lib/adminCliente";
import { slugify } from "@/lib/slug";

export default function AnuncioForm({ initial = null }) {
  const editing = !!initial;
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const { enEditado, temEnEditado, enMostrado, mudarEn } = useEnEditado(initial?.en);
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
  // Aviso ao sair com alterações por gravar.
  const [inicialJson] = useState(() => JSON.stringify(f));
  const libertar = useAvisoSaida(JSON.stringify(f) !== inicialJson || temEnEditado);

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
    const url = editing ? `/api/admin/anuncios/${encodeURIComponent(initial.slug)}` : "/api/admin/anuncios";
    // Só as correções inglesas feitas nesta edição (o servidor junta-as).
    const r = await pedidoAdmin(url, {
      method: editing ? "PUT" : "POST",
      body: temEnEditado ? { ...doc, enEditado } : doc,
    });
    if (r.ok) {
      libertar();
      window.location.href = "/admin/publicidade";
    } else {
      setEstado({ a: "erro", msg: r.erro });
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
      {initial && <VersaoInglesa colecao="anuncios" doc={initial} en={enMostrado} onChange={mudarEn} />}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar" : "Criar parceiro"}
        </button>
      </div>
    </form>
  );
}
