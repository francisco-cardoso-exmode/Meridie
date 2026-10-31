import { getDb } from "@/lib/mongodb";
import { DEFAULTS_EN } from "@/lib/conteudoEn";
import CONTEUDO_EN from "@/lib/i18n/conteudoTraduzido";
import { CAMPOS_ITEM_FIXOS, ID_ITEM } from "@/lib/traducaoCampos";
import { NOMES_ICONES } from "@/components/Icon";

/**
 * Conteúdo editável das páginas (CMS). Os textos por defeito (DEFAULTS) são os
 * atuais do site; o que for editado no backoffice fica na coleção "paginas" e
 * sobrepõe-se ao defeito. PAGINAS é o registo que gera o editor no admin.
 *
 * Campos de texto ("text" / "textarea") e listas ("lista"): cartões, passos,
 * perguntas… — um array de objetos, cada um com um `id` estável (a tradução
 * inglesa guarda-se por id, em "lista.<id>.campo", e acompanha o item quando
 * se reordena). `itens` diz que campos tem cada item; "icone" é um nome de
 * components/Icon.js. `grupo` só organiza o formulário do backoffice.
 */

export const DEFAULTS = {
  home: {
    heroSlogan: "Capital sem fronteiras. Investimento com precisão.",
    hsPtTitulo: "Portugal",
    hsPtTeaser: "Segurança jurídica europeia.",
    hsPtTexto:
      "Valorização consistente, residência no espaço Schengen e proteção patrimonial em Euro. Lisboa, Porto e Algarve.",
    hsPtCta: "Explorar Portugal →",
    hsBrTitulo: "Brasil",
    hsBrTeaser: "Yields acima da média europeia.",
    hsBrTexto:
      "Mercado em expansão e preços competitivos, do litoral às grandes metrópoles. São Paulo, Rio, Nordeste e Sul.",
    hsBrCta: "Explorar Brasil →",
    areasEyebrow: "Bebidas & Alimentação",
    areasEyebrowTec: "Um nome, três áreas de investimento",
    areasTitulo: "Começámos no imobiliário. Hoje investimos onde encontramos valor.",
    areasTexto:
      "A mesma exigência que nos guia no imobiliário — rigor, rede verificada e acompanhamento em cada etapa — aplicamo-la agora à representação de marcas de bebidas e alimentação.",
    marcasFaixaTitulo: "Marcas que representamos",
    difEyebrow: "Dois mercados, uma plataforma",
    difTitulo: "Não somos uma agência. Somos o teu parceiro de investimento.",
    difTexto:
      "Portugal e o Brasil partilham língua e cultura, mas têm mercados, legislações e oportunidades distintas. Existimos precisamente nessa diferença — para a transformar em vantagem competitiva.",
    diferenciais: [
      {
        id: "dif1",
        icone: "shield-check",
        titulo: "Rede verificada",
        texto: "Corretores, advogados e contabilistas selecionados e verificados em Portugal e no Brasil.",
      },
      {
        id: "dif2",
        icone: "layers",
        titulo: "Processo integrado",
        texto: "Da análise do imóvel à escritura, com apoio jurídico e fiscal em cada etapa — um único processo.",
      },
      {
        id: "dif3",
        icone: "globe",
        titulo: "Dois mercados",
        texto:
          "Presença e conhecimento real nos dois países — legislação, fiscalidade e dinâmicas locais. Não apenas contactos.",
      },
    ],
    destaquesEyebrow: "Empreendimentos",
    destaquesTitulo: "Oportunidades em destaque",
    destaquesTexto: "Uma seleção curada de imóveis nos dois mercados.",
    ofertaEyebrow: "Toda a oferta",
    ofertaTitulo: "Explora todos os empreendimentos",
    ofertaTexto:
      "Pesquisa pelo nome, cidade, zona ou referência — ou clica em Filtros para refinar por país, tipologia, finalidade e preço.",
    regioesEyebrow: "Explorar por região",
    regioesTitulo: "Cada região, uma oportunidade",
    regioesTexto:
      "Descobre as vantagens de cada mercado e o que podes fazer acontecer — clica numa região para ver os empreendimentos.",
    perfisEyebrow: "Para quem é",
    perfisTitulo: "Um serviço calibrado ao teu perfil",
    perfis: [
      {
        id: "perfil1",
        icone: "①",
        titulo: "Investidor particular",
        texto:
          "Primeiro investimento no exterior? Guiamos-te em cada passo — da escolha do imóvel à documentação final, com total transparência sobre custos, impostos e prazos.",
      },
      {
        id: "perfil2",
        icone: "②",
        titulo: "Investidor premium",
        texto:
          "Já investes e queres escalar para o mercado oposto? Trabalhamos como parceiros estratégicos: estruturação fiscal, acesso exclusivo a oportunidades e gestor dedicado.",
      },
    ],
    processoEyebrow: "Como funciona",
    processoTitulo: "Do primeiro contacto à escritura",
    processoTexto:
      "Um processo desenhado para ser simples, previsível e seguro — sabes sempre em que fase estás e quem trabalha por ti.",
    passos: [
      { id: "passo1", titulo: "Contacto e perfil" },
      { id: "passo2", titulo: "Seleção de imóveis" },
      { id: "passo3", titulo: "Due diligence" },
      { id: "passo4", titulo: "Escritura e pós-venda" },
    ],
    anunciosEyebrow: "Parceiros & destaques",
    anunciosTitulo: "Em destaque",
    ctaTitulo: "Onde queres que o teu capital chegue?",
    ctaTexto:
      "Conta-nos os teus objetivos. Respondemos com uma primeira perspetiva e os próximos passos — sem compromisso.",
  },
  // Cartões das áreas de negócio (components/AreasCards.js — Quem Somos e Home).
  areas: {
    imobiliarioTitulo: "Imobiliário",
    imobiliarioTexto:
      "Investimento entre Portugal e o Brasil, com intermediação e assessoria jurídica e fiscal num único processo.",
    imobiliarioCta: "Ver empreendimentos",
    marcasTitulo: "Representações comerciais",
    marcasTexto: "Representação de marcas com origem e carácter — vinhos, bebidas, conservas e azeite, com pedidos de encomenda para profissionais.",
    marcasCta: "Ver o catálogo",
    tecnologiaTitulo: "Tecnologia",
    tecnologiaTexto:
      "Soluções tecnológicas de parceiros e desenvolvimento próprio, com acompanhamento na implementação.",
    tecnologiaCta: "Explorar tecnologia",
  },
  // Representações comerciais (/representacoes) — a chave "marcas" mantém-se
  // para não perder os textos já editados quando a página se chamava Marcas.
  marcas: {
    heroEyebrow: "Representações comerciais",
    heroTitulo: "Representamos marcas com origem, história e ambição de crescer.",
    heroTexto:
      "Levamos produtores e marcas de bebidas e alimentação a novos mercados, com a mesma lógica que aplicamos ao imobiliário: conhecer o terreno, escolher bem os parceiros e acompanhar cada passo.",
    categoriasEyebrow: "Categorias",
    categoriasTitulo: "O que representamos",
    destaquesEyebrow: "Em destaque",
    destaquesTitulo: "Produtos em destaque",
    marcasEyebrow: "Marcas",
    marcasTitulo: "As marcas que representamos",
    comoTitulo: "Como encomendar",
    comoTexto:
      "Escolhe os produtos e as quantidades e envia o pedido. Respondemos com a disponibilidade, os portes e as condições — sem pagamento online.",
    ctaTitulo: "Tens uma marca com ambição de crescer?",
    ctaTexto:
      "Representação comercial e distribuição em Portugal e no Brasil — restauração, retalho e eventos. Fala connosco.",
  },
  tecnologia: {
    heroEyebrow: "Tecnologia",
    heroTitulo: "Tecnologia que representamos e tecnologia que desenvolvemos.",
    heroTexto:
      "Levamos ao mercado soluções tecnológicas de parceiros e criamos as nossas próprias, quando o problema o pede. Para quem procura uma solução, somos um único interlocutor. Para quem a criou, somos a ponte para novos clientes e novos mercados.",
    cards: [
      {
        id: "tec1",
        icone: "share",
        titulo: "Representação de soluções",
        texto:
          "Selecionamos soluções de tecnologia de parceiros e representamo-las comercialmente junto de empresas e investidores.",
      },
      {
        id: "tec2",
        icone: "code",
        titulo: "Desenvolvimento próprio",
        texto: "Quando não existe a solução certa, desenhamos e desenvolvemos à medida, com equipa própria.",
      },
      {
        id: "tec3",
        icone: "check",
        titulo: "Implementação e acompanhamento",
        texto:
          "Da instalação à formação e ao suporte, acompanhamos cada solução depois de entrar em funcionamento.",
      },
    ],
    ctaTitulo: "Procuras uma solução — ou criaste uma?",
    ctaTexto: "Conta-nos o problema ou o produto. Respondemos com os próximos passos, sem compromisso.",
  },
  "quem-somos": {
    heroEyebrow: "Quem Somos",
    heroTitulo: "Convergimos dois mundos num só processo.",
    heroTexto:
      "O nome Meridie vem do latim meridies — meio-dia, sul. É também a raiz de «meridiano»: a linha que define um ponto exato no mapa, o encontro de coordenadas. É exatamente o que fazemos: fazer convergir mercados, parceiros e oportunidades entre Portugal e o Brasil.",
    percursoEyebrow: "O nosso percurso",
    percursoTitulo: "Começámos no imobiliário. Hoje investimos onde encontramos valor.",
    missaoEyebrow: "A nossa missão",
    missaoTitulo:
      "Quem olha além-fronteiras merece um parceiro que domine os dois lados.",
    missaoTexto1:
      "Ligar investidores, marcas e empresas de Portugal e do Brasil às melhores oportunidades dos dois países — no imobiliário e na representação de bebidas e alimentação — com um acompanhamento integrado que torna cada passo simples, seguro e rentável.",
    missaoTexto2:
      "Coordenamos os melhores parceiros locais, gerimos o processo de ponta a ponta e garantimos que cada decisão é tomada com informação completa.",
    visaoEyebrow: "A nossa visão",
    visaoTexto:
      "Ser a referência de confiança no investimento e na representação entre Portugal e o Brasil — reconhecida pela qualidade dos parceiros, pela transparência do processo e pelo impacto real nos resultados dos nossos clientes.",
    valoresEyebrow: "Os nossos valores",
    valoresTitulo: "Aquilo em que não cedemos",
    valores: [
      { id: "val1", titulo: "Confiança", texto: "Cada parceiro da nossa rede é verificado. Sabes sempre com quem trabalhas." },
      { id: "val2", titulo: "Transparência", texto: "Sem surpresas em fees, processo ou documentos. Tudo claro desde o primeiro contacto." },
      { id: "val3", titulo: "Rigor", texto: "Processo jurídico e fiscal impecável nos dois países. Nada é deixado ao acaso." },
      { id: "val4", titulo: "Personalização", texto: "Cada cliente tem objetivos únicos. O serviço adapta-se — nunca é produto de prateleira." },
      { id: "val5", titulo: "Conhecimento", texto: "Operamos em ambos os mercados com profundidade real — legislação, fiscalidade e cultura." },
    ],
    diferenciaisEyebrow: "Diferenciais",
    diferenciaisTitulo: "Porque escolher a Meridie",
    diferenciais: [
      { id: "dif1", titulo: "Conhecimento bilateral real", texto: "Não somos uma agência com 'contactos do outro lado'. Operamos nos dois mercados com conhecimento profundo." },
      { id: "dif2", titulo: "Rede de parceiros verificados", texto: "Cada corretor, advogado e contabilista passa por seleção rigorosa, com credenciais verificadas." },
      { id: "dif3", titulo: "Coordenação total", texto: "Um ponto de contacto único coordena todo o processo — intermediação, jurídico e fiscal — nos dois países." },
      { id: "dif4", titulo: "Transparência de custos", texto: "Sabes exatamente quanto custa cada serviço antes de avançar. Sem custos escondidos." },
    ],
  },
  "como-funciona": {
    heroEyebrow: "Como Funciona",
    heroTitulo: "Simples, previsível e seguro.",
    heroTexto:
      "Investir noutro país pode parecer complexo. O nosso processo foi desenhado para que saibas sempre em que fase estás, o que acontece a seguir e quem está a trabalhar por ti.",
    passosEyebrow: "O processo",
    passosTitulo: "Os 5 passos",
    passos: [
      {
        id: "passo1",
        titulo: "Contacto e análise do perfil",
        texto:
          "Começa com uma conversa. Compreendemos os teus objetivos, orçamento, preferências de mercado e situação fiscal. Sem compromisso — apenas a base para um serviço personalizado.",
      },
      {
        id: "passo2",
        titulo: "Seleção de oportunidades",
        texto:
          "Apresentamos um conjunto curado de imóveis com análise de rentabilidade estimada, localização, estado legal e contexto de mercado.",
      },
      {
        id: "passo3",
        titulo: "Due diligence jurídica e fiscal",
        texto:
          "Antes de qualquer compromisso financeiro, analisamos o imóvel, o vendedor, os documentos e as implicações tributárias nos dois países. Zero surpresas depois da compra.",
      },
      {
        id: "passo4",
        titulo: "Negociação e contratos",
        texto:
          "Apoiamos a negociação de preço e condições. Os advogados parceiros redigem ou revêm todos os contratos — da promessa à escritura — protegendo os teus interesses.",
      },
      {
        id: "passo5",
        titulo: "Escritura e pós-venda",
        texto:
          "Acompanhamos até ao registo definitivo. Se precisares de gestão do imóvel, arrendamento ou declarações fiscais, a nossa rede continua disponível.",
      },
    ],
    pilaresEyebrow: "Os nossos serviços",
    pilaresTitulo: "Três pilares, um processo coordenado",
    pilaresTexto:
      "Não somos uma agência tradicional. Coordenamos toda a cadeia — da identificação do imóvel à conclusão legal e fiscal do negócio.",
    pilares: [
      {
        id: "pilar1",
        icone: "link",
        titulo: "Intermediação imobiliária",
        texto:
          "Ligamos-te aos melhores corretores certificados no país de destino, com base no teu perfil e objetivos de rentabilidade — da seleção de imóveis à assinatura do contrato.",
      },
      {
        id: "pilar2",
        icone: "scale",
        titulo: "Assessoria jurídica",
        texto:
          "Due diligence legal, revisão e elaboração de contratos (CPCV), representação por procuração, Golden Visa e acompanhamento até à escritura e registo.",
      },
      {
        id: "pilar3",
        icone: "percent",
        titulo: "Assessoria fiscal",
        texto:
          "Estruturação fiscal eficiente, apoio com NIF/NHR (Portugal) e CPF/não-residentes (Brasil), tributação de rendimentos e mais-valias, evitando dupla tributação.",
      },
    ],
    ctaTitulo: "Pronto para começar?",
    ctaTexto:
      "O primeiro passo é só uma conversa. Conta-nos os teus objetivos e traçamos o caminho contigo.",
  },
  portugal: {
    heroEyebrow: "Mercado Portugal",
    heroTitulo: "Investir em Portugal",
    heroTexto:
      "Estabilidade jurídica europeia, valorização consistente e a porta de entrada para a Europa. Lisboa, Porto, Algarve e Cascais.",
    porqueTitulo: "Porquê Portugal?",
    porqueTexto:
      "Lisboa, Porto e Algarve oferecem mercados maduros, liquidez e procura internacional constante. O regime fiscal para novos residentes e a proteção patrimonial em Euro completam o cenário.",
  },
  brasil: {
    heroEyebrow: "Mercado Brasil",
    heroTitulo: "Investir no Brasil",
    heroTexto:
      "Preços competitivos face à Europa, yields superiores e um mercado em expansão. São Paulo, Rio, Nordeste e Sul.",
    porqueTitulo: "Porquê o Brasil?",
    porqueTexto:
      "De São Paulo e Rio ao Nordeste e ao Sul, o mercado oferece opções para diferentes perfis e orçamentos. Tratamos das especificidades — ITBI, regras para não-residentes, cartórios e documentação.",
  },
  empreendimentos: {
    heroEyebrow: "Oferta",
    heroTitulo: "Todos os empreendimentos",
    heroTexto:
      "Toda a nossa oferta em Portugal e no Brasil num só sítio. Pesquisa pelo nome, cidade, zona ou referência, e refina com os filtros.",
  },
  parcerias: {
    heroEyebrow: "Parcerias",
    heroTitulo: "Uma rede verificada nos dois países.",
    heroTexto:
      "Cada parceiro da Meridie passa por um processo de seleção rigoroso. Trabalhamos apenas com profissionais de credenciais verificadas e historial comprovado — em Portugal e no Brasil.",
    redeEyebrow: "A rede",
    redeTitulo: "Quem trabalha por ti",
    rede: [
      {
        id: "rede1",
        icone: "briefcase",
        titulo: "Corretores certificados",
        texto:
          "Profissionais com licença e historial comprovado no mercado local — selecionam e apresentam imóveis alinhados com o perfil do investidor.",
      },
      {
        id: "rede2",
        icone: "scale",
        titulo: "Advogados",
        texto:
          "Especialistas em direito imobiliário e em negócios transfronteiriços, responsáveis pela due diligence, contratos e registo de propriedade.",
      },
      {
        id: "rede3",
        icone: "calculator",
        titulo: "Contabilistas",
        texto:
          "Peritos em tributação internacional que estruturam o investimento de forma eficiente nos dois sistemas fiscais.",
      },
      {
        id: "rede4",
        icone: "key",
        titulo: "Gestão local",
        texto:
          "Parceiros de gestão de imóveis e arrendamento que garantem rendimento e manutenção mesmo à distância.",
      },
    ],
    parceiroEyebrow: "Tornar-se parceiro",
    parceiroTitulo: "És corretor, advogado ou contabilista?",
    parceiroTexto:
      "Estamos sempre a expandir a rede em Portugal e no Brasil. Se tens credenciais sólidas e queres aceder a um fluxo qualificado de investidores transfronteiriços, fala connosco.",
    parceiroVantagens: [
      { id: "vant1", texto: "Acesso a investidores qualificados nos dois mercados." },
      { id: "vant2", texto: "Processo coordenado — foca-te na tua especialidade." },
      { id: "vant3", texto: "Relação transparente e de longo prazo." },
    ],
  },
  publicidade: {
    heroEyebrow: "Parceiros e patrocinadores",
    heroTitulo: "Quem nos acompanha entre Portugal e o Brasil.",
    heroTexto:
      "Da viagem à estadia, da mesa à descoberta do destino: as empresas que tornam cada visita mais simples para os nossos clientes.",
    principalEyebrow: "Patrocinador principal",
    ctaTitulo: "Queres ver a tua empresa aqui?",
    ctaTexto:
      "Trabalhamos com parcerias e com espaços de patrocínio, com destaque nesta página e na página inicial. Diz-nos o que procuras e enviamos as condições.",
  },
  faq: {
    heroEyebrow: "FAQ",
    heroTitulo: "Perguntas frequentes",
    heroTexto:
      "As dúvidas mais comuns sobre investir em imóveis entre Portugal e o Brasil. Não encontras a tua resposta? Fala connosco.",
    perguntas: [
      {
        id: "faq1",
        categoria: "Geral",
        pergunta: "O que faz exatamente a Meridie Investments?",
        resposta:
          "Somos uma plataforma de intermediação de investimento imobiliário entre Portugal e o Brasil. Conectamos investidores a corretores certificados e providenciamos assessoria jurídica e fiscal integrada nos dois países. Não vendemos imóveis diretamente — gerimos o processo e os profissionais certos para cada caso.",
      },
      {
        id: "faq2",
        categoria: "Geral",
        pergunta: "Trabalham com qualquer tipo de imóvel?",
        resposta:
          "Principalmente imóveis residenciais e de rendimento (apartamentos, moradias, propriedades turísticas). Para projetos comerciais ou de grande escala, contacta-nos para avaliar caso a caso.",
      },
      {
        id: "faq3",
        categoria: "Geral",
        pergunta: "É necessário estar presente no país onde se compra?",
        resposta:
          "Não necessariamente. Através de procuração conferida a um advogado local, podes concluir todo o processo sem deslocação. Muitos clientes fazem visitas por videoconferência e assinam por representação.",
      },
      {
        id: "faq4",
        categoria: "Fiscalidade",
        pergunta: "Que impostos pago ao comprar um imóvel em Portugal?",
        resposta:
          "Os principais são o IMT (Imposto Municipal sobre Transmissões), o Imposto de Selo (0,8% sobre o valor de compra) e os custos notariais e de registo. A nossa equipa fiscal detalha o custo total antes de avançares.",
      },
      {
        id: "faq5",
        categoria: "Fiscalidade",
        pergunta: "E ao comprar no Brasil?",
        resposta:
          "O principal imposto na transmissão é o ITBI (tipicamente entre 2% e 3% do valor venal, varia por município). Existem ainda custos de cartório, registo e, em certos casos, ITCMD para transmissões por herança ou doação.",
      },
      {
        id: "faq6",
        categoria: "Fiscalidade",
        pergunta: "Vou pagar imposto nos dois países?",
        resposta:
          "Depende da tua residência fiscal e da Convenção para Evitar a Dupla Tributação entre Portugal e o Brasil — que existe. A nossa equipa analisa a tua situação e estrutura o investimento para evitar dupla tributação sempre que legalmente possível.",
      },
      {
        id: "faq7",
        categoria: "Processo e Custos",
        pergunta: "Quanto tempo demora o processo de compra?",
        resposta:
          "Em Portugal, da promessa à escritura demora tipicamente 4 a 8 semanas. No Brasil, pode variar entre 4 semanas e 3 meses, dependendo do cartório e da documentação. Damos-te uma estimativa realista no início.",
      },
      {
        id: "faq8",
        categoria: "Processo e Custos",
        pergunta: "Quais são os vossos honorários?",
        resposta:
          "O modelo combina um fee de intermediação sobre o negócio e honorários dos serviços jurídico e fiscal prestados. Para investidores particulares há pacotes com fee fixo; para premium, estruturamos de forma personalizada. Tudo é apresentado de forma clara antes de qualquer compromisso.",
      },
      {
        id: "faq9",
        categoria: "Processo e Custos",
        pergunta: "Posso contratar apenas um dos serviços?",
        resposta:
          "Sim, os serviços são modulares. Podes contratar apenas a intermediação, apenas a assessoria jurídica para um negócio que já encontraste, ou o pacote completo. Recomendamos o processo integrado para maior segurança, mas a decisão é tua.",
      },
    ],
    ctaTitulo: "Ainda tens dúvidas?",
    ctaTexto: "A nossa equipa responde a todas as mensagens em 24 horas úteis.",
  },
  contactos: {
    heroEyebrow: "Contactos",
    heroTitulo: "Vamos construir o teu próximo passo.",
    heroTexto:
      "Conta-nos os teus objetivos de investimento. Respondemos a todas as mensagens em 24 horas úteis.",
    infoEyebrow: "Fala connosco",
    infoTitulo: "Onde nos encontrar",
    email: "geral@meridie.pt",
    telefone: "+351 210 000 000",
    presenca: "Lisboa, Portugal · São Paulo, Brasil",
    horario: "Segunda a sexta, das 9h às 18h (WET / BRT).",
  },
};

