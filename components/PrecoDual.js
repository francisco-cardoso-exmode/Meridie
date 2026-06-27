import { precoDual } from "@/lib/empreendimentos";

// Mostra o preço na moeda principal (grande) e a conversão na outra (pequena).
// tipo: "exato" | "desde" | "consulta"
export default function PrecoDual({ preco, moeda = "EUR", sub, tipo = "exato" }) {
  if (tipo === "consulta") return <span className="pd-main">Sob consulta</span>;
  const d = precoDual(preco, moeda);
  if (!d) return <span className="pd-main">Sob consulta</span>;
  const prefixo = tipo === "desde" ? "Desde " : "";
  return (
    <>
      <span className="pd-main">
        {prefixo}
        {d.principal}
        {sub ? <small> {sub}</small> : null}
      </span>
      <span className="pd-sec">≈ {d.secundario}</span>
    </>
  );
}
