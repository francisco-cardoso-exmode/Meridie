"use client";

import { useRef, useState } from "react";
import { enviarParaBlob } from "@/lib/uploadCliente";

// Formato de saída ao reduzir: PNG continua PNG (logótipos com transparência),
// WebP/AVIF passam a WebP (também com transparência), o resto JPEG.
const SAIDA = { "image/png": "image/png", "image/webp": "image/webp", "image/avif": "image/webp" };

// Redimensiona a imagem no browser (máx. 1920px) para ficar leve. GIF não se
// mexe (pode ser animado). Devolve um Blob (ou o ficheiro original se falhar).
async function redimensionar(file, maxW = 1920, q = 0.82) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, maxW / bitmap.width);
    if (escala >= 1) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const tipo = SAIDA[file.type] || "image/jpeg";
    const blob = await new Promise((res) => canvas.toBlob(res, tipo, q));
    // Se o browser não souber gerar o formato pedido (devolve PNG), fica o original.
    return blob && blob.type === tipo ? blob : file;
  } catch {
    return file;
  }
}

/**
 * Galeria de imagens controlada — arrastar/largar OU clicar para abrir a pasta
 * do computador. Faz upload direto para o Vercel Blob e devolve os URLs via
 * onChange. Não mostra os links: só miniaturas, com remover. A 1.ª é a principal.
 *
 * Props: value (string[]), onChange(string[]), multiple (default true)
 */
export default function ImageUploader({ value = [], onChange, multiple = true }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const [dragIdx, setDragIdx] = useState(null);
  // Valor mais recente: o `value` capturado no início de um upload longo pode
  // já estar desatualizado quando cada ficheiro termina.
  const atual = useRef(value);
  atual.current = value;
  const aEnviar = estado.a === "loading";

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

  // Envia um ficheiro de cada vez e acrescenta cada URL logo que termina —
  // se um falhar, os anteriores já ficaram no formulário.
  async function enviar(fileList) {
    if (aEnviar) return;
    let files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!multiple) files = files.slice(-1);
    if (inputRef.current) inputRef.current.value = "";
    if (!files.length) return;
    const erros = [];
    for (let i = 0; i < files.length; i++) {
      setEstado({
        a: "loading",
        msg: files.length > 1 ? `A enviar imagem ${i + 1} de ${files.length}...` : "A enviar imagem...",
      });
      try {
        const url = await enviarParaBlob(await redimensionar(files[i]), files[i].name);
        const novo = multiple ? [...atual.current, url] : [url];
        atual.current = novo;
        onChange?.(novo);
      } catch (err) {
        erros.push(`${files[i].name}: ${err?.message || "falha no upload."}`);
      }
    }
    setEstado(erros.length ? { a: "erro", msg: erros.join("\n") } : { a: "idle", msg: "" });
  }

  function remover(i) {
    onChange?.(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="uploader2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple={multiple}
        hidden
        disabled={aEnviar}
        onChange={(e) => enviar(e.target.files)}
      />
      <div
        className={`dropzone${drag ? " drag" : ""}${aEnviar ? " a-enviar" : ""}`}
        aria-disabled={aEnviar}
        onDragOver={(e) => {
          e.preventDefault();
          if (!aEnviar) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          enviar(e.dataTransfer.files);
        }}
        onClick={() => !aEnviar && inputRef.current?.click()}
      >
        <div className="dz-icon">⬆</div>
        <div className="dz-text">
          {aEnviar ? (
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

      {estado.a === "erro" && (
        <div className="form-msg erro" style={{ whiteSpace: "pre-line" }}>
          {estado.msg}
        </div>
      )}

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
