import { getDb } from "@/lib/mongodb";

/**
 * Marcas representadas (bebidas, alimentação…) — geridas no backoffice
 * (coleção "marcas"). Enquanto a coleção estiver vazia, o site mostra o SEED
 * abaixo; ao criar a primeira marca no backoffice, passa a valer só o Mongo.
 */

export { AREAS_MARCA } from "@/lib/areasMarca";

export const SEED_MARCAS = [
  {
    slug: "quinta-da-levada",
    nome: "Quinta da Levada",
    area: "bebidas",
    origem: "Vinho Verde · Amarante",
    texto:
      "Vinhos Verdes da casta Azal, premiados ano após ano no concurso dos Vinhos Verdes e no Concours Mondial de Bruxelles.",
    imagens: [
      "/marcas/quinta-da-levada-1.jpg",
      "/marcas/quinta-da-levada-2.jpg",
      "/marcas/quinta-da-levada-3.jpg",
    ],
    produtos: [
      { nome: "Azal — Vinho Verde", descricao: "Branco de casta Azal, premiado no concurso dos Vinhos Verdes e em Bruxelas.", imagem: "/marcas/quinta-da-levada-1.jpg" },
      { nome: "Origens Azal", descricao: "Vinho Verde de Amarante, da gama Origens.", imagem: "/marcas/quinta-da-levada-2.jpg" },
      { nome: "Espumante Bruto", descricao: "Espumante bruto da Quinta da Levada.", imagem: "/marcas/quinta-da-levada-3.jpg" },
    ],
    url: "",
    mostrarHome: true,
    ativo: true,
    ordem: 1,
  },
  {
    slug: "quinta-de-argemil",
    nome: "Quinta de Argemil",
    area: "bebidas",
    origem: "Vinho Verde · desde 1878",
    texto: "Vinho Verde DOC de uma casa com mais de um século — Loureiro e Reserva.",
    imagens: ["/marcas/quinta-de-argemil-1.jpg", "/marcas/quinta-de-argemil-2.jpg"],
    produtos: [
      { nome: "Loureiro", descricao: "Vinho Verde DOC, casta Loureiro.", imagem: "/marcas/quinta-de-argemil-1.jpg" },
      { nome: "Reserva 2023", descricao: "Reserva da Quinta de Argemil.", imagem: "/marcas/quinta-de-argemil-2.jpg" },
    ],
    url: "",
    mostrarHome: true,
    ativo: true,
    ordem: 2,
  },
  {
    slug: "pura-drinks",
    nome: "PURA Drinks",
    area: "bebidas",
    origem: "Sangria Mix",
    texto:
      "Sangria de espumante em 1 minuto: maçã verde, frutos vermelhos e maracujá — em garrafa ou em kit.",
    imagens: ["/marcas/pura-1.jpg", "/marcas/pura-2.jpg", "/marcas/pura-3.jpg", "/marcas/pura-packs.jpg"],
    produtos: [
      { nome: "Sangria Kit — Maçã Verde", descricao: "Espumante + Sangria Mix de maçã verde: sangria pronta em 1 minuto.", imagem: "/marcas/pura-kit-maca.jpg" },
      { nome: "Sangria Kit — Frutos Vermelhos", descricao: "Espumante + Sangria Mix de frutos vermelhos.", imagem: "/marcas/pura-kit-frutos.jpg" },
      { nome: "Sangria Kit — Maracujá", descricao: "Espumante + Sangria Mix de maracujá.", imagem: "/marcas/pura-kit-maracuja.jpg" },
    ],
    url: "",
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
      "Conservas de peixe selvagem com certificação Ecocert: sardinhas, salmão, cavala e bacalhau, em azeite virgem extra biológico, tomate ou molhos.",
    imagens: ["/marcas/mar-1.jpg", "/marcas/mar-2.jpg", "/marcas/mar-3.jpg"],
    produtos: [
      { nome: "Sardinhas em azeite virgem extra biológico", descricao: "120 g · peixe selvagem · Ecocert.", imagem: "/marcas/mar-2.jpg" },
      { nome: "Sardinhas em tomate biológico", descricao: "120 g · peixe selvagem · Ecocert.", imagem: "/marcas/mar-4.jpg" },
      { nome: "Filetes de salmão ao natural", descricao: "120 g · peixe selvagem · Ecocert.", imagem: "/marcas/mar-1.jpg" },
      { nome: "Filetes de cavala em molho de mostarda", descricao: "120 g · peixe selvagem · Ecocert.", imagem: "/marcas/mar-5.jpg" },
      { nome: "Bacalhau à portuguesa", descricao: "Em azeite virgem extra biológico · 120 g.", imagem: "/marcas/mar-3.jpg" },
      { nome: "Bacalhau assado em azeite e alho", descricao: "Em azeite virgem extra · 120 g.", imagem: "/marcas/mar-6.jpg" },
    ],
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
      "Azeite virgem extra 100% puro — monovarietal Cordovil e biológico, em latas de 200, 250 e 500 ml.",
    imagens: [
      "/marcas/casa-sao-miguel-1.jpg",
      "/marcas/casa-sao-miguel-2.jpg",
      "/marcas/casa-sao-miguel-3.jpg",
    ],
    produtos: [
      { nome: "Azeite Virgem Extra Monovarietal Cordovil", descricao: "100% puro · Trás-os-Montes · 200, 250 e 500 ml.", imagem: "/marcas/casa-sao-miguel-1.jpg" },
      { nome: "Azeite Virgem Extra Biológico", descricao: "Agricultura biológica certificada · 200, 250 e 500 ml.", imagem: "/marcas/casa-sao-miguel-2.jpg" },
    ],
    url: "",
    mostrarHome: true,
    ativo: true,
    ordem: 5,
  },
];

const porOrdem = (a, b) => (Number(a.ordem) || 99) - (Number(b.ordem) || 99);

export async function allMarcas({ todos = false, home = false, area } = {}) {
  let list = SEED_MARCAS;
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const docs = await db
        .collection("marcas")
        .find({}, { projection: { _id: 0 } })
        .toArray();
      if (docs.length) list = docs;
    } catch {
      // sem ligação: fica o seed
    }
  }
  if (!todos) list = list.filter((m) => m.ativo !== false);
  if (home) list = list.filter((m) => m.mostrarHome);
  if (area) list = list.filter((m) => m.area === area);
  return [...list].sort(porOrdem);
}

export async function marcaBySlug(slug) {
  const list = await allMarcas({ todos: true });
  return list.find((m) => m.slug === slug) || null;
}
