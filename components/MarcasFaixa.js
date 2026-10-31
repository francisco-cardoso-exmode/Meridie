import L from "@/components/L";
import Foto from "@/components/Foto";

// Faixa de marcas representadas (Home): logótipo se existir, senão a foto do
// 1.º produto (fundo branco), senão a 1.ª foto da galeria.
export default function MarcasFaixa({ marcas }) {
  if (!marcas?.length) return null;
  return (
    <div className="marcas-faixa">
      {marcas.map((m) => {
        const foto = m.logo || m.produtos?.find((p) => p.imagem)?.imagem || m.imagens?.[0];
        return (
          <L href={`/marcas/${m.slug}`} key={m.slug} className="marcas-faixa-item" title={m.nome}>
            {foto && <Foto src={foto} alt={m.nome} width={240} height={120} sizes="240px" />}
            <span>{m.nome}</span>
          </L>
        );
      })}
    </div>
  );
}
