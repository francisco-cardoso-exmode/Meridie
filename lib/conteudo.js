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
  },
  "quem-somos": {
    heroTitulo: "Convergimos dois mundos num só processo.",
    heroTexto:
      "O nome Meridie vem do latim meridies — convergência, sul, ponto de encontro. É exatamente o que fazemos: fazer convergir dois mercados, dois sistemas jurídicos e duas realidades fiscais.",
    missaoTitulo:
      "O investidor que olha além-fronteiras merece um parceiro que domine os dois lados.",
    missaoTexto1:
      "Conectar investidores portugueses e brasileiros às melhores oportunidades imobiliárias em ambos os países, com um serviço integrado de intermediação, assessoria jurídica e fiscal que torna o investimento transfronteiriço simples, seguro e rentável.",
    missaoTexto2:
      "Não vendemos imóveis. Coordenamos os melhores profissionais locais, gerimos o processo de ponta a ponta e garantimos que cada decisão é tomada com informação completa e segurança jurídica.",
    visaoTexto:
      "Ser a referência de confiança no investimento imobiliário entre Portugal e o Brasil — reconhecida pela qualidade dos parceiros, pela transparência do processo e pelo impacto real na vida financeira dos nossos clientes.",
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
