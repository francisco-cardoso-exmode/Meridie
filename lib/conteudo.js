import { getDb } from "@/lib/mongodb";

/**
 * Conteúdo editável das páginas (CMS). Os textos por defeito (DEFAULTS) são os
 * atuais do site; o que for editado no backoffice fica na coleção "paginas" e
 * sobrepõe-se ao defeito. PAGINAS é o registo que gera o editor no admin.
 */

export const DEFAULTS = {
  home: {
    heroSlogan: "Capital sem fronteiras. Investimento com precisão.",
    difTitulo: "Não somos uma agência. Somos o teu parceiro de investimento.",
    difTexto:
      "Portugal e o Brasil partilham língua e cultura, mas têm mercados, legislações e oportunidades distintas. Existimos precisamente nessa diferença — para a transformar em vantagem competitiva.",
    ctaTitulo: "Onde queres que o teu capital chegue?",
    ctaTexto:
      "Conta-nos os teus objetivos. Respondemos com uma primeira perspetiva e os próximos passos — sem compromisso.",
    areasTitulo: "Começámos no imobiliário. Hoje investimos onde encontramos valor.",
    areasTexto:
      "A mesma exigência que nos guia no imobiliário — rigor, rede verificada e acompanhamento em cada etapa — aplicamo-la agora à representação de marcas de bebidas e alimentação.",
  },
  marcas: {
    heroTitulo: "Representamos marcas com origem, história e ambição de crescer.",
    heroTexto:
      "Levamos produtores e marcas de bebidas e alimentação a novos mercados, com a mesma lógica que aplicamos ao imobiliário: conhecer o terreno, escolher bem os parceiros e acompanhar cada passo.",
    ctaTitulo: "Tens uma marca com ambição de crescer?",
    ctaTexto:
      "Representação comercial e distribuição em Portugal e no Brasil — restauração, retalho e eventos. Fala connosco.",
  },
  tecnologia: {
    heroTitulo: "Tecnologia que representamos e tecnologia que desenvolvemos.",
    heroTexto:
      "Levamos ao mercado soluções tecnológicas de parceiros e criamos as nossas próprias, quando o problema o pede. Para quem procura uma solução, somos um único interlocutor. Para quem a criou, somos a ponte para novos clientes e novos mercados.",
    card1Titulo: "Representação de soluções",
    card1Texto:
      "Selecionamos soluções de tecnologia de parceiros e representamo-las comercialmente junto de empresas e investidores.",
    card2Titulo: "Desenvolvimento próprio",
    card2Texto:
      "Quando não existe a solução certa, desenhamos e desenvolvemos à medida, com equipa própria.",
    card3Titulo: "Implementação e acompanhamento",
    card3Texto:
      "Da instalação à formação e ao suporte, acompanhamos cada solução depois de entrar em funcionamento.",
    ctaTitulo: "Procuras uma solução — ou criaste uma?",
    ctaTexto: "Conta-nos o problema ou o produto. Respondemos com os próximos passos, sem compromisso.",
  },
  "quem-somos": {
    heroTitulo: "Convergimos dois mundos num só processo.",
    heroTexto:
      "O nome Meridie vem do latim meridies — meio-dia, sul. É também a raiz de «meridiano»: a linha que define um ponto exato no mapa, o encontro de coordenadas. É exatamente o que fazemos: fazer convergir mercados, parceiros e oportunidades entre Portugal e o Brasil.",
    missaoTitulo:
      "Quem olha além-fronteiras merece um parceiro que domine os dois lados.",
    missaoTexto1:
      "Ligar investidores, marcas e empresas de Portugal e do Brasil às melhores oportunidades dos dois países — no imobiliário e na representação de bebidas e alimentação — com um acompanhamento integrado que torna cada passo simples, seguro e rentável.",
    missaoTexto2:
      "Coordenamos os melhores parceiros locais, gerimos o processo de ponta a ponta e garantimos que cada decisão é tomada com informação completa.",
    visaoTexto:
      "Ser a referência de confiança no investimento e na representação entre Portugal e o Brasil — reconhecida pela qualidade dos parceiros, pela transparência do processo e pelo impacto real nos resultados dos nossos clientes.",
  },
  "como-funciona": {
    heroTitulo: "Simples, previsível e seguro.",
    heroTexto:
      "Investir noutro país pode parecer complexo. O nosso processo foi desenhado para que saibas sempre em que fase estás, o que acontece a seguir e quem está a trabalhar por ti.",
  },
  contactos: {
    heroTitulo: "Vamos construir o teu próximo passo.",
    heroTexto:
      "Conta-nos os teus objetivos de investimento. Respondemos a todas as mensagens em 24 horas úteis.",
    email: "geral@meridie.pt",
    telefone: "+351 210 000 000",
    presenca: "Lisboa, Portugal · São Paulo, Brasil",
    horario: "Segunda a sexta, das 9h às 18h (WET / BRT).",
  },
};

