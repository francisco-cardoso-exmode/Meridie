"use client";

import { useState } from "react";
import VersaoInglesa from "@/components/admin/VersaoInglesa";
import ImageUploader from "@/components/admin/ImageUploader";
import { pedidoAdmin, useAvisoSaida, useEnEditado, novoId } from "@/lib/adminCliente";
import { TIPOS_SOLUCAO } from "@/lib/catalogo";
import { slugify } from "@/lib/slug";

const linhas = (t) => (t || "").split("\n").map((x) => x.trim()).filter(Boolean);
const texto = (l) => (Array.isArray(l) ? l.join("\n") : "");

// Listas com id estável (a tradução acompanha o item quando se reordena).
function useLista(inicial, novo) {
  const [l, setL] = useState(inicial);
  return {
    l,
    setL,
    mudar: (id, k, v) => setL((x) => x.map((i) => (i.id === id ? { ...i, [k]: v } : i))),
    juntar: () => setL((x) => [...x, { id: novoId(), ...novo }]),
    tirar: (id) => setL((x) => x.filter((i) => i.id !== id)),
    mover: (i, d) =>
      setL((x) => {
        const j = i + d;
        if (j < 0 || j >= x.length) return x;
        const n = [...x];
        [n[i], n[j]] = [n[j], n[i]];
        return n;
      }),
  };
}

