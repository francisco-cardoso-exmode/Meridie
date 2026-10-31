import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { allProdutos } from "@/lib/representacoes";
import { allSolucoes } from "@/lib/solucoes";
import { allMarcas } from "@/lib/marcas";
import { hrefProduto, hrefSolucao, temPreco } from "@/lib/catalogo";
import { ESTADOS_PEDIDO } from "@/lib/pedido";
import { traduzDoc } from "@/lib/i18n/conteudo";

/**
 * Pedidos de encomenda / informação (coleção "pedidos") — servidor.
 * Representações e Tecnologia usam o mesmo sistema.
 */

/**
 * Lê cada item da base e devolve a cópia a guardar no pedido (nome, preço,
 * unidade no momento do pedido). Itens que já não existem (ou inativos)
 * ficam de fora. Os nomes ficam em português (a referência da equipa),
 * salvo `lang: "en"` (só para mostrar na página do pedido).
 */
export async function resolverItens(itens, { lang = "pt" } = {}) {
  // Uma leitura de cada coleção para o pedido inteiro.
  const [marcas, produtos, solucoes] = await Promise.all([
    allMarcas({ todos: true }).catch(() => []),
    itens.some((i) => i.tipo === "produto") ? allProdutos() : [],
    itens.some((i) => i.tipo === "solucao") ? allSolucoes() : [],
  ]);
  const nomeMarca = new Map(marcas.map((m) => [m.slug, m.nome]));
  const produtoBySlug = (slug) => produtos.find((p) => p.slug === slug);
  const solucaoBySlug = (slug) => solucoes.find((x) => x.slug === slug);
  const out = [];
  for (const i of itens) {
    if (i.tipo === "produto") {
      const p = traduzDoc(produtoBySlug(i.slug), lang);
      if (!p) continue;
      const comPreco = temPreco(p);
      const minimo = Math.max(1, Number(p.minimo) || 1);
      out.push({
        tipo: "produto",
        slug: p.slug,
        nome: p.nome,
        marca: nomeMarca.get(p.marca) || p.marca || "",
        imagem: p.imagens?.[0] || "",
        href: hrefProduto(p),
        precoTipo: comPreco ? "valor" : "consulta",
        preco: comPreco ? Number(p.preco) : null,
        unidade: p.unidade || "",
        minimo,
        disponivel: p.disponivel !== false,
        quantidade: Math.max(minimo, i.quantidade),
      });
    } else if (i.tipo === "solucao") {
      const s = traduzDoc(solucaoBySlug(i.slug), lang);
      if (!s) continue;
      const plano = i.plano ? (s.planos || []).find((x) => x.id === i.plano) : null;
      const comPreco = plano && temPreco(plano);
      out.push({
        tipo: "solucao",
        slug: s.slug,
        ...(plano ? { plano: plano.id, planoNome: plano.nome } : {}),
        nome: plano ? `${s.nome} — ${plano.nome}` : s.nome,
        marca: s.parceiro || "",
        imagem: s.imagens?.[0] || "",
        href: hrefSolucao(s.slug),
        precoTipo: comPreco ? "valor" : "consulta",
        preco: comPreco ? Number(plano.preco) : null,
        unidade: plano?.unidade || "",
        minimo: 1,
        disponivel: true,
        quantidade: i.quantidade,
      });
    }
  }
  return out;
}

// Referência curta e legível do pedido: P-AAMMDD-XXXX.
export function novaReferencia(agora = new Date()) {
  const d = agora.toISOString().slice(2, 10).replace(/-/g, "");
  const r = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
  return `P-${d}-${r}`;
}

export async function listarPedidos({ estado, limite = 500 } = {}) {
  const db = await getDb();
  const filtro = estado && estado in ESTADOS_PEDIDO ? { estado } : {};
  return db.collection("pedidos").find(filtro).sort({ criadoEm: -1 }).limit(limite).toArray();
}

export async function contarPorEstado() {
  const db = await getDb();
  const r = await db.collection("pedidos").aggregate([{ $group: { _id: "$estado", n: { $sum: 1 } } }]).toArray();
  return Object.fromEntries(r.map((x) => [x._id, x.n]));
}

export const idValido = (id) => typeof id === "string" && /^[a-f0-9]{24}$/.test(id);

export async function pedidoPorId(id) {
  if (!idValido(id)) return null;
  const db = await getDb();
  return db.collection("pedidos").findOne({ _id: new ObjectId(id) });
}
