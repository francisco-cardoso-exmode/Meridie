import Link from "next/link";

// Faixa de marcas representadas (Home): logótipo se existir, senão a 1.ª foto.
export default function MarcasFaixa({ marcas }) {
  if (!marcas?.length) return null;
  return (
    <div className="marcas-faixa">
      {marcas.map((m) => (
        <Link href={`/marcas/${m.slug}`} key={m.slug} className="marcas-faixa-item" title={m.nome}>
          {m.logo || m.imagens?.[0] ? (
            <img src={m.logo || m.imagens[0]} alt={m.nome} loading="lazy" />
          ) : null}
          <span>{m.nome}</span>
        </Link>
      ))}
    </div>
  );
}
