"use client";

import { useT } from "@/components/LangProvider";

// Card de publicidade/anúncio (hotel, restaurante, parceiro, ou região/cidade).
export default function AnuncioCard({ anuncio: a }) {
  const { t, href } = useT();
  const externo = a.url && /^https?:\/\//.test(a.url);
  return (
    <a
      href={a.url ? href(a.url) : "#"}
      target={externo ? "_blank" : undefined}
      rel="noopener"
      className="pub-card"
    >
      {a.imagem && <img src={a.imagem} alt={a.titulo} loading="lazy" />}
      <div className="pub-body">
        <span className="rb-tag">{t(a.categoria || "Publicidade")}</span>
        <h3>{a.titulo}</h3>
        {a.cidade && <div className="pub-cidade">{a.cidade}</div>}
        {a.texto && <p>{a.texto}</p>}
        {a.vantagem && (
          <p className="pub-vantagem">
            <strong>{t("Vantagem Meridie:")}</strong> {a.vantagem}
          </p>
        )}
        {a.url && <span className="pub-cta">{t("Saber mais ↗")}</span>}
      </div>
    </a>
  );
}