// Atalhos para o registo.
const tx = (k, label, grupo) => ({ k, label, tipo: "text", grupo });
const ta = (k, label, grupo) => ({ k, label, tipo: "textarea", grupo });
const ITEM = {
  icone: { k: "icone", label: "Ícone", tipo: "icone" },
  titulo: { k: "titulo", label: "Título", tipo: "text" },
  texto: { k: "texto", label: "Texto", tipo: "textarea" },
};
const cartoes = (k, label, grupo, max = 6) => ({
  k, label, grupo, tipo: "lista", max, itens: [ITEM.icone, ITEM.titulo, ITEM.texto],
});
const hero = (grupo = "Topo da página") => [
  tx("heroEyebrow", "Hero — pequeno título por cima", grupo),
  tx("heroTitulo", "Título do hero", grupo),
  ta("heroTexto", "Texto do hero", grupo),
];
const cta = (grupo = "Faixa final (CTA)") => [
  tx("ctaTitulo", "Título — CTA final", grupo),
  ta("ctaTexto", "Texto — CTA final", grupo),
];

export const PAGINAS = [
  {
    key: "home",
    nome: "Home",
    rota: "/",
    campos: [
      tx("heroSlogan", "Slogan do hero", "Topo (Portugal / Brasil)"),
      tx("hsPtTitulo", "Painel Portugal — título", "Topo (Portugal / Brasil)"),
      tx("hsPtTeaser", "Painel Portugal — frase curta", "Topo (Portugal / Brasil)"),
      ta("hsPtTexto", "Painel Portugal — texto (aparece ao passar o rato)", "Topo (Portugal / Brasil)"),
      tx("hsPtCta", "Painel Portugal — botão", "Topo (Portugal / Brasil)"),
      tx("hsBrTitulo", "Painel Brasil — título", "Topo (Portugal / Brasil)"),
      tx("hsBrTeaser", "Painel Brasil — frase curta", "Topo (Portugal / Brasil)"),
      ta("hsBrTexto", "Painel Brasil — texto (aparece ao passar o rato)", "Topo (Portugal / Brasil)"),
      tx("hsBrCta", "Painel Brasil — botão", "Topo (Portugal / Brasil)"),
      tx("areasEyebrow", "Pequeno título por cima", "Faixa 'outras áreas' (Bebidas / Tecnologia)"),
      tx("areasEyebrowTec", "Pequeno título por cima — quando a área Tecnologia estiver visível", "Faixa 'outras áreas' (Bebidas / Tecnologia)"),
      tx("areasTitulo", "Título", "Faixa 'outras áreas' (Bebidas / Tecnologia)"),
      ta("areasTexto", "Texto", "Faixa 'outras áreas' (Bebidas / Tecnologia)"),
      tx("marcasFaixaTitulo", "Título da faixa de marcas", "Faixa 'outras áreas' (Bebidas / Tecnologia)"),
      tx("difEyebrow", "Pequeno título por cima", "Secção 'dois mercados'"),
      tx("difTitulo", "Título", "Secção 'dois mercados'"),
      ta("difTexto", "Texto", "Secção 'dois mercados'"),
      cartoes("diferenciais", "Cartões", "Secção 'dois mercados'"),
      tx("destaquesEyebrow", "Pequeno título por cima", "Empreendimentos em destaque"),
      tx("destaquesTitulo", "Título", "Empreendimentos em destaque"),
      ta("destaquesTexto", "Texto", "Empreendimentos em destaque"),
      tx("ofertaEyebrow", "Pequeno título por cima", "Toda a oferta (pesquisa)"),
      tx("ofertaTitulo", "Título", "Toda a oferta (pesquisa)"),
      ta("ofertaTexto", "Texto", "Toda a oferta (pesquisa)"),
      tx("regioesEyebrow", "Pequeno título por cima", "Explorar por região (as regiões escolhem-se em Regiões & Zonas)"),
      tx("regioesTitulo", "Título", "Explorar por região (as regiões escolhem-se em Regiões & Zonas)"),
      ta("regioesTexto", "Texto", "Explorar por região (as regiões escolhem-se em Regiões & Zonas)"),
      tx("perfisEyebrow", "Pequeno título por cima", "Para quem é"),
      tx("perfisTitulo", "Título", "Para quem é"),
      {
        k: "perfis", label: "Cartões", grupo: "Para quem é", tipo: "lista", max: 6,
        itens: [{ k: "icone", label: "Símbolo (ex.: ①)", tipo: "text" }, ITEM.titulo, ITEM.texto],
      },
      tx("processoEyebrow", "Pequeno título por cima", "Como funciona (resumo)"),
      tx("processoTitulo", "Título", "Como funciona (resumo)"),
      ta("processoTexto", "Texto", "Como funciona (resumo)"),
      {
        k: "passos", label: "Passos (numerados pela ordem)", grupo: "Como funciona (resumo)", tipo: "lista", max: 8,
        itens: [ITEM.titulo],
      },
      tx("anunciosEyebrow", "Pequeno título por cima", "Parceiros & destaques"),
      tx("anunciosTitulo", "Título", "Parceiros & destaques"),
      ...cta(),
    ],
  },
  {
    key: "areas",
    nome: "Áreas de negócio (cartões)",
    rota: "/quem-somos",
    campos: [
      tx("imobiliarioTitulo", "Imobiliário — título", "Imobiliário"),
      ta("imobiliarioTexto", "Imobiliário — texto", "Imobiliário"),
      tx("imobiliarioCta", "Imobiliário — ligação", "Imobiliário"),
      tx("marcasTitulo", "Representações comerciais — título", "Representações comerciais"),
      ta("marcasTexto", "Representações comerciais — texto", "Representações comerciais"),
      tx("marcasCta", "Representações comerciais — ligação", "Representações comerciais"),
      tx("tecnologiaTitulo", "Tecnologia — título", "Tecnologia"),
      ta("tecnologiaTexto", "Tecnologia — texto", "Tecnologia"),
      tx("tecnologiaCta", "Tecnologia — ligação", "Tecnologia"),
    ],
  },
  {
    key: "quem-somos",
    nome: "Quem Somos",
    rota: "/quem-somos",
    campos: [
      ...hero(),
      tx("percursoEyebrow", "Pequeno título por cima", "O nosso percurso (cartões das áreas: ver 'Áreas de negócio')"),
      tx("percursoTitulo", "Título", "O nosso percurso (cartões das áreas: ver 'Áreas de negócio')"),
      tx("missaoEyebrow", "Missão — pequeno título", "Missão e visão"),
      tx("missaoTitulo", "Missão — título", "Missão e visão"),
      ta("missaoTexto1", "Missão — parágrafo 1", "Missão e visão"),
      ta("missaoTexto2", "Missão — parágrafo 2", "Missão e visão"),
      tx("visaoEyebrow", "Visão — pequeno título", "Missão e visão"),
      ta("visaoTexto", "Visão — texto", "Missão e visão"),
      tx("valoresEyebrow", "Pequeno título por cima", "Valores"),
      tx("valoresTitulo", "Título", "Valores"),
      { k: "valores", label: "Valores", grupo: "Valores", tipo: "lista", max: 10, itens: [ITEM.titulo, ITEM.texto] },
      tx("diferenciaisEyebrow", "Pequeno título por cima", "Diferenciais"),
      tx("diferenciaisTitulo", "Título", "Diferenciais"),
      { k: "diferenciais", label: "Cartões", grupo: "Diferenciais", tipo: "lista", max: 10, itens: [ITEM.titulo, ITEM.texto] },
    ],
  },
  {
    key: "como-funciona",
    nome: "Como Funciona",
    rota: "/como-funciona",
    campos: [
      ...hero(),
      tx("passosEyebrow", "Pequeno título por cima", "O processo"),
      tx("passosTitulo", "Título", "O processo"),
      {
        k: "passos", label: "Passos (numerados pela ordem)", grupo: "O processo", tipo: "lista", max: 10,
        itens: [ITEM.titulo, ITEM.texto],
      },
      tx("pilaresEyebrow", "Pequeno título por cima", "Serviços"),
      tx("pilaresTitulo", "Título", "Serviços"),
      ta("pilaresTexto", "Texto", "Serviços"),
      cartoes("pilares", "Cartões", "Serviços"),
      ...cta(),
    ],
  },
  {
    key: "portugal",
    nome: "Portugal",
    rota: "/portugal",
    campos: [
      ...hero(),
      tx("porqueTitulo", "Título", "Porquê Portugal (as regiões vêm de Regiões & Zonas)"),
      ta("porqueTexto", "Texto", "Porquê Portugal (as regiões vêm de Regiões & Zonas)"),
    ],
  },
  {
    key: "brasil",
    nome: "Brasil",
    rota: "/brasil",
    campos: [
      ...hero(),
      tx("porqueTitulo", "Título", "Porquê o Brasil (as regiões vêm de Regiões & Zonas)"),
      ta("porqueTexto", "Texto", "Porquê o Brasil (as regiões vêm de Regiões & Zonas)"),
    ],
  },
  {
    key: "empreendimentos",
    nome: "Todos os empreendimentos",
    rota: "/empreendimentos",
    campos: hero(),
  },
  {
    key: "marcas",
    nome: "Representações comerciais",
    rota: "/representacoes",
    campos: [
      ...hero(),
      tx("categoriasEyebrow", "Pequeno título por cima", "Categorias"),
      tx("categoriasTitulo", "Título", "Categorias"),
      tx("destaquesEyebrow", "Pequeno título por cima", "Produtos em destaque"),
      tx("destaquesTitulo", "Título", "Produtos em destaque"),
      tx("marcasEyebrow", "Pequeno título por cima", "Faixa de marcas"),
      tx("marcasTitulo", "Título", "Faixa de marcas"),
      tx("comoTitulo", "Título", "Como encomendar"),
      ta("comoTexto", "Texto", "Como encomendar"),
      ...cta(),
    ],
  },
  {
    key: "tecnologia",
    nome: "Tecnologia",
    rota: "/tecnologia",
    campos: [...hero(), cartoes("cards", "Cartões", "Cartões"), ...cta()],
  },
  {
    key: "parcerias",
    nome: "Parcerias",
    rota: "/parcerias",
    campos: [
      ...hero(),
      tx("redeEyebrow", "Pequeno título por cima", "A rede"),
      tx("redeTitulo", "Título", "A rede"),
      cartoes("rede", "Cartões", "A rede", 8),
      tx("parceiroEyebrow", "Pequeno título por cima", "Tornar-se parceiro"),
      tx("parceiroTitulo", "Título", "Tornar-se parceiro"),
      ta("parceiroTexto", "Texto", "Tornar-se parceiro"),
      {
        k: "parceiroVantagens", label: "Vantagens (lista com ✓)", grupo: "Tornar-se parceiro", tipo: "lista", max: 8,
        itens: [{ k: "texto", label: "Texto", tipo: "text" }],
      },
    ],
  },
  {
    key: "publicidade",
    nome: "Parceiros (publicidade)",
    rota: "/publicidade",
    campos: [
      ...hero(),
      tx("principalEyebrow", "Pequeno título do patrocinador principal", "Patrocinador principal"),
      ...cta(),
    ],
  },
  {
    key: "faq",
    nome: "Perguntas frequentes",
    rota: "/faq",
    campos: [
      ...hero(),
      {
        k: "perguntas", label: "Perguntas (agrupadas pela categoria, pela ordem)", grupo: "Perguntas", tipo: "lista", max: 60,
        itens: [
          { k: "categoria", label: "Categoria (igual nas perguntas do mesmo grupo)", tipo: "text" },
          { k: "pergunta", label: "Pergunta", tipo: "text" },
          { k: "resposta", label: "Resposta", tipo: "textarea" },
        ],
      },
      ...cta(),
    ],
  },
  {
    key: "contactos",
    nome: "Contactos",
    rota: "/contactos",
    campos: [
      ...hero(),
      tx("infoEyebrow", "Pequeno título por cima", "Contactos diretos"),
      tx("infoTitulo", "Título", "Contactos diretos"),
      tx("email", "Email", "Contactos diretos"),
      tx("telefone", "Telefone", "Contactos diretos"),
      tx("presenca", "Presença", "Contactos diretos"),
      tx("horario", "Horário", "Contactos diretos"),
    ],
  },
];

