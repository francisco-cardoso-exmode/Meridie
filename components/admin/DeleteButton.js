"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ slug, nome }) {
  const router = useRouter();
  const [a, setA] = useState("idle");

  async function apagar() {
    if (!confirm(`Apagar "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setA("loading");
    await fetch(`/api/admin/empreendimentos/${slug}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button type="button" className="admin-del" onClick={apagar} disabled={a === "loading"}>
      {a === "loading" ? "..." : "Apagar"}
    </button>
  );
}