/** Solução tecnológica (Tecnologia): desenvolvemos ou representamos. */
export default function SolucaoForm({ initial: emEdicao = null, copia = null }) {
  const editing = !!emEdicao;
  // `copia`: dados de outro registo para "Duplicar" (cria um novo).
  const initial = emEdicao || copia;
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const { enEditado, temEnEditado, enMostrado, mudarEn } = useEnEditado(emEdicao?.en);
  const [f, setF] = useState({
    nome: initial?.nome || "",
    tipo: initial?.tipo || "desenvolvemos",
    parceiro: initial?.parceiro || "",
    tagline: initial?.tagline || "",
    problema: initial?.problema || "",
    paraQuem: texto(initial?.paraQuem),
    funcionalidades: texto(initial?.funcionalidades),
    imagens: initial?.imagens || [],
    video: initial?.video || "",
    url: initial?.url || "",
    ordem: initial?.ordem ?? "",
    destaque: !!initial?.destaque,
    ativo: initial?.ativo !== false,
  });
  const planos = useLista(
    (initial?.planos || []).map((p) => ({ ...p, preco: p.preco ?? "", itensTexto: texto(p.itens) })),
    { nome: "", precoTipo: "consulta", preco: "", unidade: "", descricao: "", itensTexto: "" }
  );
  const casos = useLista(initial?.casos || [], { titulo: "", texto: "", autor: "" });
  const [inicialJson] = useState(() => JSON.stringify([f, planos.l, casos.l]));
  const libertar = useAvisoSaida(JSON.stringify([f, planos.l, casos.l]) !== inicialJson || temEnEditado);
  const set = (k) => (e) =>
    setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });
    const doc = {
      slug: editing ? initial.slug : slugify(f.nome),
      nome: f.nome.trim(),
      tipo: f.tipo,
      parceiro: f.tipo === "representamos" ? f.parceiro.trim() : "",
      tagline: f.tagline.trim(),
      problema: f.problema.trim(),
      paraQuem: linhas(f.paraQuem),
      funcionalidades: linhas(f.funcionalidades),
      imagens: f.imagens,
      video: f.video.trim(),
      url: f.url.trim(),
      planos: planos.l
        .filter((p) => p.nome.trim())
        .map((p) => ({
          id: p.id,
          nome: p.nome.trim(),
          precoTipo: p.precoTipo,
          preco: p.preco === "" ? null : Number(String(p.preco).replace(",", ".")),
          unidade: (p.unidade || "").trim(),
          descricao: (p.descricao || "").trim(),
          itens: linhas(p.itensTexto),
        })),
      casos: casos.l
        .filter((c) => c.titulo.trim() || c.texto.trim())
        .map((c) => ({ id: c.id, titulo: c.titulo.trim(), texto: c.texto.trim(), autor: (c.autor || "").trim() })),
      ordem: f.ordem === "" ? 99 : Number(f.ordem),
      destaque: !!f.destaque,
      ativo: !!f.ativo,
    };
    const url = editing ? `/api/admin/solucoes/${encodeURIComponent(initial.slug)}` : "/api/admin/solucoes";
    const r = await pedidoAdmin(url, { method: editing ? "PUT" : "POST", body: temEnEditado ? { ...doc, enEditado } : doc });
    if (r.ok) {
      libertar();
      window.location.href = "/admin/solucoes";
    } else setEstado({ a: "erro", msg: r.erro });
  }

  const acoes = (lista, x, i) => (
    <div className="prod-editor-acoes">
      <button type="button" className="btn-ghost" onClick={() => lista.mover(i, -1)} disabled={i === 0}>↑</button>
      <button type="button" className="btn-ghost" onClick={() => lista.mover(i, 1)} disabled={i === lista.l.length - 1}>↓</button>
      <button type="button" className="admin-del" onClick={() => lista.tirar(x.id)}>Remover</button>
    </div>
  );

  return (
    <form className="admin-form" onSubmit={onSubmit} style={{ maxWidth: 760 }}>
      <label className="full">
        Nome da solução
        <input value={f.nome} onChange={set("nome")} required placeholder="Gestor de reservas" />
        {!editing && f.nome && <small>Endereço: /tecnologia/{slugify(f.nome)}</small>}
      </label>
      <fieldset className="admin-fieldset">
        <legend>Tipo</legend>
        {Object.entries(TIPOS_SOLUCAO).map(([k, v]) => (
          <label className="check-inline" key={k}>
            <input type="radio" name="tipo" value={k} checked={f.tipo === k} onChange={set("tipo")} />
            {v} {k === "desenvolvemos" ? "(produto próprio)" : "(solução de um parceiro)"}
          </label>
        ))}
        {f.tipo === "representamos" && (
          <label className="full">
            Parceiro (empresa que criou a solução)
            <input value={f.parceiro} onChange={set("parceiro")} />
          </label>
        )}
      </fieldset>
      <label className="full">
        Frase curta (tagline)
        <input value={f.tagline} onChange={set("tagline")} maxLength={600} placeholder="Reservas, check-in e faturação num só sítio." />
      </label>
      <label className="full">
        O problema que resolve (parágrafos separados por uma linha em branco)
        <textarea rows={5} value={f.problema} onChange={set("problema")} />
      </label>
      <div className="admin-form-grid">
        <label>
          Para quem (setores — um por linha)
          <textarea rows={5} value={f.paraQuem} onChange={set("paraQuem")} placeholder={"Hotelaria\nAlojamento local\nRestauração"} />
        </label>
        <label>
          Funcionalidades (uma por linha)
          <textarea rows={5} value={f.funcionalidades} onChange={set("funcionalidades")} />
        </label>
      </div>
      <div className="uploader-field">
        <span className="uf-label">Imagens (capturas de ecrã, fotos — a primeira é a do cartão)</span>
        <ImageUploader value={f.imagens} onChange={(urls) => setF((p) => ({ ...p, imagens: urls }))} />
      </div>
      <div className="admin-form-grid">
        <label>
          Vídeo (link YouTube/Vimeo — opcional)
          <input value={f.video} onChange={set("video")} placeholder="https://www.youtube.com/watch?v=…" />
        </label>
        <label>
          Site da solução (opcional, não aparece por agora)
          <input value={f.url} onChange={set("url")} placeholder="https://…" />
        </label>
      </div>

      <div className="uploader-field">
        <span className="uf-label">Planos e preços ({planos.l.length}) — sem planos, a página só tem «Pedir proposta»</span>
        <div className="prod-editor">
          {planos.l.map((p, i) => (
            <div className="prod-editor-row lista-editor-row" key={p.id}>
              <div className="prod-editor-campos">
                <input value={p.nome} onChange={(e) => planos.mudar(p.id, "nome", e.target.value)} placeholder="Nome do plano (ex.: Essencial)" />
                <div className="admin-form-grid">
                  <label>
                    Preço
                    <select value={p.precoTipo} onChange={(e) => planos.mudar(p.id, "precoTipo", e.target.value)}>
                      <option value="consulta">Sob consulta</option>
                      <option value="valor">Mostrar valor</option>
                    </select>
                  </label>
                  <label>
                    Valor (€)
                    <input type="number" step="0.01" min="0" value={p.preco} disabled={p.precoTipo !== "valor"} onChange={(e) => planos.mudar(p.id, "preco", e.target.value)} />
                  </label>
                  <label>
                    Unidade
                    <input value={p.unidade} onChange={(e) => planos.mudar(p.id, "unidade", e.target.value)} placeholder="mês · licença · utilizador/mês" />
                  </label>
                </div>
                <textarea rows={2} value={p.descricao} onChange={(e) => planos.mudar(p.id, "descricao", e.target.value)} placeholder="Descrição curta (opcional)" />
                <textarea rows={3} value={p.itensTexto} onChange={(e) => planos.mudar(p.id, "itensTexto", e.target.value)} placeholder={"O que inclui — um por linha:\nAté 3 utilizadores\nSuporte por email"} />
                {acoes(planos, p, i)}
              </div>
            </div>
          ))}
          <button type="button" className="btn-ghost" onClick={planos.juntar}>+ Acrescentar plano</button>
        </div>
      </div>

      <div className="uploader-field">
        <span className="uf-label">Casos e testemunhos (opcional)</span>
        <div className="prod-editor">
          {casos.l.map((c, i) => (
            <div className="prod-editor-row lista-editor-row" key={c.id}>
              <div className="prod-editor-campos">
                <input value={c.titulo} onChange={(e) => casos.mudar(c.id, "titulo", e.target.value)} placeholder="Título (ex.: Hotel X reduziu 30% do tempo de check-in)" />
                <textarea rows={3} value={c.texto} onChange={(e) => casos.mudar(c.id, "texto", e.target.value)} placeholder="O caso ou o testemunho" />
                <input value={c.autor} onChange={(e) => casos.mudar(c.id, "autor", e.target.value)} placeholder="Autor / empresa (opcional)" />
                {acoes(casos, c, i)}
              </div>
            </div>
          ))}
          <button type="button" className="btn-ghost" onClick={casos.juntar}>+ Acrescentar caso</button>
        </div>
      </div>

      <label className="full">
        Ordem (1 aparece primeiro)
        <input type="number" value={f.ordem} onChange={set("ordem")} placeholder="1" />
      </label>
      <label className="check-inline">
        <input type="checkbox" checked={f.destaque} onChange={set("destaque")} />
        Destaque (aparece primeiro na sua secção)
      </label>
      <label className="check-inline">
        <input type="checkbox" checked={f.ativo} onChange={set("ativo")} />
        Ativa (visível no site)
      </label>
      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      {editing && <VersaoInglesa colecao="solucoes" doc={initial} en={enMostrado} onChange={mudarEn} />}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar" : "Criar solução"}
        </button>
      </div>
    </form>
  );
}
