/**
 * Pedido de encomenda / informação — regras puras (browser e servidor).
 *
 * Um item do pedido: { tipo: "produto" | "solucao", slug, plano?, quantidade,
 * nome, imagem, precoTipo, preco, unidade, minimo }. No browser os dados de
 * apresentação são uma cópia (o carrinho vive no localStorage); o servidor
 * volta a ler cada item da base ao receber o pedido e guarda essa cópia.
 */

export const ESTADOS_PEDIDO = {
  novo: "Novo",
  em_contacto: "Em contacto",
  proposta_enviada: "Proposta enviada",
  fechado: "Fechado",
  cancelado: "Cancelado",
};

// Motivo do pedido (o que o visitante pediu).
export const MOTIVOS = {
  encomenda: "Pedido de encomenda",
  informacao: "Pedido de informação",
  demonstracao: "Pedido de demonstração",
  proposta: "Pedido de proposta",
};

export const TIPOS_ITEM = ["produto", "solucao"];
export const MAX_ITENS = 50;
export const MAX_QTD = 9999;

const SLUG = /^[a-z0-9][a-z0-9-]{0,99}$/;
const ID_PLANO = /^[A-Za-z][A-Za-z0-9_-]{0,39}$/;

/** Chave única de uma linha (o mesmo produto/plano soma-se na mesma linha). */
export const chaveItem = (i) => `${i.tipo}:${i.slug}${i.plano ? `:${i.plano}` : ""}`;

/** Quantidade válida: inteiro entre o mínimo e MAX_QTD. */
export function quantidadeValida(q, minimo = 1) {
  const min = Math.max(1, Math.floor(Number(minimo)) || 1);
  const n = Math.floor(Number(q));
  if (!Number.isFinite(n) || n < min) return min;
  return Math.min(n, MAX_QTD);
}

/**
 * Limpa uma lista de itens vinda do browser/localStorage: tipos e slugs
 * válidos, quantidades inteiras ≥ mínimo, linhas repetidas somadas, no máximo
 * MAX_ITENS linhas. Os campos de apresentação passam só se forem do tipo certo.
 */
export function normalizarItens(lista) {
  if (!Array.isArray(lista)) return [];
  const porChave = new Map();
  for (const x of lista) {
    if (!x || typeof x !== "object") continue;
    if (!TIPOS_ITEM.includes(x.tipo) || typeof x.slug !== "string" || !SLUG.test(x.slug)) continue;
    const plano = typeof x.plano === "string" && ID_PLANO.test(x.plano) ? x.plano : undefined;
    const minimo = Math.max(1, Math.floor(Number(x.minimo)) || 1);
    const item = {
      tipo: x.tipo,
      slug: x.slug,
      ...(plano ? { plano } : {}),
      quantidade: quantidadeValida(x.quantidade, minimo),
      nome: typeof x.nome === "string" ? x.nome.slice(0, 200) : x.slug,
      imagem: typeof x.imagem === "string" ? x.imagem : "",
      precoTipo: x.precoTipo === "valor" ? "valor" : "consulta",
      preco: Number.isFinite(Number(x.preco)) && Number(x.preco) > 0 ? Number(x.preco) : null,
      unidade: typeof x.unidade === "string" ? x.unidade.slice(0, 80) : "",
      minimo,
      ...(typeof x.href === "string" && x.href.startsWith("/") ? { href: x.href } : {}),
    };
    const k = chaveItem(item);
    const antes = porChave.get(k);
    if (antes) antes.quantidade = quantidadeValida(antes.quantidade + item.quantidade, antes.minimo);
    else if (porChave.size < MAX_ITENS) porChave.set(k, item);
  }
  return [...porChave.values()];
}

/** Acrescenta (ou soma) um item ao pedido. Devolve a lista nova. */
export function juntarItem(lista, item) {
  return normalizarItens([...(lista || []), item]);
}

/** Muda a quantidade de uma linha (0 ou menos = mantém o mínimo). */
export function mudarQuantidade(lista, chave, q) {
  return (lista || []).map((i) => (chaveItem(i) === chave ? { ...i, quantidade: quantidadeValida(q, i.minimo) } : i));
}

export const removerItem = (lista, chave) => (lista || []).filter((i) => chaveItem(i) !== chave);

/**
 * Totais do pedido: subtotal das linhas com preço, quantas linhas são "sob
 * consulta" (sem preço — o total é então indicativo) e o número de unidades.
 */
export function totaisPedido(lista) {
  let subtotal = 0;
  let semPreco = 0;
  let unidades = 0;
  const linhas = (lista || []).map((i) => {
    const comPreco = i.precoTipo === "valor" && Number(i.preco) > 0;
    const total = comPreco ? Math.round(Number(i.preco) * i.quantidade * 100) / 100 : null;
    if (comPreco) subtotal += total;
    else semPreco++;
    unidades += i.quantidade;
    return { ...i, total };
  });
  return {
    linhas,
    subtotal: Math.round(subtotal * 100) / 100,
    semPreco,
    unidades,
    nLinhas: linhas.length,
    totalCompleto: semPreco === 0,
  };
}

/** Tipo do pedido pelo que tem: representações, tecnologia ou misto. */
export function areaDoPedido(lista) {
  const tipos = new Set((lista || []).map((i) => i.tipo));
  if (tipos.size > 1) return "misto";
  return tipos.has("solucao") ? "tecnologia" : "representacoes";
}

/** Linha de CSV (separador ";" — abre bem no Excel em português). */
export function linhaCsv(valores) {
  return valores
    .map((v) => {
      const s = v == null ? "" : String(v);
      // Fórmulas (=, +, -, @) não são executadas pelo Excel.
      const seguro = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
      return /[;"\n\r]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
    })
    .join(";");
}