// Formato antigo da Tecnologia (card1Titulo…card3Texto) → lista "cards".
// Aplica-se ao ler: campos, en e enFonte passam para a lista, pelo id.
const CARDS_ANTIGOS = ["tec1", "tec2", "tec3"];
const chavesAntigas = (i) => [`card${i + 1}Titulo`, `card${i + 1}Texto`];

function migraTecnologia(doc) {
  const c = doc?.campos;
  if (!c || Array.isArray(c.cards) || !CARDS_ANTIGOS.some((_, i) => chavesAntigas(i).some((k) => k in c)))
    return doc;
  const def = DEFAULTS.tecnologia.cards;
  const tira = (o) => {
    const r = { ...o };
    CARDS_ANTIGOS.forEach((_, i) => chavesAntigas(i).forEach((k) => delete r[k]));
    return r;
  };
  const campos = {
    ...tira(c),
    cards: CARDS_ANTIGOS.map((id, i) => {
      const [kt, kx] = chavesAntigas(i);
      return { ...def[i], titulo: c[kt] ?? def[i].titulo, texto: c[kx] ?? def[i].texto };
    }),
  };
  // en / enFonte: { card1Titulo: "…" } → { cards: { tec1: { titulo: "…" } } }.
  const porId = (o) => {
    if (!o || typeof o !== "object") return o;
    const cards = {};
    CARDS_ANTIGOS.forEach((id, i) => {
      const [kt, kx] = chavesAntigas(i);
      const item = {};
      if (typeof o[kt] === "string") item.titulo = o[kt];
      if (typeof o[kx] === "string") item.texto = o[kx];
      if (Object.keys(item).length) cards[id] = item;
    });
    return { ...tira(o), ...(Object.keys(cards).length ? { cards } : {}) };
  };
  return { ...doc, campos, en: porId(doc.en), enFonte: porId(doc.enFonte), migrado: true };
}

