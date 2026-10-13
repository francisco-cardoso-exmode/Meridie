import Link from "next/link";

// Faixa de marcas representadas (Home): logótipo se existir, senão a foto do
// 1.º produto (fundo branco), senão a 1.ª foto da galeria.
export default function MarcasFaixa({ marcas }) {
  if (!marcas?.length) return null;
  return (
    <div className="marcas-faixa">
      {marcas.map((m) => {
        const foto = m.logo || m.produtos?.find((p) => p.imagem)?.imagem || m.imagens?.[0];
        return (
          <Link href={`/marcas/${m.slug}`} key={m.slug} className="marcas-faixa-item" title={m.nome}>
            {foto && <img src={foto} alt={m.nome} loading="lazy" />}
            <span>{m.nome}</span>
          </Link>
        );
      })}
    </div>
  );
}
