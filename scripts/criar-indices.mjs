// Cria os índices do MongoDB (correr uma vez, e de novo sempre que mudar):
//   node scripts/criar-indices.mjs
// - slug único nas coleções do backoffice (duas criações ao mesmo tempo não
//   conseguem gravar o mesmo slug);
// - índices das consultas de analytics e leads;
// - TTL: a cache das comparações IA expira aos 30 dias e os eventos de
//   analytics aos ~400 dias (o Mongo apaga-os sozinho).
// Se já existirem slugs repetidos, o índice único falha: o script diz quais.
import pkg from "@next/env";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

if (!process.env.MONGODB_URI) {
  console.error("Falta MONGODB_URI (.env.local).");
  process.exit(1);
}

const DIA = 24 * 60 * 60;
const INDICES = [
  ["empreendimentos", { slug: 1 }, { unique: true, name: "slug_unico" }],
  ["regioes", { slug: 1 }, { unique: true, name: "slug_unico" }],
  ["regioes", { parent: 1 }, { name: "parent" }],
  ["marcas", { slug: 1 }, { unique: true, name: "slug_unico" }],
  ["anuncios", { slug: 1 }, { unique: true, name: "slug_unico" }],
  ["eventos", { tipo: 1, criadoEm: 1 }, { name: "tipo_criadoEm" }],
  ["eventos", { tipo: 1, valor: 1 }, { name: "tipo_valor" }],
  ["eventos", { pais: 1 }, { name: "pais" }],
  ["eventos", { criadoEm: 1 }, { expireAfterSeconds: 400 * DIA, name: "ttl_400_dias" }],
  ["comparacoes_cache", { key: 1 }, { unique: true, name: "key_unica" }],
  ["comparacoes_cache", { criadoEm: 1 }, { expireAfterSeconds: 30 * DIA, name: "ttl_30_dias" }],
  ["contactos", { criadoEm: -1 }, { name: "criadoEm_desc" }],
];

const c = new MongoClient(process.env.MONGODB_URI);
await c.connect();
const db = c.db(process.env.MONGODB_DB || "meridie");

let falhas = 0;
for (const [colecao, chaves, opcoes] of INDICES) {
  try {
    await db.collection(colecao).createIndex(chaves, opcoes);
    console.log(`  ✓ ${colecao}.${opcoes.name}`);
  } catch (e) {
    falhas++;
    console.log(`  ✗ ${colecao}.${opcoes.name}: ${e.message}`);
    if (e.code === 11000 && chaves.slug) {
      const repetidos = await db
        .collection(colecao)
        .aggregate([
          { $group: { _id: "$slug", n: { $sum: 1 } } },
          { $match: { n: { $gt: 1 } } },
        ])
        .toArray();
      console.log(`    slugs repetidos: ${repetidos.map((r) => `${r._id} (${r.n}×)`).join(", ")}`);
    }
  }
}

await c.close();
console.log(falhas ? `\n${falhas} índice(s) por criar — ver acima.` : "\nÍndices criados.");
process.exit(falhas ? 1 : 0);
