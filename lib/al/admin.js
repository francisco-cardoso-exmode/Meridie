import { leAdmin } from "@/lib/leituraAdmin";

/** Opções de uma faceta a partir de valores ({ v, label }), sem repetidos, ordenadas. */
export function opcoes(valores, rotulo = (v) => v) {
  return [...new Set(valores.filter((v) => v != null && v !== ""))]
    .sort((a, b) => String(a).localeCompare(String(b), "pt"))
    .map((v) => ({ v: String(v), label: String(rotulo(v)) }));
}

/** Opções a partir de um mapa { valor: rótulo }. */
export const opcoesDeMapa = (mapa) => Object.entries(mapa).map(([v, label]) => ({ v, label }));

export { leAdmin };
