"use client";

import { useState } from "react";
import { pedidoAdmin } from "@/lib/adminCliente";

export default function DeleteButton({ slug, nome, endpoint = "empreendimentos" }) {
  const [a, setA] = useState("idle");

  async function apagar() {
    if (!confirm(`Apagar "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setA("loading");
    const r = await pedidoAdmin(`/api/admin/${endpoint}/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    // 404: já não existia — recarregar mostra a lista certa.
    if (r.ok || r.status === 404) {
      // Recarrega a página inteira (mais robusto que router.refresh em produção).
      window.location.reload();
      return;
    }
    alert(r.erro || "Não foi possível apagar. Tenta novamente.");
    setA("idle");
  }

  return (
    <button type="button" className="admin-del" onClick={apagar} disabled={a === "loading"}>
      {a === "loading" ? "..." : "Apagar"}
    </button>
  );
}
