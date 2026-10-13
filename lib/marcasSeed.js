// Marcas de exemplo (seed) — mostradas enquanto a coleção "marcas" no Mongo
// estiver vazia; na primeira gravação no backoffice são copiadas para lá.
// Fichas de produto compiladas a partir dos sites/fichas técnicas oficiais
// de cada produtor (out. 2026). Valores como o teor alcoólico podem variar
// por colheita.

export const SEED_MARCAS = [
  {
    slug: "quinta-da-levada",
    nome: "Quinta da Levada",
    area: "bebidas",
    origem: "Vinho Verde · Amarante",
    texto:
      "Em Aboadela, na encosta da Serra do Marão, a poucos minutos de Amarante. Cerca de 8 hectares de vinha em solo granítico, dedicados ao Vinho Verde e em especial à casta Azal — com vários Prémios Verde Ouro desde 2010 e medalhas no Concours Mondial de Bruxelles.",
    imagens: ["/marcas/quinta-da-levada-1.jpg"],
    produtos: [
      {
        nome: "Quinta da Levada Azal",
        descricao:
          "Vinho Verde branco DOC da Sub-Região de Amarante, feito apenas com a casta Azal. Cor citrina com notas limonadas e aroma complexo de fruta citrina, chá verde e notas tropicais. Na boca é equilibrado e fresco, com um final excelente. Para beber jovem.",
        imagem: "/marcas/produtos/quinta-da-levada-1.jpg",
        caracteristicas: [
          ["Denominação", "Vinho Verde Branco DOC"],
          ["Região", "Vinhos Verdes — Sub-Região de Amarante"],
          ["Casta", "Azal (100%)"],
          ["Teor alcoólico", "12,5% vol."],
          ["Notas de prova", "Fruta citrina, chá verde e notas tropicais; equilibrado e fresco"],
          ["Solo", "Franco-arenoso, de origem granítica"],
          ["Temperatura de serviço", "7 a 9 °C"],
          ["Harmonização", "Carnes brancas, marisco e peixe; refeições ligeiras, saladas e cozinha oriental"],
          ["Capacidade", "75 cl"],
          ["Prémios", "CVRVV Best Of 2010; Verde Ouro 2010, 2012, 2014, 2015, 2018, 2020, 2021 e 2022; Concours Mondial de Bruxelles (prata) 2016 e 2017"],
          ["Enólogo", "António Sousa"],
        ],
      },
      {
        nome: "Quinta da Levada Origens Azal",
        descricao:
          "Vinho Verde branco DOC 100% Azal, com a menção «Vinho Verde de Amarante». Nasce de uma casta secular cultivada nas primeiras vinhas da quinta. Tons citrinos, aroma de fruta citrina, chá verde e notas tropicais; na boca é equilibrado, com muita estrutura e complexidade.",
        imagem: "/marcas/produtos/quinta-da-levada-2.jpg",
        caracteristicas: [
          ["Denominação", "Vinho Verde Branco DOC"],
          ["Região", "Vinhos Verdes — Sub-Região de Amarante"],
          ["Casta", "Azal (100%)"],
          ["Teor alcoólico", "12,5% vol."],
          ["Notas de prova", "Fruta citrina, chá verde e notas tropicais; estruturado e complexo"],
          ["Solo", "Franco-arenoso, de origem granítica"],
          ["Temperatura de serviço", "7 a 9 °C"],
          ["Harmonização", "Carnes brancas, marisco e peixe; refeições ligeiras, saladas e cozinha oriental"],
          ["Capacidade", "75 cl"],
          ["Enólogo", "António Sousa"],
        ],
      },
      {
        nome: "Quinta da Levada Bruto",
        descricao:
          "Espumante branco IG Minho, feito apenas com a casta Azal. Cor citrina com notas limonadas e aroma de fruta citrina, chá verde e notas tropicais. Fresco e mineral, de bolha fina e persistente — um espumante muito gastronómico.",
        imagem: "/marcas/produtos/quinta-da-levada-3.jpg",
        caracteristicas: [
          ["Denominação", "Vinho Espumante Branco IG Minho"],
          ["Região", "Vinhos Verdes — Sub-Região de Amarante"],
          ["Casta", "Azal (100%)"],
          ["Teor alcoólico", "12,5% vol."],
          ["Notas de prova", "Fruta citrina, chá verde e notas tropicais; fresco, mineral, bolha fina"],
          ["Harmonização", "Assados no forno, leitão, peixes gordos e pratos orientais"],
          ["Capacidade", "75 cl"],
          ["Enólogo", "António Sousa"],
        ],
      },
    ],
    url: "https://www.quintadalevada.pt/",
    mostrarHome: true,
    ativo: true,
    ordem: 1,
  },
  {
    slug: "quinta-de-argemil",
    nome: "Quinta de Argemil",
    area: "bebidas",
    origem: "Vinho Verde · Barcelos · desde 1878",
    texto:
      "Em Perelhal, Barcelos, na Sub-Região do Cávado. Uma casa de família com herança do século XIX — «since 1878» — e seis gerações dedicadas ao Vinho Verde, que recebe visitantes há mais de 30 anos com provas, passeio pelas vinhas e visita à adega.",
    imagens: [],
    produtos: [
      {
        nome: "Quinta de Argemil Loureiro",
        descricao:
          "Vinho Verde DOC branco com base na casta Loureiro, completada com Pedernã, Trajadura e Fernão Pires. De vinhas em solo granítico em Perelhal, Barcelos. Límpido, de cor citrina.",
        imagem: "/marcas/produtos/quinta-de-argemil-1.jpg",
        caracteristicas: [
          ["Região", "DOC Vinho Verde — Sub-Região do Cávado"],
          ["Castas", "Loureiro (80%), Pedernã (10%), Trajadura (5%), Fernão Pires (5%)"],
          ["Teor alcoólico", "11,5% vol."],
          ["Cor", "Branco, límpido, citrino"],
          ["Solo", "Granítico"],
          ["Acidez total", "6,2 g/L"],
          ["Temperatura de serviço", "8 a 10 °C"],
        ],
      },
      {
        nome: "Quinta de Argemil Reserva 2023",
        descricao:
          "Vinho Verde DOC branco da colheita de 2023, de Arinto, Alvarinho e Loureiro. De vinhas em solo granítico em Perelhal, Barcelos. Límpido, de cor citrina.",
        imagem: "/marcas/produtos/quinta-de-argemil-2.jpg",
        caracteristicas: [
          ["Região", "DOC Vinho Verde — Sub-Região do Cávado"],
          ["Castas", "Arinto (70%), Alvarinho (25%), Loureiro (5%)"],
          ["Colheita", "2023"],
          ["Teor alcoólico", "12% vol."],
          ["Cor", "Branco, límpido, citrino"],
          ["Solo", "Granítico"],
          ["Acidez total", "6,7 g/L"],
          ["Temperatura de serviço", "10 a 12 °C"],
        ],
      },
    ],
    url: "https://quintadeargemil.pt/",
    mostrarHome: true,
    ativo: true,
    ordem: 2,
  },
  {
    slug: "pura-drinks",
    nome: "PURA Drinks",
    area: "bebidas",
    origem: "Sangria Mix · Barcelos",
    texto:
      "Marca portuguesa de Abade de Neiva, Barcelos, que propõe sangria de espumante «em 1 minuto»: o Pura Sangria Mix — maçã verde, frutos vermelhos ou maracujá — junta-se ao Pura Espumante, em kit, kit XXL para festas ou em separado.",
    imagens: ["/marcas/pura-1.jpg", "/marcas/pura-3.jpg", "/marcas/pura-packs.jpg"],
    produtos: ["Maçã Verde", "Frutos Vermelhos", "Maracujá"].map((sabor, i) => ({
      nome: `Sangria Kit — ${sabor}`,
      descricao: `Kit para preparar sangria de espumante em cerca de um minuto: uma garrafa de Pura Espumante e um Pura Sangria Mix de ${sabor.toLowerCase()}. Basta juntar o espumante e o mix a gelo num jarro e acrescentar fruta a gosto — segundo a marca, dá um jarro de 2 L de sangria, ideal para partilhar.`,
      imagem: `/marcas/produtos/${["pura-kit-maca", "pura-kit-frutos", "pura-kit-maracuja"][i]}.jpg`,
      caracteristicas: [
        ["Conteúdo do kit", `1 Pura Sangria Mix ${sabor} (250 ml) + 1 Pura Espumante (75 cl)`],
        ["Sabor", sabor],
        ["Rendimento", "1 jarro de 2 L de sangria (segundo a marca)"],
        ["Preparação", "Gelo num jarro → 750 ml de espumante → 250 ml de Pura Mix → fruta a gosto → envolver e servir"],
        ["Ingredientes (Mix)", `Água, preparado de ${sabor.toLowerCase()}, açúcar, álcool`],
        ["Teor alcoólico", "Sangria Mix 8% vol. · Espumante 10,5% vol."],
        ["Conservação", "Em local seco e fresco"],
        ["Consumo", "Destinado a maiores de 18 anos"],
      ],
    })),
    url: "https://puradrinks.pt",
    mostrarHome: true,
    ativo: true,
    ordem: 3,
  },
  {
    slug: "mar-original",
    nome: "MAR Original",
    area: "alimentacao",
    origem: "Conservas · Produto de Portugal",
    texto:
      "Conservas portuguesas de peixe selvagem em latas de 120 g, embrulhadas em papel com cartografia antiga — uma homenagem aos navegadores portugueses. Várias referências usam ingredientes de agricultura biológica certificados pela Ecocert, como o azeite virgem extra e o tomate.",
    imagens: ["/marcas/mar-1.jpg"],
    produtos: [
      ["Sardinhas em azeite virgem extra biológico", "Sardinhas selvagens conservadas em azeite virgem extra de agricultura biológica.", "mar-2", "Sardinha, azeite virgem extra biológico", true],
      ["Sardinhas em tomate biológico", "Sardinhas selvagens conservadas em molho de tomate de agricultura biológica.", "mar-4", "Sardinha, molho de tomate biológico", true],
      ["Filetes de salmão ao natural", "Filetes de salmão selvagem conservados ao natural — simples e versáteis, para saladas, tostas e massas.", "mar-1", "Salmão, água, sal", false],
      ["Filetes de cavala em molho de mostarda", "Filetes de cavala selvagem num molho de mostarda suave.", "mar-5", "Cavala, molho de mostarda", false],
      ["Bacalhau à portuguesa", "Bacalhau selvagem preparado à portuguesa e conservado em azeite virgem extra de agricultura biológica.", "mar-3", "Bacalhau, azeite virgem extra biológico", true],
      ["Bacalhau assado em azeite e alho", "Bacalhau selvagem assado, conservado em azeite virgem extra com alho.", "mar-6", "Bacalhau, azeite virgem extra, alho", false],
    ].map(([nome, descricao, img, base, bio]) => ({
      nome,
      descricao: `${descricao} Lata de 120 g, Produto de Portugal.`,
      imagem: `/marcas/produtos/${img}.jpg`,
      caracteristicas: [
        ["Peso líquido", "120 g"],
        ["Base", base],
        ["Pesca", "Peixe selvagem (wild-caught)"],
        ...(bio ? [["Certificação", "Ecocert — agricultura biológica"]] : []),
        ["Origem", "Produto de Portugal"],
      ],
    })),
    url: "",
    mostrarHome: true,
    ativo: true,
    ordem: 4,
  },
  {
    slug: "casa-de-s-miguel",
    nome: "Casa de S. Miguel",
    area: "alimentacao",
    origem: "Azeite · Trás-os-Montes",
    texto:
      "Casa agrícola da Aldeia dos Avidagos, em Mirandela, na Terra Quente transmontana. Desde 2002, pai e filho dão o nome da casa aos azeites dos seus olivais autóctones, seculares e de sequeiro — sobretudo Cordovil, Verdeal e Cobrançosa — embalados na tradicional lata portuguesa, que protege o azeite da luz.",
    imagens: ["/marcas/casa-sao-miguel-1.jpg", "/marcas/casa-sao-miguel-3.jpg"],
    produtos: [
      {
        nome: "Azeite Virgem Extra Monovarietal Cordovil",
        descricao:
          "Azeite virgem extra monovarietal da azeitona Cordovil, variedade tradicional de Trás-os-Montes, dos olivais da Casa de S. Miguel em Mirandela. Extraído a frio, unicamente por processos mecânicos, e embalado em lata litografada com motivos da antiga produção de azeite.",
        imagem: "/marcas/produtos/casa-sao-miguel-1.jpg",
        caracteristicas: [
          ["Variedade", "Cordovil (monovarietal)"],
          ["Região", "Trás-os-Montes — Terra Quente (Mirandela)"],
          ["Extração", "A frio, unicamente por processos mecânicos"],
          ["Categoria", "Azeite virgem extra, 100% puro"],
          ["Formatos", "Lata de 200 ml, 250 ml e 500 ml"],
          ["Origem", "Produto de Portugal"],
        ],
      },
      {
        nome: "Azeite Virgem Extra Biológico",
        descricao:
          "Azeite virgem extra de agricultura biológica, das variedades Cordovil, Verdeal e Cobrançosa da Terra Quente transmontana. Extraído a frio, por processos mecânicos, em lagar ecológico, e certificado em modo de produção biológico.",
        imagem: "/marcas/produtos/casa-sao-miguel-2.jpg",
        caracteristicas: [
          ["Variedades", "Cordovil, Verdeal e Cobrançosa"],
          ["Região", "Trás-os-Montes — Terra Quente (Mirandela)"],
          ["Extração", "A frio, por processos mecânicos, em lagar ecológico"],
          ["Categoria", "Azeite virgem extra, 100% puro"],
          ["Certificação", "Agricultura biológica — PT-BIO-01"],
          ["Formatos", "Lata de 200 ml, 250 ml e 500 ml"],
          ["Origem", "Produto de Portugal"],
        ],
      },
    ],
    url: "",
    mostrarHome: true,
    ativo: true,
    ordem: 5,
  },
  // MURGANHEIRA
  // AGIN
];
