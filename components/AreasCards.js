"use client";

import L from "@/components/L";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { useT } from "@/components/LangProvider";

// Cartões das áreas de negócio da Meridie (Home e Quem Somos).
const AREAS = {
  imobiliario: {
    icon: "buildings",
    titulo: "Imobiliário",
    texto: "Investimento entre Portugal e o Brasil, com intermediação e assessoria jurídica e fiscal num único processo.",
    href: "/empreendimentos",
    cta: "Ver empreendimentos",
  },
  marcas: {
    icon: "wine",
    titulo: "Bebidas & Alimentação",
    texto: "Representação de marcas com origem e carácter — vinhos, bebidas, conservas e azeite.",
    href: "/marcas",
    cta: "Conhecer as marcas",
  },
  tecnologia: {
    icon: "monitor",
    titulo: "Tecnologia",
    texto: "Soluções tecnológicas de parceiros e desenvolvimento próprio, com acompanhamento na implementação.",
    href: "/tecnologia",
    cta: "Explorar tecnologia",
  },
};

export default function AreasCards({ areas: pedidas = ["imobiliario", "marcas", "tecnologia"] }) {
  const { t } = useT();
  const areas = pedidas.filter((k) => k !== "tecnologia" || TECNOLOGIA_VISIVEL);
  return (
    <div className={`grid ${areas.length === 2 ? "grid-2" : "grid-3"}`}>
      {areas.map((k, i) => {
        const a = AREAS[k];
        return (
          <Reveal key={k} delay={i * 0.1}>
            <L href={a.href} className="card area-card">
              <div className="icon"><Icon name={a.icon} /></div>
              <h3>{t(a.titulo)}</h3>
              <p>{t(a.texto)}</p>
              <span className="pub-cta">{t(a.cta)} →</span>
            </L>
          </Reveal>
        );
      })}
    </div>
  );
}
