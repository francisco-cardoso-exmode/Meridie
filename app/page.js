import Link from "next/link";
import HeroSplit from "@/components/HeroSplit";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";
import RegionBanner from "@/components/RegionBanner";
import { getEmpreendimentosDestaque } from "@/lib/empreendimentos";
import { getRegiaoBySlug } from "@/lib/regioes";

export default function Home() {
  const destaques = getEmpreendimentosDestaque(6);
  const regioesDestaque = [
    "lisboa",
    "algarve",
    "sao-paulo",
    "rio-de-janeiro",
  ].map(getRegiaoBySlug);
  const regiaoFooter = getRegiaoBySlug("nordeste");

  return (
    <>
      {/* Hero split 100vh — escolha Portugal / Brasil */}
      <HeroSplit />

      {/* Diferenciais */}
      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Dois mercados, uma plataforma</span>
            <h2>Não somos uma agência. Somos o teu parceiro de investimento.</h2>
            <p>
              Portugal e o Brasil partilham língua e cultura, mas têm mercados,
              legislações e oportunidades distintas. Existimos precisamente
              nessa diferença — para a transformar em vantagem competitiva.
            </p>
          </Reveal>
          <div className="grid grid-3">
            {[
              ["shield-check", "Rede verificada", "Corretores, advogados e contabilistas selecionados e verificados em Portugal e no Brasil."],
              ["layers", "Processo integrado", "Da análise do imóvel à escritura, com apoio jurídico e fiscal em cada etapa — um único processo."],
              ["globe", "Dois mercados", "Presença e conhecimento real nos dois países — legislação, fiscalidade e dinâmicas locais. Não apenas contactos."],
            ].map(([icon, t, d], i) => (
              <Reveal className="card" key={t} delay={i * 0.1}>
                <div className="icon"><Icon name={icon} /></div>
                <h3>{t}</h3>
                <p>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Empreendimentos em destaque */}
      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Empreendimentos</span>
            <h2>Oportunidades em destaque</h2>
            <p>Uma seleção curada de imóveis nos dois mercados.</p>
          </Reveal>
          <div className="listing-grid">
            {destaques.map((e, i) => (
              <Reveal key={e.slug} delay={(i % 3) * 0.08}>
                <EmpreendimentoCard e={e} />
              </Reveal>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 36, flexWrap: "wrap" }}>
            <Link href="/portugal" className="btn btn-primary">
              Ver imóveis em Portugal
            </Link>
            <Link
              href="/brasil"
              className="btn btn-primary"
              style={{ background: "var(--navy)", color: "#fff" }}
            >
              Ver imóveis no Brasil
            </Link>
          </div>
        </div>
      </section>

      {/* Destaques por região (sponsor) */}
      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Explorar por região</span>
            <h2>Cada região, uma oportunidade</h2>
            <p>
              Descobre as vantagens de cada mercado e o que podes fazer
              acontecer — clica numa região para ver os empreendimentos.
            </p>
          </Reveal>
          <div className="region-grid">
            {regioesDestaque.map((r, i) => (
              <Reveal key={r.slug} delay={(i % 2) * 0.1}>
                <RegionBanner regiao={r} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Para quem é</span>
            <h2>Um serviço calibrado ao teu perfil</h2>
          </Reveal>
          <div className="grid grid-2">
            <Reveal className="card">
              <div className="icon">①</div>
              <h3>Investidor particular</h3>
              <p>
                Primeiro investimento no exterior? Guiamos-te em cada passo — da
                escolha do imóvel à documentação final, com total transparência
                sobre custos, impostos e prazos.
              </p>
            </Reveal>
            <Reveal className="card" delay={0.1}>
              <div className="icon">②</div>
              <h3>Investidor premium</h3>
              <p>
                Já investes e queres escalar para o mercado oposto? Trabalhamos
                como parceiros estratégicos: estruturação fiscal, acesso
                exclusivo a oportunidades e gestor dedicado.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Como funciona — resumo */}
      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Como funciona</span>
            <h2>Do primeiro contacto à escritura</h2>
            <p>
              Um processo desenhado para ser simples, previsível e seguro — sabes
              sempre em que fase estás e quem trabalha por ti.
            </p>
          </Reveal>
          <Reveal className="stats">
            {[
              ["1", "Contacto e perfil"],
              ["2", "Seleção de imóveis"],
              ["3", "Due diligence"],
              ["4", "Escritura e pós-venda"],
            ].map(([n, l]) => (
              <div className="stat" key={n}>
                <div className="num">{n}</div>
                <div className="label">{l}</div>
              </div>
            ))}
          </Reveal>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link href="/como-funciona" className="btn btn-primary">
              Ver o processo completo
            </Link>
          </div>
        </div>
      </section>

      {/* Banner regional pré-footer */}
      <section className="bg-soft">
        <div className="container">
          <Reveal>
            <RegionBanner regiao={regiaoFooter} />
          </Reveal>
        </div>
      </section>

      {/* CTA final */}
      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>Onde queres que o teu capital chegue?</h2>
            <p>
              Conta-nos os teus objetivos. Respondemos com uma primeira
              perspetiva e os próximos passos — sem compromisso.
            </p>
            <Link href="/contactos" className="btn btn-primary">
              Falar com um especialista
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
