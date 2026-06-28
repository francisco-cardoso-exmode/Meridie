"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function AnuncioForm({ initial = null }) {
  const editing = !!initial;
  const router = useRouter();
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const [f, setF] = useState({
    titulo: initial?.titulo || "",
    texto: initial?.texto || "",
    url: initial?.url || "",
    imagem: initial?.imagem || "",
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
      mostrarHome: !!f.mostrarHome,
      ativo: !!f.ativo,
    };
    try {
      const url = editing ? `/api/admin/anuncios/${initial.slug}` : "/api/admin/anuncios";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
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
        Texto
        <textarea rows={2} value={f.texto} onChange={set("texto")} placeholder="Estadia com desconto para clientes Meridie" />
      </label>
      <label className="full">
        Link (site do hotel/restaurante, ou /regioes/fortaleza para uma região)
        <input value={f.url} onChange={set("url")} placeholder="https://... ou /regioes/fortaleza" />
      </label>
      <label className="full">
        Imagem
        <ImageUploader
          multiple={false}
          value={f.imagem ? [f.imagem] : []}
          onChange={(urls) => setF((p) => ({ ...p, imagem: urls[0] || "" }))}
        />
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
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? "A guardar..." : editing ? "Guardar" : "Criar anúncio"}
        </button>
      </div>
    </form>
  );
}
