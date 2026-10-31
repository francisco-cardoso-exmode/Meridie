"use client";

import { useState } from "react";
import Lightbox from "@/components/Lightbox";
import { useT } from "@/components/LangProvider";
import Foto from "@/components/Foto";

// Grelha de fotos extra (a partir da 4.ª). Clicar abre o lightbox no índice
// certo, navegando por todas as imagens do projeto.
export default function GaleriaExtra({ imagens = [], nome = "" }) {
  const { tf } = useT();
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
            <Foto src={img} alt={tf("{nome} — foto {i}", { nome, i: i + 4 })} fill sizes="(max-width: 700px) 50vw, 33vw" />
          </button>
        ))}
      </div>
      <Lightbox imagens={imagens} nome={nome} indice={indice} onMudar={setIndice} />
    </>
  );
}
