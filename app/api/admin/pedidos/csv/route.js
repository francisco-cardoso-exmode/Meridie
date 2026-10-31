import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { listarPedidos } from "@/lib/pedidos";
import { ESTADOS_PEDIDO, MOTIVOS, linhaCsv } from "@/lib/pedido";

export const dynamic = "force-dynamic";

const data = (d) => {
  try {
    return new Date(d).toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" });
  } catch {
    return "";
  }
};
const euros = (n) => (n == null ? "" : String(n).replace(".", ","));

// Exportação CSV dos pedidos — uma linha por item (?estado= filtra).
export async function GET(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const estado = new URL(request.url).searchParams.get("estado") || undefined;
  const pedidos = await listarPedidos({ estado, limite: 5000 });
  const linhas = [
    linhaCsv([
      "Referência", "Data", "Estado", "Motivo", "Área", "Nome", "Empresa", "NIF", "Email", "Telefone", "País",
      "Morada de entrega", "Notas do cliente", "Idioma", "Item", "Marca/parceiro", "Quantidade", "Unidade",
      "Preço unitário (€)", "Total da linha (€)", "Subtotal do pedido (€)",
    ]),
  ];
  for (const p of pedidos) {
    const c = p.cliente || {};
    const base = [
      p.referencia, data(p.criadoEm), ESTADOS_PEDIDO[p.estado] || p.estado, MOTIVOS[p.motivo] || p.motivo, p.area,
      c.nome, c.empresa, c.nif, c.email, c.telefone, c.pais, c.morada, c.notas, p.idioma,
    ];
    for (const i of p.itens?.length ? p.itens : [{}]) {
      linhas.push(
        linhaCsv([
          ...base, i.nome, i.marca, i.quantidade, i.unidade,
          i.preco != null ? euros(i.preco) : i.nome ? "sob consulta" : "",
          euros(i.total), euros(p.subtotal ?? 0),
        ])
      );
    }
  }
  // BOM: o Excel reconhece o UTF-8 (acentos).
  const csv = "﻿" + linhas.join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
