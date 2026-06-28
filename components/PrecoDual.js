import { precoDual } from "@/lib/empreendimentos";

// Mostra o preço na moeda principal (grande) e a conversão na outra (pequena).
// tipo: "exato" | "desde" | "intervalo" | "consulta"
// max: limite superior (só usado quando tipo === "intervalo").
export default function PrecoDual({ preco, moeda = "EUR", sub, tipo = "exato", max }) {
  if (tipo === "consulta") return <span className="pd-main">Sob consulta</span>;
  const d = precoDual(preco, moeda);
  if (!d) return <span className="pd-main">Sob consulta</span>;

  if (tipo === "intervalo" && Number(max) > Number(preco)) {
    const dMax = precoDual(Number(max), moeda);
    return (
      <>
        <span className="pd-main">
          {d.principal} – {dMax.principal}
          {sub ? <small> {sub}</small> : null}
        </span>
        <span className="pd-sec">
          ≈ {d.secundario} – {dMax.secundario}
        </span>
      </>
    );
  }

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
