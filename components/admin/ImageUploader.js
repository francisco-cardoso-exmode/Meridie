"use client";

import { useRef, useState } from "react";

// Redimensiona a imagem no browser (máx. 1920px) para ficar leve e dentro do
// limite de upload. Devolve um Blob (ou o ficheiro original se falhar).
async function redimensionar(file, maxW = 1920, q = 0.82) {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, maxW / bitmap.width);
    if (escala >= 1) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", q));
    return blob || file;
  } catch {
    return file;
  }
}

async function enviarFicheiro(file) {
  const fd = new FormData();
  const nome = (file.name || "imagem").replace(/\.\w+$/, "") + ".jpg";
  fd.append("file", file, file.name || nome);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.erro || "Falha no upload.");
  return json.url;
}

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
        const reduzido = await redimensionar(file);
        novas.push(await enviarFicheiro(reduzido));
      }
      onChange?.(multiple ? [...value, ...novas] : [novas[novas.length - 1]]);
      setEstado({ a: "idle", msg: "" });
    } catch (err) {
      const m = err?.message || "";
      setEstado({
        a: "erro",
        msg: /token|blob/i.test(m)
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
