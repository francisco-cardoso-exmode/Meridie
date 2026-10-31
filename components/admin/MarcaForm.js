"use client";

import { useState } from "react";
import VersaoInglesa from "@/components/admin/VersaoInglesa";
import ImageUploader from "@/components/admin/ImageUploader";
import Link from "next/link";
import { pedidoAdmin, useAvisoSaida, useEnEditado } from "@/lib/adminCliente";
import { slugify } from "@/lib/slug";

// Os produtos da marca geram-se em Produtos (coleção à parte, cada um com
// categoria e preço). `nProdutos`: quantos tem; os que ainda estão dentro da
// marca (formato antigo) aparecem até se correr a migração.
export default function MarcaForm({ initial = null, nProdutos = 0 }) {
  const editing = !!initial;
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const { enEditado, temEnEditado, enMostrado, mudarEn } = useEnEditado(initial?.en);
  const [f, setF] = useState({
    nome: initial?.nome || "",
    origem: initial?.origem || "",
    texto: initial?.texto || "",
    url: initial?.url || "",
    logo: initial?.logo || "",
    imagens: initial?.imagens || [],
    ordem: initial?.ordem ?? "",
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
      slug: editing ? initial.slug : slugify(f.nome) || `marca-${Date.now()}`,
      nome: f.nome.trim(),
      origem: f.origem.trim(),
      texto: f.texto.trim(),
      url: f.url.trim(),
      logo: f.logo.trim(),
      imagens: f.imagens,
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
        <span className="uf-label">Produtos</span>
        {editing ? (
          <p className="admin-sub" style={{ margin: 0 }}>
            {nProdutos} produto(s) desta marca.{" "}
            <Link href={`/admin/produtos?f_marca=${encodeURIComponent(initial.slug)}`} className="admin-link">Ver os produtos</Link>
            {" · "}
            <Link href={`/admin/produtos/novo?marca=${encodeURIComponent(initial.slug)}`} className="admin-link">+ Novo produto desta marca</Link>
            {initial.produtos?.length > 0 && (
              <>
                <br />
                <strong>{initial.produtos.length} ainda no formato antigo</strong> (dentro da marca) — passam para
                Produtos com a migração (Ajuda, ponto 7).
              </>
            )}
          </p>
        ) : (
          <p className="admin-sub" style={{ margin: 0 }}>Depois de criar a marca, acrescenta os produtos em Produtos.</p>
        )}
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
