"use client";

import { useRef, useState } from "react";

// Carrega um ficheiro de vídeo para o Vercel Blob e devolve o URL.
export default function VideoUploader({ onUploaded }) {
  const ref = useRef(null);
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  async function onChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEstado({ a: "loading", msg: "A enviar vídeo..." });
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.erro || "Falha.");
      onUploaded?.(json.url);
      setEstado({ a: "ok", msg: "Vídeo carregado." });
    } catch (err) {
      const m = err?.message || "";
      setEstado({
        a: "erro",
        msg: /413|large|size/i.test(m)
          ? "Vídeo demasiado grande — usa um link do YouTube/Vimeo."
          : m || "Falha.",
      });
    } finally {
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <span className="uploader" style={{ marginTop: 8 }}>
      <input ref={ref} type="file" accept="video/*" hidden onChange={onChange} />
      <button type="button" className="btn-upload" onClick={() => ref.current?.click()} disabled={estado.a === "loading"}>
        {estado.a === "loading" ? "A enviar..." : "⬆ Carregar vídeo"}
      </button>
      {estado.msg && <span className={`uploader-msg ${estado.a}`}>{estado.msg}</span>}
    </span>
  );
}
