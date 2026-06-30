"use client";

import { useMemo, useRef, useState } from "react";
import { assinaturaHTML } from "@/lib/emailcards";

export default function SignatureGenerator({ empreendimentos = [], baseUrl, logoUrl }) {
  const previewRef = useRef(null);
  const [copiado, setCopiado] = useState(false);
  const [f, setF] = useState({
    nome: "",
    cargo: "",
    telefone: "",
    email: "",
  });
  // Por defeito, seleciona um empreendimento em destaque (ou o primeiro).
  const [sel, setSel] = useState(() => {
    const inicial = empreendimentos.find((e) => e.destaque) || empreendimentos[0];
    return inicial ? [inicial.slug] : [];
  });

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  function toggle(slug) {
    setSel((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length >= 3
        ? prev
        : [...prev, slug]
    );
  }

  const html = useMemo(() => {
    const escolhidos = sel
      .map((s) => empreendimentos.find((e) => e.slug === s))
      .filter(Boolean);
    return assinaturaHTML({ ...f, empreendimentos: escolhidos, baseUrl, logoUrl });
  }, [f, sel, empreendimentos, baseUrl, logoUrl]);

  function copiar() {
    const el = previewRef.current;
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const s = window.getSelection();
    s.removeAllRanges();
    s.addRange(range);
    try {
      document.execCommand("copy");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* ignore */
    }
    s.removeAllRanges();
  }

  return (
    <div className="form-layout">
      <div className="admin-form">
        <div className="admin-form-grid">
          <label>
            Nome
            <input value={f.nome} onChange={set("nome")} placeholder="Paulo Rocha" />
          </label>
          <label>
            Cargo
            <input value={f.cargo} onChange={set("cargo")} placeholder="Sócio-gerente" />
          </label>
          <label>
            Telefone
            <input value={f.telefone} onChange={set("telefone")} placeholder="+351 ..." />
          </label>
          <label>
            Email
            <input value={f.email} onChange={set("email")} placeholder="paulo.rocha@meridieinvestments.com" />
          </label>
        </div>

        <label className="full">
          Empreendimentos em destaque (até 3)
          <div className="sig-list">
            {empreendimentos.map((e) => (
              <label key={e.slug} className="sig-item">
                <input
                  type="checkbox"
                  checked={sel.includes(e.slug)}
                  onChange={() => toggle(e.slug)}
                  disabled={!sel.includes(e.slug) && sel.length >= 3}
                />
                <span>
                  {e.nome} <small>· {e.cidade}</small>
                </span>
              </label>
            ))}
          </div>
        </label>

        <div className="admin-form-actions">
          <button type="button" className="btn btn-primary" onClick={copiar}>
            {copiado ? "✓ Copiado!" : "Copiar assinatura"}
          </button>
        </div>

        <div className="sig-instr">
          <strong>Como colocar:</strong>
          <ul>
            <li><strong>Gmail:</strong> ⚙ → Ver todas as definições → Geral → Assinatura → colar (Ctrl/Cmd+V) → Guardar.</li>
            <li><strong>Outlook:</strong> Ficheiro → Opções → Email → Assinaturas → colar.</li>
            <li><strong>Apple Mail:</strong> Mail → Definições → Assinaturas → colar.</li>
          </ul>
        </div>
      </div>

      <aside className="form-preview">
        <div className="fp-label">Pré-visualização (será copiada)</div>
        <div
          className="sig-preview"
          ref={previewRef}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </aside>
    </div>
  );
}
