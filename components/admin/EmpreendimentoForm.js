"use client";

import { useState } from "react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";
import VideoUploader from "@/components/admin/VideoUploader";
import { referenciaDe } from "@/lib/empreendimentos";
import PrecoDual from "@/components/PrecoDual";

const linhasParaArray = (s) =>
  (s || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

const arrayParaLinhas = (a) => (Array.isArray(a) ? a.join("\n") : "");

// Tipologias estruturadas: "nome | área | preço" (área e preço opcionais).
const tipologiasParaTexto = (t) =>
  Array.isArray(t)
    ? t
        .map((x) =>
          typeof x === "string"
            ? x
            : [x.nome, x.area, x.preco].filter((v) => v != null && v !== "").join(" | ")
        )
        .join("\n")
    : "";
const textoParaTipologias = (s) =>
  (s || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [nome, area, preco] = l.split("|").map((x) => x.trim());
      const o = { nome: nome || "" };
      if (area) o.area = area;
      if (preco && !isNaN(Number(preco))) o.preco = Number(preco);
      return o;
    });

// Links: "etiqueta | url"
const linksParaTexto = (a) =>
  Array.isArray(a) ? a.map((x) => `${x.label} | ${x.url}`).join("\n") : "";
const textoParaLinks = (s) =>
  (s || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [label, url] = l.split("|").map((x) => x.trim());
      return { label: label || url || "", url: url || "" };
    })
    .filter((x) => x.url);

