"use client";

import { useT } from "@/components/LangProvider";
import { formataPreco, temPreco } from "@/lib/catalogo";

// Preço de um produto ou plano: "12 € / garrafa 75 cl" ou "Preço sob consulta".
export default function PrecoProduto({ p, grande = false }) {
  const { t, lang } = useT();
  const com = temPreco(p);
  return (
    <div className={`preco-produto${grande ? " grande" : ""}${com ? "" : " consulta"}`}>
      {com ? (
        <>
          <strong>{formataPreco(p.preco, lang)}</strong>
          {p.unidade && <span className="preco-unidade"> / {p.unidade}</span>}
        </>
      ) : (
        <>
          <strong>{t("Preço sob consulta")}</strong>
          {p.unidade && <span className="preco-unidade"> · {p.unidade}</span>}
        </>
      )}
      {Number(p.minimo) > 1 && (
        <span className="preco-minimo">{t("Mínimo")}: {p.minimo}</span>
      )}
    </div>
  );
}