const MIGRACOES = { tecnologia: migraTecnologia };

/** Documento da página como está na base, já no formato atual (ou null). */
export function migraDoc(pagina, doc) {
  return doc && MIGRACOES[pagina] ? MIGRACOES[pagina](doc) : doc;
}

async function leDoc(pagina) {
  try {
    const db = await getDb();
    return migraDoc(pagina, await db.collection("paginas").findOne({ _id: pagina }));
  } catch {
    return null; /* sem base: só os textos por defeito */
  }
}

// Texto inglês de um campo: tradução guardada → defeito inglês (se o
// português ainda for o de origem) → tradução de referência → português.
function textoEn(pt, enGuardado, ptDefeito, enDefeito) {
  if (typeof enGuardado === "string" && enGuardado.trim()) return enGuardado;
  if (pt === ptDefeito && enDefeito) return enDefeito;
  return CONTEUDO_EN[pt] ?? pt;
}

// Lista em inglês: as traduções (guardadas e por defeito) estão por id.
function listaEn(itens, defItens, defEn, en) {
  const defPorId = new Map((Array.isArray(defItens) ? defItens : []).map((x) => [x.id, x]));
  return itens.map((item) => {
    const out = { ...item };
    for (const [k, v] of Object.entries(item)) {
      if (CAMPOS_ITEM_FIXOS.has(k) || typeof v !== "string") continue;
      out[k] = textoEn(v, en?.[item.id]?.[k], defPorId.get(item.id)?.[k], defEn?.[item.id]?.[k]);
    }
    return out;
  });
}

