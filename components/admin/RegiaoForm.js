"use client";

import { useState } from "react";
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

export default function RegiaoForm({ initial = null, regioesExistentes = [] }) {
  const editing = !!initial;
  const router = useRouter();
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  const [f, setF] = useState({
    slug: initial?.slug || "",
    nome: initial?.nome || "",
    pais: initial?.pais || "portugal",
    parent: initial?.parent || "",
    imagem: initial?.imagem || "",
    tagline: initial?.tagline || "",
    descricao: initial?.descricao || "",
    sobre: initial?.sobre || "",
    crescimento: initial?.crescimento || "",
    cidades: arr(initial?.cidades),
    zonas: arr(initial?.zonas),
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
      imagem: f.imagem.trim(),
      tagline: f.tagline.trim(),
      descricao: f.descricao.trim(),
      sobre: f.sobre.trim(),
      crescimento: f.crescimento.trim(),
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
        router.push("/admin/regioes");
        router.refresh();
      } else {
        setEstado({ a: "erro", msg: json.erro || "Erro ao guardar." });
      }
    } catch {
      setEstado({ a: "erro", msg: "Erro de ligação." });
    }
  }

  return (
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
          Pertence a (deixa vazio = região de topo; escolhe = é uma zona)
          <select value={f.parent} onChange={set("parent")}>
            <option value="">— Região de topo —</option>
            {possiveisPais.map((r) => (
              <option key={r.slug} value={r.slug}>{r.nome}</option>
            ))}
          </select>
        </label>
        <label className="full">
          Imagem
          <ImageUploader
            multiple={false}
            onUploaded={(urls) => urls[0] && setF((p) => ({ ...p, imagem: urls[0] }))}
          />
          {f.imagem && (
            <div className="upload-thumbs">
              <div className="upload-thumb" style={{ backgroundImage: `url(${f.imagem})` }} />
            </div>
          )}
          <input value={f.imagem} onChange={set("imagem")} placeholder="Carrega acima ou cola um URL" />
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

      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar alterações" : "Criar"}
        </button>
      </div>
    </form>
  );
}
