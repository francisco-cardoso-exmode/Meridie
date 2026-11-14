"use client";

import { useRef, useState } from "react";
import { enviarParaBlob } from "@/lib/uploadCliente";

// Formato de saída ao reduzir: PNG continua PNG (logótipos com transparência),
// WebP/AVIF passam a WebP (também com transparência), o resto JPEG.
const SAIDA = { "image/png": "image/png", "image/webp": "image/webp", "image/avif": "image/webp" };

// Reduz a imagem no browser: lado maior até 1920 px e, se ainda passar de
// ALVO, baixa a qualidade e depois o tamanho até caber (as fotos ficam leves
// para o site e o envio nunca bate no limite da Vercel). GIF não se mexe (pode
// ser animado). Devolve um Blob (ou o ficheiro original se não der).
const ALVO = 3.5 * 1024 * 1024;
const LEVE = 1024 * 1024; // abaixo disto e já pequena, fica como está

async function redimensionar(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const lado = Math.max(bitmap.width, bitmap.height);
    if (lado <= 1920 && file.size <= LEVE) return file;
    let tipo = SAIDA[file.type] || "image/jpeg";
    const canvas = document.createElement("canvas");
    const gerar = (maxLado, q) => {
      const escala = Math.min(1, maxLado / lado);
      canvas.width = Math.round(bitmap.width * escala);
      canvas.height = Math.round(bitmap.height * escala);
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      return new Promise((res) => canvas.toBlob(res, tipo, q));
    };
    let melhor = null;
    for (const [maxLado, q] of [[1920, 0.85], [1920, 0.75], [1600, 0.72], [1280, 0.7], [1024, 0.65]]) {
      let blob = await gerar(maxLado, q);
      // Se o browser não souber gerar o formato pedido, tenta em JPEG.
      if (!blob || blob.type !== tipo) {
        tipo = "image/jpeg";
        blob = await gerar(maxLado, q);
      }
      if (!blob) break;
      melhor = blob;
      if (blob.size <= ALVO) break;
    }
    return melhor && melhor.size < file.size ? melhor : file;
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
    const todos = Array.from(fileList || []);
    let files = todos.filter((f) => f.type.startsWith("image/"));
    if (!multiple) files = files.slice(-1);
    if (inputRef.current) inputRef.current.value = "";
    if (!files.length) {
      // Nunca falhar em silêncio: dizer porque é que nada aconteceu.
      if (todos.length)
        setEstado({ a: "erro", msg: "Esse ficheiro não é uma imagem. Usa JPG, PNG ou WebP." });
      return;
    }
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
          // Imagem arrastada de outra página web: o browser só entrega o link, não o ficheiro.
          if (!e.dataTransfer.files?.length) {
            const link = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
            setEstado({
              a: "erro",
              msg: link
                ? "Arrastaste a imagem de outra página — assim o browser só envia o link. Guarda-a primeiro no computador (botão direito → Guardar imagem como…) e depois arrasta o ficheiro ou clica para o escolher."
                : "Não chegou nenhum ficheiro. Clica para escolher a imagem no computador.",
            });
            return;
          }
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
            <p className="uploader-hint">Arrasta ou usa as setas ‹ › para reordenar · a 1.ª é a principal</p>
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
                {/* Setas: reordenar no telemóvel (o arrastar do browser não funciona ao toque). */}
                {multiple && value.length > 1 && (
                  <span className="gthumb-mover">
                    <button type="button" title="Mover para trás" aria-label="Mover para trás" disabled={i === 0} onClick={() => reordenar(i, i - 1)}>
                      ‹
                    </button>
                    <button
                      type="button"
                      title="Mover para a frente"
                      aria-label="Mover para a frente"
                      disabled={i === value.length - 1}
                      onClick={() => reordenar(i, i + 1)}
                    >
                      ›
                    </button>
                  </span>
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
