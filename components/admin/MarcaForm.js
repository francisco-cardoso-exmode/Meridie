"use client";

import { useState } from "react";
import VersaoInglesa from "@/components/admin/VersaoInglesa";
import ImageUploader from "@/components/admin/ImageUploader";
import { AREAS_MARCA } from "@/lib/areasMarca";
import { pedidoAdmin, useAvisoSaida, useEnEditado, novoId } from "@/lib/adminCliente";
import { slugify } from "@/lib/slug";

// Características: uma por linha, "Etiqueta | valor".
const caracParaTexto = (c) => (Array.isArray(c) ? c.map(([k, v]) => `${k} | ${v}`).join("\n") : "");
const textoParaCarac = (t) =>
  (t || "")
    .split("\n")
    .map((l) => l.split("|"))
    .filter((p) => p.length >= 2 && p[0].trim())
    .map(([k, ...v]) => [k.trim(), v.join("|").trim()]);

export default function MarcaForm({ initial = null }) {
  const editing = !!initial;
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const { enEditado, temEnEditado, enMostrado, mudarEn } = useEnEditado(initial?.en);
  const [f, setF] = useState({
    nome: initial?.nome || "",
    area: initial?.area || "bebidas",
    origem: initial?.origem || "",
    texto: initial?.texto || "",
    url: initial?.url || "",
    logo: initial?.logo || "",
    imagens: initial?.imagens || [],
    // Cada produto tem um id estável (chave do React e da tradução, que assim
    // acompanha o produto quando se reordena); os antigos, sem id, ficam com
    // "i<posição>" — o servidor reconhece-os assim.
    produtos: (initial?.produtos || []).map((p, i) => ({
      ...p,
      id: p.id || `i${i}`,
      caracTexto: caracParaTexto(p.caracteristicas),
    })),
    ordem: initial?.ordem ?? "",
    mostrarHome: initial?.mostrarHome ?? true,
    ativo: initial?.ativo !== false,
  });
  // Aviso ao sair com alterações por gravar.
  const [inicialJson] = useState(() => JSON.stringify(f));
  const libertar = useAvisoSaida(JSON.stringify(f) !== inicialJson || temEnEditado);

  const set = (k) => (e) =>
    setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  // Produtos: lista editável (nome, descrição, foto) — pelo id, não pela posição.
  const setProd = (id, k, v) =>
    setF((p) => ({ ...p, produtos: p.produtos.map((x) => (x.id === id ? { ...x, [k]: v } : x)) }));
  const addProd = () =>
    setF((p) => ({
      ...p,
      produtos: [...p.produtos, { id: novoId(), nome: "", descricao: "", imagem: "", caracTexto: "" }],
    }));
  const delProd = (id) =>
    setF((p) => ({ ...p, produtos: p.produtos.filter((x) => x.id !== id) }));
  const moveProd = (i, d) =>
    setF((p) => {
      const l = [...p.produtos];
      const j = i + d;
      if (j < 0 || j >= l.length) return p;
      [l[i], l[j]] = [l[j], l[i]];
      return { ...p, produtos: l };
    });

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
      produtos: f.produtos
        .map((p) => ({
          id: p.id,
          nome: p.nome.trim(),
          descricao: (p.descricao || "").trim(),
          imagem: p.imagem || "",
          caracteristicas: textoParaCarac(p.caracTexto ?? caracParaTexto(p.caracteristicas)),
        }))
        .filter((p) => p.nome),
      ordem: f.ordem === "" ? 99 : Number(f.ordem),
      mostrarHome: !!f.mostrarHome,
      ativo: !!f.ativo,
    };
    const url = editing ? `/api/admin/marcas/${encodeURIComponent(initial.slug)}` : "/api/admin/marcas";
    // Só as correções inglesas feitas nesta edição (o servidor junta-as).
    const r = await pedidoAdmin(url, {
      method: editing ? "PUT" : "POST",
      body: temEnEditado ? { ...doc, enEditado } : doc,
    });
    if (r.ok) {
      libertar();
      window.location.href = "/admin/marcas";
    } else {
      setEstado({ a: "erro", msg: r.erro });
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
        <span className="uf-label">Produtos ({f.produtos.length})</span>
        <div className="prod-editor">
          {f.produtos.map((p, i) => (
            <div className="prod-editor-row" key={p.id}>
              <div className="prod-editor-foto">
                <ImageUploader
                  multiple={false}
                  value={p.imagem ? [p.imagem] : []}
                  onChange={(urls) => setProd(p.id, "imagem", urls[0] || "")}
                />
              </div>
              <div className="prod-editor-campos">
                <input value={p.nome} onChange={(e) => setProd(p.id, "nome", e.target.value)} placeholder="Nome do produto" />
                <textarea rows={3} value={p.descricao} onChange={(e) => setProd(p.id, "descricao", e.target.value)} placeholder="Descrição (opcional)" />
                <textarea
                  rows={5}
                  value={p.caracTexto ?? ""}
                  onChange={(e) => setProd(p.id, "caracTexto", e.target.value)}
                  placeholder={"Ficha técnica — uma linha por característica:\nRegião | Vinho Verde\nTeor alcoólico | 11,5% vol."}
                />
                <div className="prod-editor-acoes">
                  <button type="button" className="btn-ghost" onClick={() => moveProd(i, -1)} disabled={i === 0}>↑</button>
                  <button type="button" className="btn-ghost" onClick={() => moveProd(i, 1)} disabled={i === f.produtos.length - 1}>↓</button>
                  <button type="button" className="admin-del" onClick={() => delProd(p.id)}>Remover</button>
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn-ghost" onClick={addProd}>+ Acrescentar produto</button>
        </div>
      </div>
      <div className="uploader-field">
        <span className="uf-label">Fotografias da marca — galeria (a primeira é a capa)</span>
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
      {initial && <VersaoInglesa colecao="marcas" doc={initial} en={enMostrado} onChange={mudarEn} />}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar" : "Criar marca"}
        </button>
      </div>
    </form>
  );
}
