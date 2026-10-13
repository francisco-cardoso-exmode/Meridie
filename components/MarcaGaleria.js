"use client";

import { useState } from "react";

// Galeria simples da marca: foto grande + miniaturas.
export default function MarcaGaleria({ imagens, nome }) {
  const [i, setI] = useState(0);
  return (
    <div className="marca-galeria">
      <div className="marca-galeria-main">
        <img src={imagens[i]} alt={nome} />
      </div>
      {imagens.length > 1 && (
        <div className="marca-thumbs">
          {imagens.map((src, idx) => (
            <button
              type="button"
              key={src}
              className={idx === i ? "on" : undefined}
              onClick={() => setI(idx)}
              aria-label={`Fotografia ${idx + 1} de ${nome}`}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
