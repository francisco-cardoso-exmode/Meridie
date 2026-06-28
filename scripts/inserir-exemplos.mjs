import pkg from "@next/env";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

const u = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1280&q=70`;

const EXEMPLOS = [
  {
    slug: "foz-atlantic-residences-porto",
    nome: "Foz Atlantic Residences",
    pais: "portugal",
    cidade: "Porto",
    zona: "Foz do Douro",
    tipo: "Apartamento",
    finalidade: "Habitação",
    preco: 560000,
    moeda: "EUR",
    precoTipo: "desde",
    quartos: 3,
    casasBanho: 2,
    area: 118,
    estado: "Em construção",
    destaque: false,
    publicado: true,
    resumo:
      "T2 e T3 novos na Foz do Douro, a passos do mar, com acabamentos premium e varandas amplas.",
    descricao:
      "Na zona mais nobre do Porto, a Foz do Douro, este empreendimento une a proximidade ao mar à elegância de um bairro consolidado. Apartamentos com luz natural abundante, varandas voltadas ao Atlântico e acabamentos de primeira linha — ideais para habitação própria ou para um investimento sólido numa das zonas mais valorizadas da cidade.",
    caracteristicas: [
      "A 300 m da praia da Foz",
      "Varandas amplas voltadas ao mar",
      "Cozinha equipada premium",
      "Garagem fechada",
      "Acabamentos de luxo",
      "Certificado energético A",
    ],
    tipologias: [
      { nome: "T2", area: 95, preco: 480000 },
      { nome: "T3", area: 118, preco: 560000 },
    ],
    proximidades: [
      "Praia da Foz a 300 m",
      "Marginal e jardins do Passeio Alegre",
      "Restaurantes e cafés da Foz Velha",
    ],
    imagens: [u("1545324418-cc1a3fa10c00"), u("1502005229762-cf1b2da7c5d6"), u("1600607687939-ce8a6c25118c")],
  },
  {
    slug: "aldeota-prime-tower-fortaleza",
    nome: "Aldeota Prime Tower",
    pais: "brasil",
    cidade: "Fortaleza",
    zona: "Aldeota",
    tipo: "Apartamento",
    finalidade: "Investimento",
    preco: 1350000,
    moeda: "BRL",
    precoTipo: "desde",
    quartos: 3,
    casasBanho: 2,
    area: 110,
    estado: "Em planta",
    destaque: false,
    publicado: true,
    resumo:
      "Apartamentos de alto padrão na Aldeota, o bairro mais valorizado de Fortaleza, com lazer completo e forte valorização.",
    descricao:
      "Na Aldeota, coração nobre de Fortaleza, a Aldeota Prime Tower oferece apartamentos modernos com área de lazer completa, segurança e localização privilegiada junto ao comércio, escolas e serviços de excelência. A poucos minutos da Beira-Mar, é uma oportunidade de investimento com elevado potencial de valorização e procura constante de arrendamento.",
    caracteristicas: [
      "Bairro mais valorizado de Fortaleza",
      "Lazer completo: piscina, academia, coworking",
      "Segurança 24 horas",
      "Próximo da Av. Beira-Mar",
      "Acabamentos de alto padrão",
    ],
    tipologias: [
      { nome: "2 quartos", area: 78, preco: 980000 },
      { nome: "3 quartos", area: 110, preco: 1350000 },
    ],
    proximidades: [
      "Av. Beira-Mar a 10 min",
      "Shopping e comércio da Aldeota",
      "Escolas e hospitais de referência",
    ],
    imagens: [u("1545324418-cc1a3fa10c00"), u("1512917774080-9991f1c4c750"), u("1502672260266-1c1ef2d93688")],
  },
];

const c = new MongoClient(process.env.MONGODB_URI);
await c.connect();
const db = c.db(process.env.MONGODB_DB || "meridie");
const col = db.collection("empreendimentos");

const total = await col.countDocuments();
console.log("Empreendimentos no Mongo antes:", total);
if (total === 0) {
  console.log("⚠️  Coleção vazia — o site está a usar o seed, não o Mongo. A inserir mesmo assim.");
}

for (const e of EXEMPLOS) {
  const existe = await col.findOne({ slug: e.slug }, { projection: { _id: 1 } });
  if (existe) {
    console.log("• já existe, ignorado:", e.slug);
    continue;
  }
  await col.insertOne(e);
  console.log("✓ inserido:", e.slug, "—", e.cidade, "/", e.zona);
}

console.log("Empreendimentos no Mongo depois:", await col.countDocuments());
await c.close();
