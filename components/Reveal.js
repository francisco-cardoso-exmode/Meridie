"use client";

import { useEffect, useRef } from "react";

/**
 * Reveal — fade + subida suave quando o bloco entra no viewport (uma vez).
 * CSS + IntersectionObserver, sem bibliotecas (ver .reveal em globals.css).
 *
 * O conteúdo é sempre visível no HTML: só depois de montar, e só para os
 * blocos que ainda estão fora do ecrã, se aplica o estado inicial escondido
 * (.reveal-pendente). Assim, sem JS tudo aparece, o que está acima da dobra
 * nunca pisca (bom para o LCP) e com prefers-reduced-motion não há animação.
 * Não usar à volta de <h1>.
 *
 * Props:
 *  - as: elemento a renderizar ("div" por defeito; aceita "section", "li"…)
 *  - delay: atraso em segundos (para efeito escalonado)
 *  - y: deslocamento inicial vertical (px)
 */

let observador = null;
const callbacks = new WeakMap();

function observar(el, cb) {
  if (!observador) {
    observador = new IntersectionObserver(
      (entradas) => {
        for (const en of entradas) {
          if (!en.isIntersecting) continue;
          observador.unobserve(en.target);
          callbacks.get(en.target)?.();
          callbacks.delete(en.target);
        }
      },
      { rootMargin: "0px 0px -80px 0px" }
    );
  }
  callbacks.set(el, cb);
  observador.observe(el);
  return () => {
    observador?.unobserve(el);
    callbacks.delete(el);
  };
}

export default function Reveal({
  as: Tag = "div",
  delay = 0,
  y = 28,
  className,
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // Já visível ao montar: fica como está, sem animação.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;

    el.classList.add("reveal-pendente");
    return observar(el, () => {
      el.classList.remove("reveal-pendente");
    });
  }, []);

  return (
    <Tag
      ref={ref}
      className={className ? `reveal ${className}` : "reveal"}
      style={{
        ...style,
        "--reveal-y": `${y}px`,
        ...(delay ? { "--reveal-atraso": `${delay}s` } : null),
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
