import pkg from "@next/env";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

const APLICAR = process.argv.includes("--aplicar");

const slugify = (s) =>
  (s || "")
    .toString()
    .replace(/²/g, "2")
    .replace(/³/g, "3")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const c = new MongoClient(process.env.MONGODB_URI);
await c.connect();
const col = c.db(process.env.MONGODB_DB || "meridie").collection("empreendimentos");
const docs = await col
  .find({}, { projection: { _id: 0, slug: 1, nome: 1, cidade: 1 } })
  .toArray();

const usados = new Set();
const plano = [];
for (const d of docs) {
  const base = slugify(d.nome);
  const cid = slugify(d.cidade);
  let novo = cid && base && !base.includes(cid) ? `${base}-${cid}` : base || cid || d.slug;
  let final = novo;
  let n = 2;
  while (usados.has(final)) final = `${novo}-${n++}`;
  usados.add(final);
  plano.push({ antigo: d.slug, novo: final, mudou: final !== d.slug });
}

console.log(APLICAR ? "=== A APLICAR ===" : "=== PRÉ-VISUALIZAÇÃO (usa --aplicar para gravar) ===");
for (const p of plano) {
  console.log(`  ${p.mudou ? "→" : "="} ${p.antigo.padEnd(34)} ${p.mudou ? "  =>  " + p.novo : "(igual)"}`);
}

if (APLICAR) {
  let n = 0;
  for (const p of plano) {
    if (!p.mudou) continue;
    await col.updateOne(
      { slug: p.antigo },
      {
        $set: { slug: p.novo },
        // Guarda o slug antigo para reencaminhar os URLs antigos.
        $addToSet: { slugsAntigos: p.antigo },
      }
    );
    n++;
  }
  console.log(`\nSlugs atualizados: ${n}`);
}

await c.close();
