"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";

const linhas = (s) =>
  (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
const arr = (a) => (Array.isArray(a) ? a.join("\n") : "");

// destaques: "icone | titulo | texto"
const destaquesParaTexto = (d) =>
  Array.isArray(d) ? d.map((x) => `${x.icon} | ${x.titulo} | ${x.texto}`).join("\n") : "";
const textoParaDestaques = (s) =>
  linhas(s).map((l) => {
    const [icon, titulo, texto] = l.split("|").map((x) => x.trim());
    return { icon: icon || "sparkles", titulo: titulo || "", texto: texto || "" };
  });

// pontos: "nome | tipo | lat | lng"
const pontosParaTexto = (p) =>
  Array.isArray(p) ? p.map((x) => `${x.nome} | ${x.tipo} | ${x.lat} | ${x.lng}`).join("\n") : "";
const textoParaPontos = (s) =>
  linhas(s).map((l) => {
    const [nome, tipo, lat, lng] = l.split("|").map((x) => x.trim());
    return { nome: nome || "", tipo: tipo || "cidade", lat: Number(lat) || 0, lng: Number(lng) || 0 };
  });

// distâncias: "local | km"
const distanciasParaTexto = (d) =>
  Array.isArray(d) ? d.map((x) => `${x.local} | ${x.km}`).join("\n") : "";
const textoParaDistancias = (s) =>
  linhas(s).map((l) => {
    const [local, km] = l.split("|").map((x) => x.trim());
    return { local: local || "", km: Number(km) || 0 };
  });

// publicidade: "título | texto | url | imagem"
const publicidadeParaTexto = (a) =>
  Array.isArray(a)
    ? a.map((x) => [x.titulo, x.texto, x.url, x.imagem].map((v) => v || "").join(" | ")).join("\n")
    : "";
const textoParaPublicidade = (s) =>
  linhas(s)
    .map((l) => {
      const [titulo, texto, url, imagem] = l.split("|").map((x) => x.trim());
      return { titulo: titulo || "", texto: texto || "", url: url || "", imagem: imagem || "" };
    })
    .filter((x) => x.titulo || x.url);

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function RegiaoForm({ initial = null, regioesExistentes = [], prefill = null }) {
  const editing = !!initial;
  const pf = editing ? null : prefill;
  const router = useRouter();
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  const [f, setF] = useState({
    slug: initial?.slug || (pf?.nome ? slugify(pf.nome) : ""),
    nome: initial?.nome || pf?.nome || "",
    pais: initial?.pais || "portugal",
    parent: initial?.parent || "",
    nivel: initial?.nivel || (initial?.parent ? "cidade" : "regiao"),
    publicidade: publicidadeParaTexto(initial?.publicidade),
    imagem: initial?.imagem || "",
    tagline: initial?.tagline || "",
    descricao: initial?.descricao || "",
    sobre: initial?.sobre || "",
    crescimento: initial?.crescimento || "",
    conhecidaPor: initial?.conhecidaPor || "",
    oQueVer: arr(initial?.oQueVer),
    transportes: arr(initial?.transportes),
    distancias: distanciasParaTexto(initial?.distancias),
    cidades: arr(initial?.cidades) || pf?.cidade || "",
    zonas: arr(initial?.zonas) || pf?.zona || "",
    vantagens: arr(initial?.vantagens),
    destaques: destaquesParaTexto(initial?.destaques),
    mapaLat: initial?.mapa?.lat ?? "",
    mapaLng: initial?.mapa?.lng ?? "",
    mapaZoom: initial?.mapa?.zoom ?? 12,
    pontos: pontosParaTexto(initial?.pontos),
  });

  const set = (c) => (e) => setF((p) => ({ ...p, [c]: e.target.value }));

  const possiveisPais = regioesExistentes.filter(
    (r) => !r.parent && r.slug !== f.slug
  );

  async function onSubmit(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });

    const doc = {
      slug: f.slug.trim(),
      nome: f.nome.trim(),
      pais: f.pais,
      nivel: f.nivel,
      publicidade: textoParaPublicidade(f.publicidade),
      imagem: f.imagem.trim(),
      tagline: f.tagline.trim(),
      descricao: f.descricao.trim(),
      sobre: f.sobre.trim(),
      crescimento: f.crescimento.trim(),
      conhecidaPor: f.conhecidaPor.trim(),
      oQueVer: linhas(f.oQueVer),
      transportes: linhas(f.transportes),
      distancias: textoParaDistancias(f.distancias),
      cidades: linhas(f.cidades),
      zonas: linhas(f.zonas),
      vantagens: linhas(f.vantagens),
      destaques: textoParaDestaques(f.destaques),
      mapa: {
        lat: Number(f.mapaLat) || 0,
        lng: Number(f.mapaLng) || 0,
        zoom: Number(f.mapaZoom) || 12,
      },
      pontos: textoParaPontos(f.pontos),
    };
    if (f.parent) doc.parent = f.parent;

    try {
      const url = editing ? `/api/admin/regioes/${initial.slug}` : "/api/admin/regioes";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        window.location.href = "/admin/regioes";
      } else {
        setEstado({ a: "erro", msg: json.erro || "Erro ao guardar." });
      }
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
  }

  return (
    <div className="form-layout">
      <form className="admin-form" onSubmit={onSubmit}>
      <div className="admin-form-grid">
        <label>
          Slug (URL) {editing && <small>— não editável</small>}
          <input value={f.slug} onChange={set("slug")} required readOnly={editing} placeholder="ex: fortaleza" />
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
          Pertence a (vazio = região de topo)
          <select value={f.parent} onChange={set("parent")}>
            <option value="">— Região de topo —</option>
            {possiveisPais.map((r) => (
              <option key={r.slug} value={r.slug}>{r.nome}</option>
            ))}
          </select>
        </label>
        <label>
          Nível
          <select value={f.nivel} onChange={set("nivel")}>
            <option value="regiao">Região</option>
            <option value="estado">Estado</option>
            <option value="cidade">Cidade</option>
            <option value="zona">Zona / bairro</option>
          </select>
        </label>
        <label className="full">
          Imagem
          <ImageUploader
            multiple={false}
            value={f.imagem ? [f.imagem] : []}
            onChange={(urls) => setF((p) => ({ ...p, imagem: urls[0] || "" }))}
          />
        </label>
        <label className="full">
          Tagline (frase curta)
          <input value={f.tagline} onChange={set("tagline")} />
        </label>
      </div>

      <label className="full">
        Descrição (resumo curto)
        <textarea rows={2} value={f.descricao} onChange={set("descricao")} />
      </label>
      <label className="full">
        Sobre (texto editorial / história)
        <textarea rows={5} value={f.sobre} onChange={set("sobre")} />
      </label>
      <label className="full">
        Crescimento & turismo
        <textarea rows={3} value={f.crescimento} onChange={set("crescimento")} />
      </label>
      <label className="full">
        Conhecida por (frase curta)
        <input value={f.conhecidaPor} onChange={set("conhecidaPor")} placeholder="Pela Avenida Beira-Mar e pelas praias urbanas." />
      </label>
      <div className="admin-form-grid">
        <label>
          O que ver (um por linha)
          <textarea rows={5} value={f.oQueVer} onChange={set("oQueVer")} placeholder={"Praia de Iracema\nMercado Central"} />
        </label>
        <label>
          Transportes / acessos (um por linha)
          <textarea rows={5} value={f.transportes} onChange={set("transportes")} placeholder={"Aeroporto a ~8 km\nVLT e autocarros"} />
        </label>
        <label className="full">
          Distâncias — <code>local | km</code> (um por linha)
          <textarea rows={4} value={f.distancias} onChange={set("distancias")} placeholder={"Aeroporto | 8\nPraia | 1"} />
        </label>
      </div>

      <div className="admin-form-grid">
        <label>
          Cidades que ligam a esta zona/região (uma por linha)
          <textarea rows={4} value={f.cidades} onChange={set("cidades")} placeholder="Fortaleza" />
        </label>
        <label>
          Zonas que ligam (uma por linha)
          <textarea rows={4} value={f.zonas} onChange={set("zonas")} placeholder="Meireles" />
        </label>
        <label>
          Vantagens (uma por linha)
          <textarea rows={4} value={f.vantagens} onChange={set("vantagens")} />
        </label>
        <label>
          Destaques — <code>icone | título | texto</code> (um por linha)
          <textarea rows={4} value={f.destaques} onChange={set("destaques")} placeholder="umbrella | Praias | Areia branca..." />
        </label>
      </div>

      <div className="admin-form-grid">
        <label>
          Mapa — Latitude
          <input value={f.mapaLat} onChange={set("mapaLat")} placeholder="-3.728" />
        </label>
        <label>
          Mapa — Longitude
          <input value={f.mapaLng} onChange={set("mapaLng")} placeholder="-38.49" />
        </label>
        <label>
          Mapa — Zoom
          <input type="number" value={f.mapaZoom} onChange={set("mapaZoom")} />
        </label>
        <label className="full">
          Pontos de interesse — <code>nome | tipo | lat | lng</code> (um por linha).
          Tipos: historico, praia, montanha, natureza, cidade, gastronomia
          <textarea rows={5} value={f.pontos} onChange={set("pontos")} placeholder="Meireles | cidade | -3.728 | -38.491" />
        </label>
      </div>

      <label className="full">
        Publicidade — cards de patrocínio/parceiros — <code>título | texto | url | imagem</code> (um por linha)
        <textarea rows={4} value={f.publicidade} onChange={set("publicidade")} placeholder={"Hotel Meireles | Estadia com desconto | https://... | https://imagem.jpg"} />
      </label>

      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar alterações" : "Criar"}
        </button>
      </div>
      </form>

      <aside className="form-preview">
        <div className="fp-label">Pré-visualização</div>
        <div className="fp-region">
          {f.imagem && <img src={f.imagem} alt="" />}
          <div className="fpr-body">
            <h3>{f.nome || "Nome da região/zona"}</h3>
            <p>{f.tagline || "Tagline..."}</p>
          </div>
        </div>
        <p className="email-note" style={{ marginTop: 10 }}>
          {f.parent ? "É uma zona (pertence a uma região)." : "É uma região de topo (pode ser banner)."}
        </p>
        {editing && (
          <Link href={`/regioes/${initial.slug}`} target="_blank" className="btn-ver-site">
            Ver página completa no site ↗
          </Link>
        )}
      </aside>
    </div>
  );
}
