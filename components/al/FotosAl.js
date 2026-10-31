"use client";

import { useRef, useState } from "react";
import { useT } from "@/components/LangProvider";
import { enviarFotoAl } from "@/lib/al/uploadCliente";

/**
 * Fotos no telemóvel: "Tirar foto" abre a câmara traseira
 * (capture="environment"), "Galeria" escolhe ficheiros. Reduz no browser e
 * envia direto para o Blob. Controlado: value (URLs) + onChange.
 */
export default function FotosAl({ value = [], onChange, rota, pasta, payload, max = 30, camara = true }) {
  const { t, tf } = useT();
  const camRef = useRef(null);
  const galRef = useRef(null);
  const atual = useRef(value);
  atual.current = value;
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const aEnviar = estado.a === "loading";

  async function enviar(lista) {
    const files = Array.from(lista || []).filter((f) => f.type.startsWith("image/") || !f.type);
    if (camRef.current) camRef.current.value = "";
    if (galRef.current) galRef.current.value = "";
    if (!files.length || aEnviar) return;
    const erros = [];
    for (let i = 0; i < files.length && atual.current.length < max; i++) {
      setEstado({ a: "loading", msg: tf("A enviar foto {i} de {n}…", { i: i + 1, n: files.length }) });
      try {
        const url = await enviarFotoAl(files[i], { rota, pasta, payload });
        const novo = [...atual.current, url];
        atual.current = novo;
        onChange?.(novo);
      } catch (e) {
        erros.push(e?.message || t("Falha no envio."));
      }
    }
    setEstado(erros.length ? { a: "erro", msg: erros.join("\n") } : { a: "idle", msg: "" });
  }

  return (
    <div className="al-fotos">
      <div className="al-fotos-botoes">
        {camara && (
          <button type="button" className="al-btn al-btn-grande" disabled={aEnviar} onClick={() => camRef.current?.click()}>
            📷 {t("Tirar foto")}
          </button>
        )}
        <button type="button" className="al-btn al-btn-sec al-btn-grande" disabled={aEnviar} onClick={() => galRef.current?.click()}>
          🖼 {t("Escolher da galeria")}
        </button>
      </div>
      <input ref={camRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => enviar(e.target.files)} />
      <input ref={galRef} type="file" accept="image/*" multiple hidden onChange={(e) => enviar(e.target.files)} />
      {estado.msg && (
        <p className={`al-msg ${estado.a === "erro" ? "erro" : ""}`} style={{ whiteSpace: "pre-line" }} role="status">
          {estado.msg}
        </p>
      )}
      {value.length > 0 && (
        <div className="al-thumbs">
          {value.map((url, i) => (
            <div key={url} className="al-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={tf("Foto {i}", { i: i + 1 })} loading="lazy" />
              <button type="button" aria-label={t("Remover foto")} onClick={() => onChange?.(value.filter((_, j) => j !== i))}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