/**
 * Textos de uma página no idioma pedido.
 * EN: cada campo usa a tradução guardada (doc.en); se não houver e o texto
 * português for ainda o de origem, usa DEFAULTS_EN; senão a tradução de
 * referência (lib/i18n/conteudoTraduzido.js) ou, por fim, o português.
 * Nas listas é igual, item a item (pelo id).
 */
export async function getConteudo(pagina, lang = "pt") {
  const def = DEFAULTS[pagina] || {};
  const doc = await leDoc(pagina);
  const pt = { ...def, ...(doc?.campos || {}) };
  // Uma lista gravada com outro formato não parte a página: vale o defeito.
  for (const k of Object.keys(def)) if (Array.isArray(def[k]) && !Array.isArray(pt[k])) pt[k] = def[k];
  if (lang !== "en") return pt;
  const defEn = DEFAULTS_EN[pagina] || {};
  const en = doc?.en || {};
  const out = {};
  for (const k of Object.keys(pt)) {
    if (Array.isArray(pt[k])) out[k] = listaEn(pt[k], def[k], defEn[k], en[k]);
    else out[k] = textoEn(pt[k], en[k], def[k], defEn[k]);
  }
  return out;
}

// Tradução inglesa guardada de uma página (só o que já foi traduzido/editado).
export async function getPaginaEn(pagina) {
  return (await leDoc(pagina))?.en || {};
}

