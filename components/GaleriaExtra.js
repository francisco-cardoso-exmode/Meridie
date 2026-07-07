"use client";

import { useState } from "react";
import Lightbox from "@/components/Lightbox";

// Grelha de fotos extra (a partir da 4.ª). Clicar abre o lightbox no índice
// certo, navegando por todas as imagens do projeto.
export default function GaleriaExtra({ imagens = [], nome = "" }) {
  const [indice, setIndice] = useState(null);
  const extras = imagens.slice(3);
  if (!extras.length) return null;

  return (
    <>
      <div className="galeria-grid">
        {extras.map((img, i) => (
          <button
            type="button"
            className="galeria-item galeria-btn"
            key={i}
            onClick={() => setIndice(i + 3)}
          >
            <img src={img} alt={`${nome} — foto ${i + 4}`} loading="lazy" />
          </button>
        ))}
      </div>
      <Lightbox imagens={imagens} nome={nome} indice={indice} onMudar={setIndice} />
    </>
  );
}
