"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

/**
 * Galeria de imagens controlada — arrastar/largar OU clicar para abrir a pasta
 * do computador. Faz upload para o Vercel Blob e devolve os URLs via onChange.
 * Não mostra os links: só miniaturas, com remover. A 1.ª é a principal.
 *
 * Props: value (string[]), onChange(string[]), multiple (default true)
 */
export default function ImageUploader({ value = [], onChange, multiple = true }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const [dragIdx, setDragIdx] = useState(null);

  function reordenar(de, para) {
    if (de === null || de === para) return;
    const arr = [...value];
    const [m] = arr.splice(de, 1);
    arr.splice(para, 0, m);
    onChange?.(arr);
  }
  function principal(i) {
    if (i === 0) return;
    reordenar(i, 0);
  }

  async function enviar(fileList) {
    const files = Array.from(fileList || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!files.length) return;
    setEstado({ a: "loading", msg: `A enviar ${files.length} imagem(ns)...` });
    try {
      const novas = [];
      for (const file of files) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
        });
        novas.push(blob.url);
      }
      onChange?.(multiple ? [...value, ...novas] : [novas[novas.length - 1]]);
      setEstado({ a: "idle", msg: "" });
    } catch (err) {
      const m = err?.message || "";
      setEstado({
        a: "erro",
        msg:
          /token|blob/i.test(m)
            ? "Falta configurar o Vercel Blob (BLOB_READ_WRITE_TOKEN)."
            : m || "Falha no upload.",
      });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remover(i) {
    onChange?.(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="uploader2">
      <div
        className={`dropzone${drag ? " drag" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          enviar(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          hidden
          onChange={(e) => enviar(e.target.files)}
        />
        <div className="dz-icon">⬆</div>
        <div className="dz-text">
          {estado.a === "loading" ? (
            estado.msg
          ) : (
            <>
              <strong>Clica para escolher</strong> do computador
              <br />
              ou arrasta as imagens para aqui
            </>
          )}
        </div>
      </div>

      {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}

      {value.length > 0 && (
        <>
          {multiple && value.length > 1 && (
            <p className="uploader-hint">Arrasta para reordenar · a 1.ª é a principal</p>
          )}
          <div className="gallery-thumbs">
            {value.map((url, i) => (
              <div
                className={`gthumb${dragIdx === i ? " dragging" : ""}`}
                key={url + i}
                style={{ backgroundImage: `url(${url})` }}
                draggable={multiple}
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  reordenar(dragIdx, i);
                  setDragIdx(null);
                }}
                onDragEnd={() => setDragIdx(null)}
              >
                {multiple && i === 0 && <span className="gthumb-main">Principal</span>}
                {multiple && i !== 0 && (
                  <button
                    type="button"
                    className="gthumb-star"
                    title="Tornar principal"
                    onClick={() => principal(i)}
                  >
                    ★
                  </button>
                )}
                <button
                  type="button"
                  className="gthumb-x"
                  title="Remover"
                  onClick={() => remover(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