const MAX_TEXTO_ITEM = 4000;
const MAX_ITENS = 60;
const ICONES = new Set(NOMES_ICONES);
const idNovo = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// Uma lista do backoffice: só objetos, só os campos declarados (texto), com
// id válido e único; corta o número de itens e o tamanho dos textos.
function limpaLista(reg, valor) {
  if (!Array.isArray(valor)) return null;
  const vistos = new Set();
  return valor
    .filter((x) => x && typeof x === "object" && !Array.isArray(x))
    .slice(0, Math.min(reg.max || MAX_ITENS, MAX_ITENS))
    .map((x) => {
      let id = typeof x.id === "string" && ID_ITEM.test(x.id) ? x.id : idNovo();
      while (vistos.has(id)) id = idNovo();
      vistos.add(id);
      const item = { id };
      for (const c of reg.itens) {
        const v = typeof x[c.k] === "string" ? x[c.k].slice(0, MAX_TEXTO_ITEM) : "";
        item[c.k] = c.tipo === "icone" && !ICONES.has(v) ? "" : v;
      }
      return item;
    });
}

/**
 * Valida os textos recebidos do backoffice: só páginas do registo PAGINAS e só
 * os campos dessa página — texto, ou listas (limpaLista). Devolve null se o
 * pedido for inválido.
 */
export function limpaCampos(pagina, campos) {
  const reg = PAGINAS.find((p) => p.key === pagina);
  if (!reg || !campos || typeof campos !== "object" || Array.isArray(campos)) return null;
  const out = {};
  for (const c of reg.campos) {
    if (c.tipo === "lista") {
      const l = limpaLista(c, campos[c.k]);
      if (l) out[c.k] = l;
    } else if (typeof campos[c.k] === "string") out[c.k] = campos[c.k];
  }
  return out;
}

// `campos` já validados (limpaCampos); `en`/`enFonte` só quando mudam
// (correções manuais, ou o formato antigo convertido — migraDoc).
export async function setConteudo(pagina, campos, en, enFonte) {
  const db = await getDb();
  const set = { campos };
  if (en && typeof en === "object") set.en = en;
  if (enFonte && typeof enFonte === "object") set.enFonte = enFonte;
  await db.collection("paginas").updateOne({ _id: pagina }, { $set: set }, { upsert: true });
}
