"use client";

import { useState } from "react";

// Card de uma marca representada: foto principal + miniaturas para trocar.
export default function MarcaCard({ marca: m }) {
  const imagens = m.imagens?.length ? m.imagens : m.logo ? [m.logo] : [];
  const [i, setI] = useState(0);
  const externo = m.url && /^https?:\/\//.test(m.url);

  return (
    <article className="marca-card">
      <div className="marca-foto">
        {imagens[i] && <img src={imagens[i]} alt={m.nome} loading="lazy" />}
      </div>
      {imagens.length > 1 && (
        <div className="marca-thumbs">
          {imagens.map((src, idx) => (
            <button
              type="button"
              key={src}
              className={idx === i ? "on" : undefined}
              onClick={() => setI(idx)}
              aria-label={`Fotografia ${idx + 1} de ${m.nome}`}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className="marca-body">
        {m.origem && <span className="marca-origem">{m.origem}</span>}
        <h3>{m.nome}</h3>
        {m.texto && <p>{m.texto}</p>}
        {m.url && (
          <a href={m.url} target={externo ? "_blank" : undefined} rel="noopener" className="pub-cta">
            Conhecer a marca ↗
          </a>
        )}
      </div>
    </article>
  );
}
