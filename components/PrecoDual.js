import { precoDual } from "@/lib/empreendimentos";

// Mostra o preço na moeda principal (grande) e a conversão na outra (pequena).
export default function PrecoDual({ preco, moeda = "EUR", sub }) {
  const d = precoDual(preco, moeda);
  if (!d) return <span className="pd-main">Sob consulta</span>;
  return (
    <>
      <span className="pd-main">
        {d.principal}
        {sub ? <small> {sub}</small> : null}
      </span>
      <span className="pd-sec">≈ {d.secundario}</span>
    </>
  );
}
