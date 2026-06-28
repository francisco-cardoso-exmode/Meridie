"use client";

import { useState } from "react";

export default function DeleteButton({ slug, nome, endpoint = "empreendimentos" }) {
  const [a, setA] = useState("idle");

  async function apagar() {
    if (!confirm(`Apagar "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setA("loading");
    try {
      const res = await fetch(`/api/admin/${endpoint}/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("falhou");
      // Recarrega a página inteira (mais robusto que router.refresh em produção).
      window.location.reload();
    } catch {
      alert("Não foi possível apagar. Tenta novamente.");
      setA("idle");
    }
  }

  return (
    <button type="button" className="admin-del" onClick={apagar} disabled={a === "loading"}>
      {a === "loading" ? "..." : "Apagar"}
    </button>
  );
}
