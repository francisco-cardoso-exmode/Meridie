"use client";

import { precoDual } from "@/lib/empreendimentos";
import { etiquetaCambio } from "@/lib/cambio";
import { useTaxaEurBrl } from "@/components/CambioProvider";

// Mostra o preço na moeda principal (grande) e a conversão na outra (pequena),
// sempre ao câmbio do momento (ver components/CambioProvider.js).
// tipo: "exato" | "desde" | "intervalo" | "consulta"
// max: limite superior (só usado quando tipo === "intervalo").
export default function PrecoDual({ preco, moeda = "EUR", sub, tipo = "exato", max }) {
  const taxa = useTaxaEurBrl();
  if (tipo === "consulta") return <span className="pd-main">Sob consulta</span>;
  const d = precoDual(preco, moeda, taxa);
  if (!d) return <span className="pd-main">Sob consulta</span>;
  const titulo = etiquetaCambio(taxa);

  if (tipo === "intervalo" && Number(max) > Number(preco)) {
    const dMax = precoDual(Number(max), moeda, taxa);
    return (
      <>
        <span className="pd-main">
          {d.principal} – {dMax.principal}
          {sub ? <small> {sub}</small> : null}
        </span>
        <span className="pd-sec" title={titulo}>
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
      <span className="pd-sec" title={titulo}>
        ≈ {d.secundario}
      </span>
    </>
  );
}
