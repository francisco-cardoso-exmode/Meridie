"use client";

import L from "@/components/L";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";

// Cartões das áreas de negócio da Meridie (Home e Quem Somos). Os textos vêm
// da página "Áreas de negócio" do backoffice (`textos` = getConteudo("areas")):
// <área>Titulo, <área>Texto e <área>Cta.
const AREAS = {
  imobiliario: { icon: "buildings", href: "/empreendimentos" },
  marcas: { icon: "wine", href: "/representacoes" },
  tecnologia: { icon: "monitor", href: "/tecnologia" },
  alojamento: { icon: "key", href: "/inscreve-a-tua-casa" },
};

export default function AreasCards({ areas: pedidas = ["imobiliario", "marcas", "tecnologia", "alojamento"], textos }) {
  const areas = pedidas.filter((k) => k !== "tecnologia" || TECNOLOGIA_VISIVEL);
  return (
    <div className={`grid ${areas.length % 2 === 0 ? "grid-2" : "grid-3"}`}>
      {areas.map((k, i) => {
        const a = AREAS[k];
        return (
          <Reveal key={k} delay={i * 0.1}>
            <L href={a.href} className="card area-card">
              <div className="icon"><Icon name={a.icon} /></div>
              <h3>{textos[`${k}Titulo`]}</h3>
              <p>{textos[`${k}Texto`]}</p>
              <span className="pub-cta">{textos[`${k}Cta`]} →</span>
            </L>
          </Reveal>
        );
      })}
    </div>
  );
}
