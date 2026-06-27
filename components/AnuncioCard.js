// Card de publicidade/anúncio (hotel, restaurante, parceiro, ou região/cidade).
export default function AnuncioCard({ anuncio: a }) {
  const externo = a.url && /^https?:\/\//.test(a.url);
  return (
    <a
      href={a.url || "#"}
      target={externo ? "_blank" : undefined}
      rel="noopener"
      className="pub-card"
    >
      {a.imagem && <img src={a.imagem} alt={a.titulo} loading="lazy" />}
      <div className="pub-body">
        <span className="rb-tag">Publicidade</span>
        <h3>{a.titulo}</h3>
        {a.texto && <p>{a.texto}</p>}
        {a.url && <span className="pub-cta">Saber mais ↗</span>}
      </div>
    </a>
  );
}