export const PAGINAS = [
  {
    key: "home",
    nome: "Home",
    rota: "/",
    campos: [
      { k: "heroSlogan", label: "Slogan do hero", tipo: "text" },
      { k: "difTitulo", label: "Título — secção 'dois mercados'", tipo: "text" },
      { k: "difTexto", label: "Texto — secção 'dois mercados'", tipo: "textarea" },
      { k: "ctaTitulo", label: "Título — CTA final", tipo: "text" },
      { k: "ctaTexto", label: "Texto — CTA final", tipo: "textarea" },
      { k: "areasTitulo", label: "Título — faixa 'outras áreas' (Bebidas / Tecnologia)", tipo: "text" },
      { k: "areasTexto", label: "Texto — faixa 'outras áreas'", tipo: "textarea" },
    ],
  },
  {
    key: "marcas",
    nome: "Marcas",
    rota: "/marcas",
    campos: [
      { k: "heroTitulo", label: "Título do hero", tipo: "text" },
      { k: "heroTexto", label: "Texto do hero", tipo: "textarea" },
      { k: "ctaTitulo", label: "Título — CTA final", tipo: "text" },
      { k: "ctaTexto", label: "Texto — CTA final", tipo: "textarea" },
    ],
  },
  {
    key: "tecnologia",
    nome: "Tecnologia",
    rota: "/tecnologia",
    campos: [
      { k: "heroTitulo", label: "Título do hero", tipo: "text" },
      { k: "heroTexto", label: "Texto do hero", tipo: "textarea" },
      { k: "card1Titulo", label: "Cartão 1 — título", tipo: "text" },
      { k: "card1Texto", label: "Cartão 1 — texto", tipo: "textarea" },
      { k: "card2Titulo", label: "Cartão 2 — título", tipo: "text" },
      { k: "card2Texto", label: "Cartão 2 — texto", tipo: "textarea" },
      { k: "card3Titulo", label: "Cartão 3 — título", tipo: "text" },
      { k: "card3Texto", label: "Cartão 3 — texto", tipo: "textarea" },
      { k: "ctaTitulo", label: "Título — CTA final", tipo: "text" },
      { k: "ctaTexto", label: "Texto — CTA final", tipo: "textarea" },
    ],
  },
  {
    key: "quem-somos",
    nome: "Quem Somos",
    rota: "/quem-somos",
    campos: [
      { k: "heroTitulo", label: "Título do hero", tipo: "text" },
      { k: "heroTexto", label: "Texto do hero", tipo: "textarea" },
      { k: "missaoTitulo", label: "Missão — título", tipo: "text" },
      { k: "missaoTexto1", label: "Missão — parágrafo 1", tipo: "textarea" },
      { k: "missaoTexto2", label: "Missão — parágrafo 2", tipo: "textarea" },
      { k: "visaoTexto", label: "Visão — texto", tipo: "textarea" },
    ],
  },
  {
    key: "como-funciona",
    nome: "Como Funciona",
    rota: "/como-funciona",
    campos: [
      { k: "heroTitulo", label: "Título do hero", tipo: "text" },
      { k: "heroTexto", label: "Texto do hero", tipo: "textarea" },
    ],
  },
  {
    key: "contactos",
    nome: "Contactos",
    rota: "/contactos",
    campos: [
      { k: "heroTitulo", label: "Título do hero", tipo: "text" },
      { k: "heroTexto", label: "Texto do hero", tipo: "textarea" },
      { k: "email", label: "Email", tipo: "text" },
      { k: "telefone", label: "Telefone", tipo: "text" },
      { k: "presenca", label: "Presença", tipo: "text" },
      { k: "horario", label: "Horário", tipo: "text" },
    ],
  },
];

export async function getConteudo(pagina) {
  const def = DEFAULTS[pagina] || {};
  try {
    const db = await getDb();
    const doc = await db.collection("paginas").findOne({ _id: pagina });
    return { ...def, ...(doc?.campos || {}) };
  } catch {
    return def;
  }
}

export async function setConteudo(pagina, campos) {
  const db = await getDb();
  await db
    .collection("paginas")
    .updateOne({ _id: pagina }, { $set: { campos } }, { upsert: true });
}
