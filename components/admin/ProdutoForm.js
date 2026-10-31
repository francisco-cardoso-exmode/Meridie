"use client";

import { useState } from "react";
import VersaoInglesa from "@/components/admin/VersaoInglesa";
import ImageUploader from "@/components/admin/ImageUploader";
import { pedidoAdmin, useAvisoSaida, useEnEditado } from "@/lib/adminCliente";
import { slugify } from "@/lib/slug";

// Ficha técnica: uma linha por característica, "Etiqueta | valor".
export const paresParaTexto = (c) => (Array.isArray(c) ? c.map(([k, v]) => `${k} | ${v}`).join("\n") : "");
export const textoParaPares = (t) =>
  (t || "")
    .split("\n")
    .map((l) => l.split("|"))
    .filter((p) => p.length >= 2 && p[0].trim())
    .map(([k, ...v]) => [k.trim(), v.join("|").trim()]);

/**
 * Produto das Representações comerciais.
 * `categorias`: lista plana [{ slug, nome, parent }]; `marcas`: [{ slug, nome }].
 */
export default function ProdutoForm({ initial = null, categorias = [], marcas = [], marcaInicial = "" }) {
  const editing = !!initial;
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const { enEditado, temEnEditado, enMostrado, mudarEn } = useEnEditado(initial?.en);
  const topo = categorias.filter((c) => !c.parent);
  const [f, setF] = useState({
    nome: initial?.nome || "",
    marca: initial?.marca ?? marcaInicial,
    categoria: initial?.categoria || topo[0]?.slug || "",
    subcategoria: initial?.subcategoria || "",
    imagens: initial?.imagens || [],
    resumo: initial?.resumo || "",
    descricao: initial?.descricao || "",
    especTexto: paresParaTexto(initial?.especificacoes),
    precoTipo: initial?.precoTipo === "valor" ? "valor" : "consulta",
    preco: initial?.preco ?? "",
    unidade: initial?.unidade || "",
    minimo: initial?.minimo ?? 1,
    disponivel: initial?.disponivel !== false,
    destaque: !!initial?.destaque,
    ativo: initial?.ativo !== false,
    ordem: initial?.ordem ?? "",
  });
  const [inicialJson] = useState(() => JSON.stringify(f));
  const libertar = useAvisoSaida(JSON.stringify(f) !== inicialJson || temEnEditado);
  const set = (k) => (e) =>
    setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const subs = categorias.filter((c) => c.parent === f.categoria);

  async function onSubmit(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    const doc = {
      slug: editing ? initial.slug : slugify(f.nome),
      nome: f.nome.trim(),
      marca: f.marca,
      categoria: f.categoria,
      subcategoria: subs.some((s) => s.slug === f.subcategoria) ? f.subcategoria : "",
      imagens: f.imagens,
      resumo: f.resumo.trim(),
      descricao: f.descricao.trim(),
      especificacoes: textoParaPares(f.especTexto),
      precoTipo: f.precoTipo,
      preco: f.preco === "" ? null : Number(String(f.preco).replace(",", ".")),
      unidade: f.unidade.trim(),
      minimo: Number(f.minimo) || 1,
      disponivel: !!f.disponivel,
      destaque: !!f.destaque,
      ativo: !!f.ativo,
      ordem: f.ordem === "" ? 99 : Number(f.ordem),
    };
    const url = editing ? `/api/admin/produtos/${encodeURIComponent(initial.slug)}` : "/api/admin/produtos";
    const r = await pedidoAdmin(url, { method: editing ? "PUT" : "POST", body: temEnEditado ? { ...doc, enEditado } : doc });
    if (r.ok) {
      libertar();
      window.location.href = "/admin/produtos";
    } else setEstado({ a: "erro", msg: r.erro });
  }

  return (
    <form className="admin-form" onSubmit={onSubmit} style={{ maxWidth: 760 }}>
      <label className="full">
        Nome do produto
        <input value={f.nome} onChange={set("nome")} required placeholder="Conserva de atum em azeite" />
        {!editing && f.nome && <small>Endereço: …/{slugify(f.nome)}</small>}
      </label>
      <div className="admin-form-grid">
        <label>
          Marca
          <select value={f.marca} onChange={set("marca")}>
            <option value="">— sem marca —</option>
            {marcas.map((m) => (
              <option key={m.slug} value={m.slug}>{m.nome}</option>
            ))}
          </select>
        </label>
        <label>
          Categoria
          <select value={f.categoria} onChange={(e) => setF((p) => ({ ...p, categoria: e.target.value, subcategoria: "" }))} required>
            {topo.map((c) => (
              <option key={c.slug} value={c.slug}>{c.nome}</option>
            ))}
          </select>
        </label>
        <label>
          Subcategoria
          <select value={f.subcategoria} onChange={set("subcategoria")} disabled={!subs.length}>
            <option value="">{subs.length ? "— nenhuma —" : "(esta categoria não tem subcategorias)"}</option>
            {subs.map((c) => (
              <option key={c.slug} value={c.slug}>{c.nome}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="uploader-field">
        <span className="uf-label">Fotografias (a primeira é a principal — fundo branco fica melhor)</span>
        <ImageUploader value={f.imagens} onChange={(urls) => setF((p) => ({ ...p, imagens: urls }))} />
      </div>

      <label className="full">
        Descrição curta (aparece no cartão e no topo da página)
        <textarea rows={2} value={f.resumo} onChange={set("resumo")} maxLength={600} />
      </label>
      <label className="full">
        Descrição completa (parágrafos separados por uma linha em branco)
        <textarea rows={6} value={f.descricao} onChange={set("descricao")} />
      </label>
      <label className="full">
        Ficha técnica — uma característica por linha, no formato «Etiqueta | valor»
        <textarea
          rows={6}
          value={f.especTexto}
          onChange={set("especTexto")}
          placeholder={"Volume | 75 cl\nTeor alcoólico | 12,5% vol.\nOrigem | Portugal\nFormato | Garrafa"}
        />
      </label>

      <fieldset className="admin-fieldset">
        <legend>Preço</legend>
        <label className="check-inline">
          <input type="radio" name="precoTipo" value="consulta" checked={f.precoTipo === "consulta"} onChange={set("precoTipo")} />
          Preço sob consulta (não mostra preço)
        </label>
        <label className="check-inline">
          <input type="radio" name="precoTipo" value="valor" checked={f.precoTipo === "valor"} onChange={set("precoTipo")} />
          Mostrar preço
        </label>
        <div className="admin-form-grid">
          <label>
            Preço (€, sem IVA ou com — escreve na unidade)
            <input type="number" step="0.01" min="0" value={f.preco} onChange={set("preco")} disabled={f.precoTipo !== "valor"} required={f.precoTipo === "valor"} />
          </label>
          <label>
            Unidade
            <input value={f.unidade} onChange={set("unidade")} placeholder="garrafa 75 cl · caixa 6 un." />
          </label>
          <label>
            Quantidade mínima
            <input type="number" min="1" step="1" value={f.minimo} onChange={set("minimo")} />
          </label>
        </div>
      </fieldset>

      <label className="full">
        Ordem (1 aparece primeiro)
        <input type="number" value={f.ordem} onChange={set("ordem")} placeholder="1" />
      </label>
      <label className="check-inline">
        <input type="checkbox" checked={f.disponivel} onChange={set("disponivel")} />
        Disponível (desligado: aparece como «Indisponível» e só deixa pedir informação)
      </label>
      <label className="check-inline">
        <input type="checkbox" checked={f.destaque} onChange={set("destaque")} />
        Destaque (aparece em «Produtos em destaque» na página Representações)
      </label>
      <label className="check-inline">
        <input type="checkbox" checked={f.ativo} onChange={set("ativo")} />
        Ativo (visível no site)
      </label>
      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      {initial && <VersaoInglesa colecao="produtos" doc={initial} en={enMostrado} onChange={mudarEn} />}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar" : "Criar produto"}
        </button>
      </div>
    </form>
  );
}
