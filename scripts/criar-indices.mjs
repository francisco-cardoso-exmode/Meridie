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
  // Analytics: todas as agregações começam por um intervalo de criadoEm.
  // O índice TTL em { criadoEm: 1 } serve também de índice por data.
  ["eventos", { tipo: 1, criadoEm: 1 }, { name: "tipo_criadoEm" }],
  ["eventos", { tipo: 1, valor: 1, criadoEm: 1 }, { name: "tipo_valor_criadoEm" }],
  ["eventos", { pais: 1, cidade: 1, criadoEm: 1 }, { name: "pais_cidade_criadoEm" }],
  ["eventos", { caminho: 1, criadoEm: 1 }, { name: "caminho_criadoEm" }],
  ["eventos", { criadoEm: 1 }, { expireAfterSeconds: 400 * DIA, name: "ttl_400_dias" }],
  ["comparacoes_cache", { key: 1 }, { unique: true, name: "key_unica" }],
  ["comparacoes_cache", { criadoEm: 1 }, { expireAfterSeconds: 30 * DIA, name: "ttl_30_dias" }],
  ["contactos", { criadoEm: -1 }, { name: "criadoEm_desc" }],
  // Representações comerciais, Tecnologia e pedidos de encomenda.
  ["categorias", { slug: 1 }, { unique: true, name: "slug_unico" }],
  ["categorias", { parent: 1, ordem: 1 }, { name: "parent_ordem" }],
  ["produtos", { slug: 1 }, { unique: true, name: "slug_unico" }],
  ["produtos", { categoria: 1, subcategoria: 1 }, { name: "categoria_subcategoria" }],
  ["produtos", { marca: 1 }, { name: "marca" }],
  ["solucoes", { slug: 1 }, { unique: true, name: "slug_unico" }],
  ["pedidos", { criadoEm: -1 }, { name: "criadoEm_desc" }],
  ["pedidos", { estado: 1, criadoEm: -1 }, { name: "estado_criadoEm" }],
  ["pedidos", { referencia: 1 }, { unique: true, name: "referencia_unica" }],
  // Lixo (30 dias, esvaziado pela app para limpar também as imagens) e atividade do backoffice.
  ["lixo", { apagadoEm: -1 }, { name: "apagadoEm_desc" }],
  ["lixo", { expiraEm: 1 }, { name: "expiraEm" }],
  ["atividade", { em: 1 }, { expireAfterSeconds: 730 * DIA, name: "ttl_2_anos" }],
  // Alojamento Local
  ["al_proprietarios", { email: 1 }, { unique: true, name: "email_unico" }],
  ["al_equipa", { email: 1 }, { unique: true, name: "email_unico" }],
  ["al_casas", { slug: 1 }, { unique: true, name: "slug_unico" }],
  ["al_casas", { proprietarioId: 1 }, { name: "proprietario" }],
  ["al_casas", { estado: 1, pais: 1, cidade: 1 }, { name: "estado_pais_cidade" }],
  ["al_reservas", { casaSlug: 1, estado: 1, entrada: 1, saida: 1 }, { name: "casa_estado_datas" }],
  ["al_reservas", { tokenHash: 1 }, { unique: true, sparse: true, name: "token_hospede" }],
  ["al_reservas", { "pagamento.fornecedor": 1, "pagamento.referencia": 1 }, { sparse: true, name: "pagamento_ref" }],
  ["al_reservas", { estado: 1, criadoEm: -1 }, { name: "estado_criadoEm" }],
  ["al_tarefas", { data: 1, estado: 1, atribuidaA: 1 }, { name: "data_estado_atribuida" }],
  ["al_tarefas", { reservaId: 1, tipo: 1 }, { unique: true, partialFilterExpression: { reservaId: { $type: "string" } }, name: "reserva_tipo_unico" }],
  ["al_tarefas", { casaSlug: 1, estado: 1 }, { name: "casa_estado" }],
  ["al_sessoes", { hash: 1 }, { unique: true, name: "hash_unico" }],
  ["al_sessoes", { expiraEm: 1 }, { expireAfterSeconds: 0, name: "ttl" }],
  ["al_acessos", { expiraEm: 1 }, { expireAfterSeconds: 0, name: "ttl" }],
];

// Índices substituídos por outros que começam pelas mesmas chaves.
const OBSOLETOS = [
  ["eventos", "tipo_valor"], // → tipo_valor_criadoEm
  ["eventos", "pais"], // → pais_cidade_criadoEm
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

// Só apaga os antigos depois de os novos existirem.
if (!falhas) {
  for (const [colecao, nome] of OBSOLETOS) {
    try {
      await db.collection(colecao).dropIndex(nome);
      console.log(`  − ${colecao}.${nome} (substituído)`);
    } catch {
      // Já não existe — nada a fazer.
    }
  }
}

await c.close();
console.log(falhas ? `\n${falhas} índice(s) por criar — ver acima.` : "\nÍndices criados.");
process.exit(falhas ? 1 : 0);
