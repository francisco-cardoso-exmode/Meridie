"use client";

import { useId, useState } from "react";

// As respostas estão sempre no HTML (só escondidas com o atributo hidden),
// para os motores de busca; sem JS, o <noscript> mostra-as todas abertas.
export default function Accordion({ itens }) {
  const [aberto, setAberto] = useState(null);
  const base = useId();

  return (
    <div className="accordion">
      <noscript>
        <style>{`.acc-a[hidden]{display:block}`}</style>
      </noscript>
      {itens.map((item, i) => {
        const open = aberto === i;
        const idQ = `${base}-q${i}`;
        const idA = `${base}-a${i}`;
        return (
          <div key={i} className={`acc-item${open ? " open" : ""}`}>
            <button
              type="button"
              id={idQ}
              className="acc-q"
              aria-expanded={open}
              aria-controls={idA}
              onClick={() => setAberto(open ? null : i)}
            >
              {item.q}
              <span className="sign" aria-hidden="true">+</span>
            </button>
            <div id={idA} className="acc-a" role="region" aria-labelledby={idQ} hidden={!open}>
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
