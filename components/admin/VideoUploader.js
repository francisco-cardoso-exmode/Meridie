"use client";

import { useRef, useState } from "react";
import { enviarParaBlob } from "@/lib/uploadCliente";

// Carrega um ficheiro de vídeo diretamente para o Vercel Blob e devolve o URL.
export default function VideoUploader({ onUploaded }) {
  const ref = useRef(null);
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  async function onChange(e) {
    const file = e.target.files?.[0];
    if (ref.current) ref.current.value = "";
    if (!file) return;
    setEstado({ a: "loading", msg: "A enviar vídeo (pode demorar alguns minutos)..." });
    try {
      onUploaded?.(await enviarParaBlob(file));
      setEstado({ a: "ok", msg: "Vídeo carregado." });
    } catch (err) {
      setEstado({ a: "erro", msg: err?.message || "Falha no upload." });
    }
  }

  return (
    <span className="uploader" style={{ marginTop: 8 }}>
      <input ref={ref} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={onChange} />
      <button type="button" className="btn-upload" onClick={() => ref.current?.click()} disabled={estado.a === "loading"}>
        {estado.a === "loading" ? "A enviar..." : "⬆ Carregar vídeo"}
      </button>
      {estado.msg && <span className={`uploader-msg ${estado.a}`}>{estado.msg}</span>}
    </span>
  );
}
