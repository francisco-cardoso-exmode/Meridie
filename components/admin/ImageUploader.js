"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

/**
 * Carrega imagens para o Vercel Blob e devolve os URLs via onUploaded(urls[]).
 * O upload é direto do browser para o storage (suporta ficheiros grandes).
 */
export default function ImageUploader({ onUploaded, multiple = true }) {
  const inputRef = useRef(null);
  const [estado, setEstado] = useState({ a: "idle", msg: "" });

  async function onChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setEstado({ a: "loading", msg: `A enviar ${files.length} ficheiro(s)...` });

    try {
      const urls = [];
      for (const file of files) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
        });
        urls.push(blob.url);
      }
      onUploaded?.(urls);
      setEstado({ a: "ok", msg: `${urls.length} imagem(ns) carregada(s).` });
    } catch (err) {
      setEstado({
        a: "erro",
        msg: err?.message?.includes("token")
          ? "Falta configurar o Vercel Blob (BLOB_READ_WRITE_TOKEN)."
          : err?.message || "Falha no upload.",
      });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={onChange}
        hidden
      />
      <button
        type="button"
        className="btn-upload"
        onClick={() => inputRef.current?.click()}
        disabled={estado.a === "loading"}
      >
        {estado.a === "loading" ? "A enviar..." : "⬆ Carregar imagens"}
      </button>
      {estado.msg && (
        <span className={`uploader-msg ${estado.a}`}>{estado.msg}</span>
      )}
    </div>
  );
}
