"use client";

import { useState } from "react";

export default function Accordion({ itens }) {
  const [aberto, setAberto] = useState(null);

  return (
    <div className="accordion">
      {itens.map((item, i) => {
        const open = aberto === i;
        return (
          <div key={i} className={`acc-item${open ? " open" : ""}`}>
            <button
              type="button"
              className="acc-q"
              aria-expanded={open}
              onClick={() => setAberto(open ? null : i)}
            >
              {item.q}
              <span className="sign">+</span>
            </button>
            {open && <div className="acc-a">{item.a}</div>}
          </div>
        );
      })}
    </div>
  );
}
