"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

// Carrega um ficheiro de vídeo para o Vercel Blob e devolve o URL.
export default function VideoUploader({ onUploaded }) {
  const ref = useRef(null);
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  async function onChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEstado({ a: "loading", msg: "A enviar vídeo..." });
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      onUploaded?.(blob.url);
      setEstado({ a: "ok", msg: "Vídeo carregado." });
    } catch (err) {
      const m = err?.message || "";
      setEstado({
        a: "erro",
        msg: /token|blob/i.test(m) ? "Falta configurar o Vercel Blob." : m || "Falha.",
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
