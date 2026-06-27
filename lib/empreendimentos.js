/**
 * Camada de dados dos empreendimentos.
 *
 * Fonte estática — a navegação e os filtros não dependem de base de dados.
 * Para adicionar imóveis, basta acrescentar objetos ao array `EMPREENDIMENTOS`.
 * As fotos são URLs do Unsplash (placeholder profissional) — trocar por fotos
 * reais quando disponíveis.
 */

const u = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1280&q=70`;

export const EMPREENDIMENTOS = [
  // ───────────────────────── PORTUGAL ─────────────────────────
  {
    slug: "infinity-tower-lisboa",
    nome: "Infinity Tower",
    pais: "portugal",
    cidade: "Lisboa",
    zona: "Parque das Nações",
    tipo: "Apartamento",
    finalidade: "Investimento",
    preco: 685000,
    moeda: "EUR",
    quartos: 3,
    casasBanho: 2,
    area: 132,
    estado: "Pronto",
    destaque: true,
    resumo:
      "T3 de luxo com vista rio na zona mais moderna de Lisboa, com arrendamento de longa duração garantido.",
    descricao:
      "Localizado no coração do Parque das Nações, o Infinity Tower é um dos endereços mais procurados de Lisboa. Este T3 oferece acabamentos premium, varanda voltada ao Tejo, e acesso a piscina, ginásio e segurança 24h. A zona combina liquidez, procura de arrendamento elevada e valorização consistente — ideal para o investidor que procura rendimento estável em moeda forte.",
    caracteristicas: [
      "Vista rio Tejo",
      "Piscina e ginásio no edifício",
      "Lugar de garagem duplo",
      "Cozinha equipada premium",
      "Segurança 24 horas",
      "Certificado energético A",
    ],
    imagens: [u("1545324418-cc1a3fa10c00"), u("1502672260266-1c1ef2d93688"), u("1560448204-e02f11c3d0e2")],
  },
  {
    slug: "douro-riverside-porto",
    nome: "Douro Riverside",
    pais: "portugal",
    cidade: "Porto",
    zona: "Ribeira",
    tipo: "Apartamento",
    finalidade: "Férias",
    preco: 420000,
    moeda: "EUR",
    quartos: 2,
    casasBanho: 2,
    area: 94,
    estado: "Em construção",
    destaque: true,
    resumo:
      "T2 reabilitado na Ribeira do Porto, a metros do rio Douro, com forte potencial de alojamento local.",
    descricao:
      "Num edifício histórico totalmente reabilitado na Ribeira — Património Mundial UNESCO — este T2 une o charme original às comodidades modernas. A localização turística de excelência e a procura constante tornam-no num ativo de elevada rentabilidade para arrendamento de curta duração ou férias.",
    caracteristicas: [
      "Edifício histórico reabilitado",
      "A 100 m do rio Douro",
      "Licença de alojamento local viável",
      "Acabamentos contemporâneos",
      "Centro histórico pedonal",
    ],
    imagens: [u("1502005229762-cf1b2da7c5d6"), u("1493809842364-78817add7ffb"), u("1600607687939-ce8a6c25118c")],
  },
  {
    slug: "vilamoura-marina-villas",
    nome: "Marina Villas",
    pais: "portugal",
    cidade: "Vilamoura",
    zona: "Algarve",
    tipo: "Moradia",
    finalidade: "Férias",
    preco: 1250000,
    moeda: "EUR",
    quartos: 4,
    casasBanho: 4,
    area: 285,
    estado: "Pronto",
    destaque: true,
    resumo:
      "Moradia V4 com piscina privada junto à marina de Vilamoura, no coração do mercado de luxo algarvio.",
    descricao:
      "A poucos minutos da marina e das praias do Algarve, esta moradia V4 oferece piscina privada, jardim, e arquitetura contemporânea de linhas limpas. O Algarve mantém procura internacional constante e um mercado de luxo resiliente — uma escolha sólida para segunda habitação ou investimento de férias premium.",
    caracteristicas: [
      "Piscina privada e jardim",
      "Junto à marina de Vilamoura",
      "Garagem para 2 viaturas",
      "Domótica integrada",
      "Campos de golfe nas imediações",
    ],
    imagens: [u("1600585154340-be6161a56a0c"), u("1512917774080-9991f1c4c750"), u("1568605114967-8130f3a36994")],
  },
  {
    slug: "cascais-bay-residences",
    nome: "Cascais Bay Residences",
    pais: "portugal",
    cidade: "Cascais",
    zona: "Linha de Cascais",
    tipo: "Apartamento",
    finalidade: "Habitação",
    preco: 790000,
    moeda: "EUR",
    quartos: 3,
    casasBanho: 2,
    area: 145,
    estado: "Em planta",
    destaque: false,
    resumo:
      "T3 em empreendimento novo a 5 minutos da baía de Cascais, com entrega prevista para 2027.",
    descricao:
      "Empreendimento de nova geração na elegante vila de Cascais, combinando proximidade ao mar, comércio sofisticado e excelentes acessos a Lisboa. Comprar em planta permite condições de pagamento faseado e valorização durante a construção.",
    caracteristicas: [
      "Compra em planta (pagamento faseado)",
      "A 5 min da baía de Cascais",
      "Áreas comuns ajardinadas",
      "Acesso direto à A5 / Lisboa",
      "Entrega prevista 2027",
    ],
    imagens: [u("1600596542815-ffad4c1539a9"), u("1600607687939-ce8a6c25118c"), u("1560448204-e02f11c3d0e2")],
  },
  {
    slug: "chiado-prime-loft",
    nome: "Chiado Prime Loft",
    pais: "portugal",
    cidade: "Lisboa",
    zona: "Chiado",
    tipo: "Estúdio",
    finalidade: "Investimento",
    preco: 345000,
    moeda: "EUR",
    quartos: 1,
    casasBanho: 1,
    area: 52,
    estado: "Pronto",
    destaque: false,
    resumo:
      "Estúdio premium no Chiado, a zona mais central e valorizada de Lisboa, ideal para rendimento urbano.",
    descricao:
      "No coração do Chiado, este estúdio totalmente renovado é perfeito para arrendamento urbano de longa duração ou uso próprio em viagens. Liquidez máxima, procura permanente e localização inigualável definem este ativo de entrada no mercado prime de Lisboa.",
    caracteristicas: [
      "Localização prime no Chiado",
      "Totalmente renovado",
      "Elevado potencial de arrendamento",
      "Mobiliário incluído (opcional)",
      "Transportes à porta",
    ],
    imagens: [u("1493809842364-78817add7ffb"), u("1502005229762-cf1b2da7c5d6"), u("1502672260266-1c1ef2d93688")],
  },
  {
    slug: "boavista-garden-porto",
    nome: "Boavista Garden",
    pais: "portugal",
    cidade: "Porto",
    zona: "Boavista",
    tipo: "Apartamento",
    finalidade: "Habitação",
    preco: 510000,
    moeda: "EUR",
    quartos: 3,
    casasBanho: 2,
    area: 128,
    estado: "Em construção",
    destaque: false,
    resumo:
      "T3 novo na Boavista, zona nobre do Porto, com jardins privativos e ótimos acessos.",
    descricao:
      "Empreendimento contemporâneo na prestigiada Avenida da Boavista, junto à Casa da Música. Apartamentos amplos e luminosos, com áreas verdes e estacionamento, numa cidade em valorização acelerada e com forte dinâmica universitária e empresarial.",
    caracteristicas: [
      "Avenida da Boavista",
      "Jardins privativos",
      "Estacionamento incluído",
      "Junto à Casa da Música",
      "Certificado energético A+",
    ],
    imagens: [u("1545324418-cc1a3fa10c00"), u("1600607687939-ce8a6c25118c"), u("1493809842364-78817add7ffb")],
  },

  // ───────────────────────── BRASIL ─────────────────────────
  {
    slug: "jardins-prime-sao-paulo",
    nome: "Jardins Prime",
    pais: "brasil",
    cidade: "São Paulo",
    zona: "Jardins",
    tipo: "Apartamento",
    finalidade: "Investimento",
    preco: 2400000,
    moeda: "BRL",
    quartos: 3,
    casasBanho: 3,
    area: 140,
    estado: "Pronto",
    destaque: true,
    resumo:
      "Apartamento de alto padrão nos Jardins, o bairro mais valorizado de São Paulo, com liquidez garantida.",
    descricao:
      "No exclusivo bairro dos Jardins, este apartamento de alto padrão oferece localização de prestígio, lazer completo no edifício e a liquidez de um mercado maduro. São Paulo é o motor económico do Brasil e oferece rendimento de arrendamento urbano estável e valorização consistente.",
    caracteristicas: [
      "Bairro Jardins — prime de São Paulo",
      "Lazer completo (piscina, academia, spa)",
      "2 vagas de garagem",
      "Portaria 24h e segurança",
      "Próximo à Av. Paulista",
    ],
    imagens: [u("1545324418-cc1a3fa10c00"), u("1560448204-e02f11c3d0e2"), u("1502005229762-cf1b2da7c5d6")],
  },
  {
    slug: "ipanema-ocean-rio",
    nome: "Ipanema Ocean",
    pais: "brasil",
    cidade: "Rio de Janeiro",
    zona: "Ipanema",
    tipo: "Apartamento",
    finalidade: "Férias",
    preco: 3850000,
    moeda: "BRL",
    quartos: 3,
    casasBanho: 2,
    area: 118,
    estado: "Pronto",
    destaque: true,
    resumo:
      "Apartamento a uma quadra da praia de Ipanema, imóvel icónico com forte potencial turístico.",
    descricao:
      "A uma quadra da mundialmente famosa praia de Ipanema, este apartamento une localização icónica e elevado potencial de valorização. O Rio de Janeiro combina turismo permanente, imóveis de prestígio e procura internacional — ideal para férias ou arrendamento de curta duração.",
    caracteristicas: [
      "A 1 quadra da praia de Ipanema",
      "Vista parcial mar",
      "Procura turística permanente",
      "Varanda gourmet",
      "Zona nobre e segura",
    ],
    imagens: [u("1483729558449-99ef09a8c325"), u("1502672260266-1c1ef2d93688"), u("1493809842364-78817add7ffb")],
  },
  {
    slug: "vibe-meireles-fortaleza",
    nome: "VIBE Meireles",
    pais: "brasil",
    cidade: "Fortaleza",
    zona: "Meireles",
    tipo: "Estúdio",
    finalidade: "Investimento",
    preco: 450000,
    moeda: "BRL",
    precoTipo: "desde",
    siteUrl: "https://vibemeireles.com.br",
    quartos: 1,
    casasBanho: 1,
    area: 28,
    estado: "Em construção",
    destaque: true,
    construtora: "R. Miranda Construtora",
    morada: "R. Pereira Valente, 631 — Meireles, Fortaleza/CE",
    tipologias: [
      { nome: "Studio", area: "28 m² · 1 vaga", preco: 450000 },
      { nome: "1 Suíte", area: "Plantas flexíveis" },
      { nome: "2 Suítes", area: "Plantas flexíveis" },
    ],
    proximidades: [
      "Shopping Aldeota — 1 min a pé",
      "Praça Portugal — 1-2 min a pé",
      "Av. Dom Luís — 1-2 min a pé",
      "Shopping Del Paseo — 3 min a pé",
      "Beira-Mar — 3-5 min de carro",
    ],
    resumo:
      "Studios e suítes no coração do Meireles, em Fortaleza — plantas flexíveis e alta rentabilidade para locação.",
    descricao:
      "Sinta a VIBE de viver no coração do Meireles. Da R. Miranda Construtora, o VIBE Meireles oferece studios a partir de 28 m² e plantas flexíveis de 1 e 2 suítes, ideais tanto para morar como para investir. Com lazer distribuído entre o 19.º pavimento e um rooftop com piscina aquecida e hidromassagem, o empreendimento alia localização premium — tudo a pé — a uma elevada rentabilidade para arrendamento, sobretudo nos studios. Uma porta de entrada acessível no destino de maior crescimento turístico do Brasil.",
    caracteristicas: [
      "Piscina aquecida com hidro no rooftop (30.º andar)",
      "Academia completa (19.º andar)",
      "Salão de festas e espaço gourmet",
      "Coworking e lavanderia compartilhada",
      "Mini-market 24h e fachada ativa com café",
      "Plantas flexíveis: morar ou investir",
      "Alta rentabilidade de locação (studios)",
    ],
    imagens: [
      "https://vibemeireles.com.br/assets/facade-BcAPUI2e.png",
      "https://vibemeireles.com.br/assets/rooftop-pool-1ucPfpUo.jpg",
      "https://vibemeireles.com.br/assets/studio-DjcARUqS.jpg",
      "https://vibemeireles.com.br/assets/gym-BN_99_a7.jpg",
      "https://vibemeireles.com.br/assets/gourmet-CmhJPter.jpg",
    ],
  },
  {
    slug: "jurere-internacional-floripa",
    nome: "Jurerê Internacional Villas",
    pais: "brasil",
    cidade: "Florianópolis",
    zona: "Sul do Brasil",
    tipo: "Moradia",
    finalidade: "Férias",
    preco: 5200000,
    moeda: "BRL",
    quartos: 4,
    casasBanho: 5,
    area: 320,
    estado: "Pronto",
    destaque: false,
    resumo:
      "Casa de alto padrão em Jurerê Internacional, o endereço mais exclusivo do sul do Brasil.",
    descricao:
      "Em Jurerê Internacional, sinónimo de exclusividade em Florianópolis, esta casa oferece piscina, área gourmet e poucos passos da praia. A ilha combina qualidade de vida, segurança e um mercado em crescimento sustentado — ideal para segunda habitação de luxo.",
    caracteristicas: [
      "Jurerê Internacional",
      "Piscina e área gourmet",
      "A poucos passos da praia",
      "Bairro planeado e seguro",
      "Qualidade de vida elevada",
    ],
    imagens: [u("1512917774080-9991f1c4c750"), u("1600585154340-be6161a56a0c"), u("1568605114967-8130f3a36994")],
  },
  {
    slug: "pinheiros-studios-sao-paulo",
    nome: "Pinheiros Studios",
    pais: "brasil",
    cidade: "São Paulo",
    zona: "Pinheiros",
    tipo: "Estúdio",
    finalidade: "Investimento",
    preco: 650000,
    moeda: "BRL",
    quartos: 1,
    casasBanho: 1,
    area: 38,
    estado: "Em planta",
    destaque: false,
    resumo:
      "Studio compacto em Pinheiros, bairro jovem e dinâmico de São Paulo, ótimo para rendimento urbano.",
    descricao:
      "Pinheiros é um dos bairros mais dinâmicos de São Paulo — vida noturna, polos tecnológicos e excelente mobilidade. Estes studios em planta são pensados para arrendamento urbano com forte procura por jovens profissionais. Entrada acessível e valorização durante a obra.",
    caracteristicas: [
      "Bairro Pinheiros (jovem e tech)",
      "Compra em planta",
      "Próximo ao metrô",
      "Coworking e lazer no edifício",
      "Entrada acessível",
    ],
    imagens: [u("1493809842364-78817add7ffb"), u("1502005229762-cf1b2da7c5d6"), u("1560448204-e02f11c3d0e2")],
  },
  {
    slug: "barra-ocean-rio",
    nome: "Barra Ocean Front",
    pais: "brasil",
    cidade: "Rio de Janeiro",
    zona: "Barra da Tijuca",
    tipo: "Apartamento",
    finalidade: "Habitação",
    preco: 1750000,
    moeda: "BRL",
    quartos: 3,
    casasBanho: 3,
    area: 135,
    estado: "Em construção",
    destaque: false,
    resumo:
      "T3 moderno na Barra da Tijuca, zona em expansão do Rio, com infraestrutura completa e praia.",
    descricao:
      "A Barra da Tijuca é a zona de maior expansão do Rio de Janeiro, com infraestrutura moderna, shoppings e praias extensas. Este T3 num condomínio-clube oferece lazer completo e segurança, ideal para habitação ou investimento de médio prazo.",
    caracteristicas: [
      "Condomínio-clube com lazer completo",
      "Próximo à praia da Barra",
      "Zona em forte expansão",
      "2 vagas de garagem",
      "Segurança e portaria 24h",
    ],
    imagens: [u("1600596542815-ffad4c1539a9"), u("1483729558449-99ef09a8c325"), u("1600607687939-ce8a6c25118c")],
  },
];

// ───────────────────────── Helpers ─────────────────────────

export function getEmpreendimentos({ pais } = {}) {
  if (!pais) return EMPREENDIMENTOS;
  return EMPREENDIMENTOS.filter((e) => e.pais === pais);
}

export function getEmpreendimentoBySlug(slug) {
  return EMPREENDIMENTOS.find((e) => e.slug === slug) || null;
}

export function getEmpreendimentosDestaque(limite = 6) {
  return EMPREENDIMENTOS.filter((e) => e.destaque).slice(0, limite);
}

export function getZonas(pais) {
  const zonas = getEmpreendimentos({ pais }).map((e) => e.zona);
  return [...new Set(zonas)].sort((a, b) => a.localeCompare(b, "pt"));
}

export function getTipos(pais) {
  const tipos = getEmpreendimentos({ pais }).map((e) => e.tipo);
  return [...new Set(tipos)].sort((a, b) => a.localeCompare(b, "pt"));
}

export function getFinalidades(pais) {
  const fins = getEmpreendimentos({ pais }).map((e) => e.finalidade);
  return [...new Set(fins)].sort((a, b) => a.localeCompare(b, "pt"));
}

export function formatarPreco(preco, moeda = "EUR") {
  const locale = moeda === "BRL" ? "pt-BR" : "pt-PT";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: moeda,
    maximumFractionDigits: 0,
  }).format(preco);
}

export const PAIS_LABEL = { portugal: "Portugal", brasil: "Brasil" };

// Taxa de conversão aproximada para mostrar o preço nas duas moedas.
// (Editável aqui; é apenas indicativa.)
export const TAXA_EUR_BRL = 6.2;

export function precoDual(preco, moeda = "EUR") {
  if (!preco) return null;
  const principal = formatarPreco(preco, moeda);
  const secundario =
    moeda === "EUR"
      ? formatarPreco(Math.round(preco * TAXA_EUR_BRL), "BRL")
      : formatarPreco(Math.round(preco / TAXA_EUR_BRL), "EUR");
  return { principal, secundario };
}
