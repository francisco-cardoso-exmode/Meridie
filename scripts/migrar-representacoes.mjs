// Migração "Marcas" → "Representações comerciais":
//   node scripts/migrar-representacoes.mjs            (só mostra o plano)
//   node scripts/migrar-representacoes.mjs --aplicar  (grava)
//
// 1. Cria as categorias iniciais (Bebidas → Vinho, Espumante, Gin, Sangria;
//    Alimentação → Conservas, Azeite) que ainda não existam, e uma categoria
//    para cada área de marca sem correspondência.
// 2. Cada produto que vive dentro de uma marca (marca.produtos[]) passa para
//    a coleção "produtos", ligado à marca, com a categoria/subcategoria
//    deduzida (área da marca + nome/denominação), "Preço sob consulta" e a
//    tradução inglesa que já tinha.
// 3. A lista antiga sai da marca (fica uma cópia em marca.produtosLegado).
// Pode correr-se mais do que uma vez: o que já existe não é tocado.
// Antes de correr, cria os índices: node scripts/criar-indices.mjs
import pkg from "@next/env";
import { MongoClient } from "mongodb";
import { SEED_CATEGORIAS, categoriasEmFalta, produtosDaMarca } from "../lib/repMigracao.mjs";

const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

if (!process.env.MONGODB_URI) {
  console.error("Falta MONGODB_URI (.env.local).");
  process.exit(1);
}

const APLICAR = process.argv.includes("--aplicar");

const c = new MongoClient(process.env.MONGODB_URI);
await c.connect();
const db = c.db(process.env.MONGODB_DB || "meridie");
const colCat = db.collection("categorias");
const colProd = db.collection("produtos");
const colMarcas = db.collection("marcas");

console.log(APLICAR ? "=== A APLICAR ===" : "=== PRÉ-VISUALIZAÇÃO (usa --aplicar para gravar) ===");

// 1. Produtos (plano).
const marcas = await colMarcas.find({}).toArray();
const usados = new Set((await colProd.find({}, { projection: { _id: 0, slug: 1 } }).toArray()).map((p) => p.slug));
const comLista = marcas.filter((m) => Array.isArray(m.produtos) && m.produtos.length);
const plano = comLista.map((m) => ({ marca: m, produtos: produtosDaMarca(m, usados) }));
const total = plano.reduce((n, x) => n + x.produtos.length, 0);

// 2. Categorias: com a coleção vazia entra a árvore inicial toda; senão só
// as que os produtos a migrar usam e ainda não existem (uma categoria
// apagada de propósito no backoffice não volta sem ser precisa).
const catsAntes = await colCat.find({}, { projection: { _id: 0, slug: 1, parent: 1 } }).toArray();
const haCat = new Set(catsAntes.map((x) => x.slug));
const precisas = new Set(plano.flatMap((x) => x.produtos.flatMap((p) => [p.categoria, p.subcategoria])).filter(Boolean));
const novasCats = [];
for (const x of SEED_CATEGORIAS) {
  if (haCat.has(x.slug) || (catsAntes.length && !precisas.has(x.slug))) continue;
  novasCats.push(x);
  haCat.add(x.slug);
}
novasCats.push(...categoriasEmFalta(comLista, [...catsAntes, ...novasCats]));
console.log(`\nCategorias novas: ${novasCats.length}`);
for (const x of novasCats) console.log(`  + ${x.parent ? `${x.parent} › ` : ""}${x.slug} (${x.nome})`);

console.log(`\nMarcas com produtos no formato antigo: ${comLista.length} — ${total} produto(s) a passar para a coleção "produtos"`);
for (const { marca, produtos } of plano) {
  console.log(`  ${marca.slug}:`);
  for (const p of produtos)
    console.log(`    → ${p.slug.padEnd(48)} ${p.categoria}${p.subcategoria ? ` › ${p.subcategoria}` : " (sem subcategoria)"}${p.unidade ? ` · ${p.unidade}` : ""}`);
}

if (APLICAR) {
  const agora = new Date();
  for (const x of novasCats) {
    await colCat.updateOne({ slug: x.slug }, { $setOnInsert: { ...x, atualizadoEm: agora } }, { upsert: true });
  }
  // A árvore inicial não volta a ser copiada pelo backoffice.
  await db.collection("config").updateOne({ _id: "seed-categorias" }, { $setOnInsert: { em: agora } }, { upsert: true });
  let n = 0;
  for (const { marca, produtos } of plano) {
    for (const p of produtos) {
      const r = await colProd.updateOne({ slug: p.slug }, { $setOnInsert: { ...p, atualizadoEm: agora } }, { upsert: true });
      n += r.upsertedCount;
    }
    // A lista antiga sai da marca (cópia em produtosLegado); as traduções
    // dos produtos foram com eles.
    await colMarcas.updateOne(
      { _id: marca._id },
      {
        $set: { produtosLegado: marca.produtos, migradoEm: agora },
        $unset: { produtos: "", "en.produtos": "", "enFonte.produtos": "" },
      }
    );
  }
  await db.collection("config").updateOne(
    { _id: "migracao-representacoes" },
    { $set: { em: agora, produtos: n, categorias: novasCats.length } },
    { upsert: true }
  );
  console.log(`\nFeito: ${novasCats.length} categoria(s) e ${n} produto(s) criados.`);
}

await c.close();
