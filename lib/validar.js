import { achata, desachata, extrair } from "@/lib/traducaoCampos";
import { normalizaTipologias } from "@/lib/tipologias";

/**
 * Validação do que o backoffice grava: só os campos conhecidos de cada
 * coleção (nada de _id, en/enFonte ou chaves inventadas no corpo do pedido).
 */

export const CAMPOS = {
  empreendimentos: [
    "slug", "nome", "pais", "cidade", "zona", "tipo", "finalidade", "preco", "precoMax", "moeda",
    "precoTipo", "quartos", "casasBanho", "area", "estado", "destaque", "publicado", "resumo",
    "descricao", "caracteristicas", "imagens", "referencia", "construtora", "morada", "video",
    "siteUrl", "links", "tipologias", "proximidades",
  ],
  regioes: [
    "slug", "nome", "pais", "parent", "nivel", "publicidade", "imagem", "tagline", "descricao",
    "sobre", "crescimento", "conhecidaPor", "oQueVer", "transportes", "distancias", "cidades",
    "zonas", "vantagens", "destaques", "mapa", "pontos", "destaqueHome", "ordemHome", "bannerHome",
  ],
  marcas: [
    "slug", "nome", "area", "origem", "texto", "url", "logo", "imagens", "produtos", "ordem",
    "mostrarHome", "ativo",
  ],
  anuncios: [
    "slug", "titulo", "texto", "url", "imagem", "categoria", "cidade", "vantagem", "principal",
    "mostrarHome", "ativo",
  ],
};

// Listas editáveis item a item: cada item tem um id estável (para a tradução
// acompanhar o item quando se reordena ou apaga).
const LISTAS = {
  marcas: { produtos: ["id", "nome", "descricao", "imagem", "caracteristicas"] },
  regioes: { publicidade: ["id", "titulo", "texto", "url", "imagem"] },
};

// Campos da Home nas regiões: sim/não e um número (vazio = sem ordem).
const BOOLEANOS = { regioes: ["destaqueHome", "bannerHome"] };
const NUMEROS = { regioes: ["ordemHome"] };

export const objetoSimples = (v) =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;

const escolhe = (obj, chaves) =>
  Object.fromEntries(chaves.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

/** Só os campos conhecidos da coleção (o resto do corpo é ignorado). */
export function limpaDoc(colecao, corpo) {
  if (!objetoSimples(corpo)) return null;
  const doc = escolhe(corpo, CAMPOS[colecao] || []);
  for (const [campo, chaves] of Object.entries(LISTAS[colecao] || {})) {
    if (!(campo in doc)) continue;
    doc[campo] = Array.isArray(doc[campo])
      ? doc[campo].filter(objetoSimples).map((x) => escolhe(x, chaves))
      : [];
  }
  if (colecao === "empreendimentos" && "tipologias" in doc) doc.tipologias = normalizaTipologias(doc.tipologias);
  for (const k of BOOLEANOS[colecao] || []) if (k in doc) doc[k] = doc[k] === true;
  for (const k of NUMEROS[colecao] || []) {
    if (!(k in doc)) continue;
    const n = doc[k] === "" || doc[k] == null ? NaN : Number(doc[k]);
    doc[k] = Number.isFinite(n) ? n : null;
  }
  return doc;
}

export const textoPreenchido = (v) => typeof v === "string" && v.trim() !== "";

// Erro de chave duplicada do Mongo (índice único — ver scripts/criar-indices.mjs).
export const eDuplicado = (e) => e?.code === 11000;

// Reordena a lista `campo` de um objeto en/enFonte segundo `idx` (índices antigos).
function reordena(obj, campo, idx) {
  if (!obj || !Array.isArray(obj[campo])) return obj;
  return { ...obj, [campo]: idx.map((j) => (j == null ? {} : obj[campo][j] ?? {})) };
}

/**
 * Prepara a versão inglesa a gravar numa edição.
 * - `antes`: o documento como está na base (com en/enFonte);
 * - `doc`: o que vai ser gravado;
 * - `enEditado`: só as correções inglesas feitas à mão nesta edição, em chaves
 *   planas ("produtos.0.nome") relativas ao documento GUARDADO.
 * Junta as correções ao inglês ATUAL da base (não ao que o formulário carregou,
 * que pode já estar desatualizado pela tradução automática) e, nas listas com
 * id, leva as traduções atrás de cada item.
 * Devolve { set, enAntes }: `set` são os campos en/enFonte a gravar (se houver)
 * e `enAntes` o inglês anterior, já realinhado, para a tradução em fundo.
 */
export function prepararEn(colecao, antes, doc, enEditado) {
  let en = antes?.en || null;
  let enFonte = antes?.enFonte || null;
  let enAntes = en;
  const set = {};

  if (objetoSimples(enEditado) && antes) {
    const validos = achata(extrair(colecao, antes));
    const edicoes = Object.entries(enEditado).filter(
      ([k, v]) => k in validos && typeof v === "string"
    );
    if (edicoes.length) {
      en = desachata({ ...achata(en || {}), ...Object.fromEntries(edicoes) });
      set.en = en;
    }
  }

  for (const campo of Object.keys(LISTAS[colecao] || {})) {
    if (!Array.isArray(doc[campo]) || !Array.isArray(antes?.[campo])) continue;
    const posAntes = new Map(antes[campo].map((x, i) => [x?.id || `i${i}`, i]));
    const idx = doc[campo].map((x) => (posAntes.has(x.id) ? posAntes.get(x.id) : null));
    const mudou = idx.length !== antes[campo].length || idx.some((j, i) => j !== i);
    if (!mudou) continue;
    en = reordena(en, campo, idx);
    enFonte = reordena(enFonte, campo, idx);
    enAntes = reordena(enAntes, campo, idx);
    if (en) set.en = en;
    if (enFonte) set.enFonte = enFonte;
  }
  return { set, enAntes: enAntes ?? null };
}
