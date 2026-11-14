"use client";

import { useState } from "react";
import VersaoInglesa from "@/components/admin/VersaoInglesa";
import ImageUploader from "@/components/admin/ImageUploader";
import CaracteristicasEditor, { opcoesPendentes } from "@/components/admin/CaracteristicasEditor";
import { pedidoAdmin, useAvisoSaida, useEnEditado } from "@/lib/adminCliente";
import { slugify } from "@/lib/slug";

// `topo`: categorias de topo que podem ser mãe ([{ slug, nome }]);
// `temFilhas`: esta categoria tem subcategorias (não pode passar a subcategoria).
export default function CategoriaForm({ initial = null, topo = [], parentInicial = "", temFilhas = false }) {
  const editing = !!initial;
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const { enEditado, temEnEditado, enMostrado, mudarEn } = useEnEditado(initial?.en);
  const [f, setF] = useState({
    nome: initial?.nome || "",
    parent: initial ? initial.parent || "" : parentInicial,
    descricao: initial?.descricao || "",
    imagem: initial?.imagem || "",
    ordem: initial?.ordem ?? "",
    ativo: initial?.ativo !== false,
    caracteristicas: initial?.caracteristicas || [],
  });
  const [inicialJson] = useState(() => JSON.stringify(f));
  const libertar = useAvisoSaida(JSON.stringify(f) !== inicialJson || temEnEditado);
  const set = (k) => (e) =>
    setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    const doc = {
      slug: editing ? initial.slug : slugify(f.nome),
      nome: f.nome.trim(),
      parent: f.parent || null,
      descricao: f.descricao.trim(),
      imagem: f.imagem,
      ordem: f.ordem === "" ? 99 : Number(f.ordem),
      ativo: !!f.ativo,
      caracteristicas: opcoesPendentes(e.currentTarget, f.caracteristicas)
        .map((c) => ({ ...c, nome: c.nome.trim(), opcoes: c.opcoes.filter((o) => o.nome.trim()) }))
        .filter((c) => c.nome),
    };
    const url = editing ? `/api/admin/categorias/${encodeURIComponent(initial.slug)}` : "/api/admin/categorias";
    const r = await pedidoAdmin(url, { method: editing ? "PUT" : "POST", body: temEnEditado ? { ...doc, enEditado } : doc });
    if (r.ok) {
      libertar();
      window.location.href = "/admin/categorias";
    } else setEstado({ a: "erro", msg: r.erro });
  }

  const maes = topo.filter((c) => !initial || c.slug !== initial.slug);
  return (
    <form className="admin-form" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
      <label className="full">
        Nome
        <input value={f.nome} onChange={set("nome")} required placeholder="Vinho" />
        {!editing && f.nome && <small>Endereço: /representacoes/{slugify(f.nome)}</small>}
      </label>
      <label className="full">
        Dentro de (categoria-mãe)
        <select value={f.parent} onChange={set("parent")} disabled={temFilhas}>
          <option value="">— nenhuma: é uma categoria de topo —</option>
          {maes.map((c) => (
            <option key={c.slug} value={c.slug}>{c.nome}</option>
          ))}
        </select>
        {temFilhas && <small>Tem subcategorias — fica como categoria de topo.</small>}
      </label>
      <label className="full">
        Descrição curta (aparece no cartão e no topo da página da categoria)
        <textarea rows={3} value={f.descricao} onChange={set("descricao")} />
      </label>
      {!f.parent && (
        <div className="uploader-field">
          <span className="uf-label">Imagem do cartão (opcional — sem imagem, usa a do 1.º produto)</span>
          <ImageUploader
            multiple={false}
            value={f.imagem ? [f.imagem] : []}
            onChange={(urls) => setF((p) => ({ ...p, imagem: urls[0] || "" }))}
          />
        </div>
      )}
      <fieldset className="admin-fieldset full">
        <legend>Características (filtros no site)</legend>
        <p className="admin-ajuda">
          Ex.: no Vinho, «Tipo» com Branco, Tinto, Rosé e «Região» com Douro, Porto, Gaia… Em cada produto
          escolhe-se uma opção de cada, e no site aparecem como filtros.
          {f.parent ? " As da categoria-mãe também valem aqui." : " Valem também para todas as subcategorias desta."}
        </p>
        <CaracteristicasEditor
          value={f.caracteristicas}
          onChange={(caracteristicas) => setF((p) => ({ ...p, caracteristicas }))}
        />
      </fieldset>
      <label className="full">
        Ordem (1 aparece primeiro — também se muda com ↑ ↓ na lista)
        <input type="number" value={f.ordem} onChange={set("ordem")} placeholder="1" />
      </label>
      <label className="check-inline">
        <input type="checkbox" checked={f.ativo} onChange={set("ativo")} />
        Ativa (visível no site — desligada, esconde também os produtos dela)
      </label>
      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      {initial && <VersaoInglesa colecao="categorias" doc={initial} en={enMostrado} onChange={mudarEn} />}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar" : "Criar categoria"}
        </button>
      </div>
    </form>
  );
}