export default function EmpreendimentoForm({ initial = null, regioesExistentes = [] }) {
  const editing = !!initial;
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  const [f, setF] = useState({
    slug: initial?.slug || "",
    referencia: initial?.referencia || "",
    nome: initial?.nome || "",
    pais: initial?.pais || "portugal",
    cidade: initial?.cidade || "",
    zona: initial?.zona || "",
    tipo: initial?.tipo || "Apartamento",
    finalidade: initial?.finalidade || "Investimento",
    preco: initial?.preco ?? "",
    precoMax: initial?.precoMax ?? "",
    moeda: initial?.moeda || "EUR",
    quartos: initial?.quartos ?? 1,
    casasBanho: initial?.casasBanho ?? 1,
    area: initial?.area ?? "",
    estado: initial?.estado || "Em construção",
    destaque: initial?.destaque ?? false,
    publicado: initial?.publicado !== false,
    construtora: initial?.construtora || "",
    morada: initial?.morada || "",
    resumo: initial?.resumo || "",
    descricao: initial?.descricao || "",
    caracteristicas: arrayParaLinhas(initial?.caracteristicas),
    tipologias: tipologiasParaTexto(initial?.tipologias),
    proximidades: arrayParaLinhas(initial?.proximidades),
    imagens: initial?.imagens || [],
    video: initial?.video || "",
    siteUrl: initial?.siteUrl || "",
    links: linksParaTexto(initial?.links),
    precoTipo: initial?.precoTipo || "exato",
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
      precoTipo: f.precoTipo,
      quartos: Number(f.quartos) || 0,
      casasBanho: Number(f.casasBanho) || 0,
      area: Number(f.area) || 0,
      estado: f.estado,
      destaque: !!f.destaque,
      publicado: !!f.publicado,
      resumo: f.resumo.trim(),
      descricao: f.descricao.trim(),
      caracteristicas: linhasParaArray(f.caracteristicas),
      imagens: f.imagens,
    };
    if (f.precoTipo === "intervalo" && Number(f.precoMax))
      doc.precoMax = Number(f.precoMax);
    if (f.referencia.trim()) doc.referencia = f.referencia.trim();
    if (f.construtora.trim()) doc.construtora = f.construtora.trim();
    if (f.morada.trim()) doc.morada = f.morada.trim();
    if (f.video.trim()) doc.video = f.video.trim();
    if (f.siteUrl.trim()) doc.siteUrl = f.siteUrl.trim();
    const lnk = textoParaLinks(f.links);
    if (lnk.length) doc.links = lnk;
    const tip = textoParaTipologias(f.tipologias);
    if (tip.length) doc.tipologias = tip;
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
        window.location.href = "/admin/empreendimentos";
      } else {
        setEstado({ a: "erro", msg: json.erro || "Erro ao guardar." });
      }
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
  }

  const cidadeTrim = f.cidade.trim();
  const zonaTrim = f.zona.trim();
  const temRegiao = regioesExistentes.some(
    (r) => (r.cidades || []).includes(cidadeTrim) || (r.zonas || []).includes(zonaTrim)
  );
  const faltaRegiao = (cidadeTrim || zonaTrim) && !temRegiao;
  const linkCriarZona =
    `/admin/regioes/novo?nome=${encodeURIComponent(zonaTrim || cidadeTrim)}` +
    `&cidade=${encodeURIComponent(cidadeTrim)}&zona=${encodeURIComponent(zonaTrim)}`;

  return (
    <div className="form-layout">
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
          Referência {!f.referencia && <small>— auto: {referenciaDe({ slug: f.slug })}</small>}
          <input
            value={f.referencia}
            onChange={set("referencia")}
            placeholder={referenciaDe({ slug: f.slug })}
          />
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
          Tipologia
          <input value={f.tipo} onChange={set("tipo")} placeholder="ex.: T2, Studio, Moradia V4…" />
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
            <option>Planta</option>
            <option>Pré-lançamento</option>
            <option>Lançamento</option>
            <option>Em construção</option>
            <option>Pronto</option>
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
          Apresentação do preço
          <select value={f.precoTipo} onChange={set("precoTipo")}>
            <option value="exato">Valor exato</option>
            <option value="desde">Desde (a partir de)</option>
            <option value="intervalo">Intervalo (de X a Y)</option>
            <option value="consulta">Sob consulta</option>
          </select>
        </label>
        {f.precoTipo === "intervalo" && (
          <label>
            Preço máximo (do intervalo)
            <input
              type="number"
              value={f.precoMax}
              onChange={set("precoMax")}
              placeholder="ex.: 480000"
            />
          </label>
        )}
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
        <label className="check-inline">
          <input type="checkbox" checked={f.publicado} onChange={set("publicado")} />
          Visível no site (se desmarcado, fica oculto)
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
          Tipologias — <code>nome | área | preço</code> (um por linha; área/preço opcionais)
          <textarea rows={6} value={f.tipologias} onChange={set("tipologias")} placeholder={"Studio | 28 m² · 1 vaga | 450000\n1 Suíte | plantas flexíveis"} />
        </label>
        <label>
          Proximidades (uma por linha, opcional)
          <textarea rows={6} value={f.proximidades} onChange={set("proximidades")} />
        </label>
        <div className="uploader-field">
          <span className="uf-label">Imagens (a 1.ª é a principal)</span>
          <ImageUploader
            value={f.imagens}
            onChange={(urls) => setF((p) => ({ ...p, imagens: urls }))}
          />
        </div>
        <div className="uploader-field">
          <span className="uf-label">Vídeo — link (YouTube/Vimeo) ou carregar ficheiro</span>
          <input value={f.video} onChange={set("video")} placeholder="https://youtu.be/... ou carrega abaixo" />
          <VideoUploader onUploaded={(url) => setF((p) => ({ ...p, video: url }))} />
        </div>
        <label className="full">
          Site oficial do empreendimento — opcional
          <input value={f.siteUrl} onChange={set("siteUrl")} placeholder="https://vibemeireles.com.br" />
        </label>
        <label className="full">
          Outros links (redes sociais, hotéis…) — <code>etiqueta | url</code> (um por linha)
          <textarea rows={3} value={f.links} onChange={set("links")} placeholder={"Instagram | https://instagram.com/...\nHotel parceiro | https://..."} />
        </label>
      </div>

      {faltaRegiao && (
        <div className="falta-regiao">
          A zona/cidade <strong>{zonaTrim || cidadeTrim}</strong> ainda não tem
          página de região.
          <Link href={linkCriarZona} target="_blank" className="btn-criar-zona">
            + Criar nova zona/região
          </Link>
        </div>
      )}

      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar alterações" : "Criar empreendimento"}
        </button>
      </div>
      </form>

      <aside className="form-preview">
        <div className="fp-label">Pré-visualização</div>
        <div className="prop-card fp-card">
          <div className="prop-media">
            {f.imagens[0] ? (
              <img src={f.imagens[0]} alt="" />
            ) : (
              <div className="fp-noimg">Sem imagem</div>
            )}
            <div className="prop-badges">
              {f.tipo && <span className="badge gold">{f.tipo}</span>}
              <span className="badge">{f.estado}</span>
            </div>
          </div>
          <div className="prop-body">
            <div className="prop-loc">
              {f.cidade || "Cidade"}
              {f.zona ? ` · ${f.zona}` : ""}
            </div>
            <h3>{f.nome || "Nome do empreendimento"}</h3>
            <p className="prop-resumo">{f.resumo || "Resumo do empreendimento..."}</p>
            <div className="prop-specs">
              <span>{f.quartos || 0} q</span>
              <span>{f.casasBanho || 0} wc</span>
              <span>{f.area || 0} m²</span>
            </div>
            <div className="prop-foot">
              <div className="prop-price">
                <PrecoDual
                  preco={Number(f.preco) || 0}
                  moeda={f.moeda}
                  tipo={f.precoTipo}
                  max={Number(f.precoMax) || 0}
                />
                <small>{f.finalidade}</small>
              </div>
            </div>
          </div>
        </div>
        {f.imagens.length > 1 && (
          <div className="fp-gallery">
            {f.imagens.slice(0, 6).map((u, i) => (
              <div key={i} className="fp-mini" style={{ backgroundImage: `url(${u})` }} />
            ))}
          </div>
        )}
        {editing ? (
          <Link href={`/empreendimentos/${initial.slug}`} target="_blank" className="btn-ver-site">
            Ver página completa no site ↗
          </Link>
        ) : (
          <p className="email-note" style={{ marginTop: 12 }}>
            Guarda primeiro para abrires a página completa no site.
          </p>
        )}
      </aside>
    </div>
  );
}
