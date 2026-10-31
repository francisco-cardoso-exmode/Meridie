"use client";

import { useState } from "react";
import Lightbox from "@/components/Lightbox";
import { useT } from "@/components/LangProvider";
import Foto from "@/components/Foto";

// Galeria principal do empreendimento (imagem grande + 2 laterais). Clicar em
// qualquer foto abre o lightbox, que navega por TODAS as imagens do projeto.
export default function ProjetoGaleria({ imagens = [], nome = "" }) {
  const { t, tf } = useT();
  const [indice, setIndice] = useState(null);
  if (!imagens.length) return null;

  const lado = imagens.slice(1, 3);
  const extra = imagens.length - 3;

  return (
    <>
      <div className="gallery">
        <div className="main">
          <button type="button" className="galeria-btn" onClick={() => setIndice(0)}>
            <Foto src={imagens[0]} alt={nome} fill sizes="(max-width: 900px) 100vw, 66vw" priority />
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
                  <Foto src={img} alt={tf("{nome} — foto {i}", { nome, i: i + 2 })} fill sizes="(max-width: 900px) 50vw, 33vw" />
                  {i === lado.length - 1 && extra > 0 && (
                    <span className="galeria-mais">+{extra} {t("fotos")}</span>
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
