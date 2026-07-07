"use client";

import { useState } from "react";
import Lightbox from "@/components/Lightbox";

// Galeria principal do empreendimento (imagem grande + 2 laterais). Clicar em
// qualquer foto abre o lightbox, que navega por TODAS as imagens do projeto.
export default function ProjetoGaleria({ imagens = [], nome = "" }) {
  const [indice, setIndice] = useState(null);
  if (!imagens.length) return null;

  const lado = imagens.slice(1, 3);
  const extra = imagens.length - 3;

  return (
    <>
      <div className="gallery">
        <div className="main">
          <button type="button" className="galeria-btn" onClick={() => setIndice(0)}>
            <img src={imagens[0]} alt={nome} />
          </button>
        </div>
        {lado.length > 0 && (
          <div className="side">
            {lado.map((img, i) => (
              <div key={i}>
                <button
                  type="button"
                  className="galeria-btn"
                  onClick={() => setIndice(i + 1)}
                >
                  <img src={img} alt={`${nome} — foto ${i + 2}`} loading="lazy" />
                  {i === lado.length - 1 && extra > 0 && (
                    <span className="galeria-mais">+{extra} fotos</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Lightbox imagens={imagens} nome={nome} indice={indice} onMudar={setIndice} />
    </>
  );
}
