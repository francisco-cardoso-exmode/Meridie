"use client";

import { useState } from "react";
import { useT } from "@/components/LangProvider";
import Foto from "@/components/Foto";

// Galeria simples da marca: foto grande + miniaturas.
export default function MarcaGaleria({ imagens, nome }) {
  const { t, tf } = useT();
  const [i, setI] = useState(0);
  return (
    <div className="marca-galeria">
      <div className="marca-galeria-main">
        <Foto src={imagens[i]} alt={nome} fill sizes="(max-width: 860px) 100vw, 820px" />
      </div>
      {imagens.length > 1 && (
        <div className="marca-thumbs">
          {imagens.map((src, idx) => (
            <button
              type="button"
              key={src}
              className={idx === i ? "on" : undefined}
              onClick={() => setI(idx)}
              aria-label={tf("Fotografia {i} de {nome}", { i: idx + 1, nome })}
            >
              <Foto src={src} alt="" width={160} height={160} sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
