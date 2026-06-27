"use client";

import { motion } from "framer-motion";

/**
 * Reveal — anima os filhos quando entram no viewport (scroll).
 * Fade + subida suave, uma única vez. Respeita prefers-reduced-motion
 * (o framer-motion desativa automaticamente quando o utilizador o pede).
 *
 * Props:
 *  - as: elemento a renderizar ("div" por defeito; aceita "section", "li"…)
 *  - delay: atraso em segundos (para efeito escalonado)
 *  - y: deslocamento inicial vertical (px)
 */
export default function Reveal({
  as = "div",
  delay = 0,
  y = 28,
  className,
  children,
  ...rest
}) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
