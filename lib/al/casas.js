import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import { slugify } from "@/lib/slug";
import { faltaParaPublicar } from "@/lib/al/validacao";
import { noitesOcupadas, ESTADOS_OCUPAM, hojeLisboa, somaDias, ESTADOS_CASA, paisValido, moedaDe, PAIS_PADRAO } from "@/lib/al/regras";

/**
 * Casas do Alojamento Local (coleção "al_casas").
 * Campos privados — nunca saem nas leituras públicas: morada, checkinInfo,
 * proprietarioId, comissaoReduzida, en/enFonte; as coordenadas públicas são
 * arredondadas (~100 m) para não revelar a porta.
 */

const hasDb = () => !!process.env.MONGODB_URI;
export const colCasas = async () => (await getDb()).collection("al_casas");

const PRIVADOS = { _id: 0, morada: 0, checkinInfo: 0, proprietarioId: 0, comissaoReduzida: 0, notasAdmin: 0 };

function publica(c) {
  if (!c) return c;
  const r = { ...c };
  if (r.coordenadas)
    r.coordenadas = { lat: Math.round(r.coordenadas.lat * 1000) / 1000, lng: Math.round(r.coordenadas.lng * 1000) / 1000 };
  return r;
}

// ───────── Público ─────────

/**
 * Casas publicadas, com filtros opcionais: país ("PT" | "BR"), cidade (texto exato, sem
 * maiúsculas/acentos), hospedes (capacidade mínima) e datas (livres nesse
 * intervalo). Sem base de dados → lista vazia (o site nunca rebenta).
 */
export async function casasPublicadas({ pais, cidade, hospedes, entrada, saida } = {}) {
  if (!hasDb()) return [];
  try {
    const filtro = { estado: "publicada" };
    // Casas antigas sem país contam como Portugal.
    if (paisValido(pais)) filtro.pais = pais === "PT" ? { $in: ["PT", null] } : pais;
    const h = Number(hospedes);
    if (Number.isFinite(h) && h > 0) filtro.capacidade = { $gte: h };
    let lista = await (await colCasas()).find(filtro, { projection: PRIVADOS }).sort({ atualizadoEm: -1 }).limit(300).toArray();
    if (cidade) {
      const n = slugify(cidade);
      lista = lista.filter((c) => slugify(c.cidade) === n);
    }
    if (entrada && saida && entrada < saida) {
      const ocupadas = await (await getDb())
        .collection("al_reservas")
        .find(
          { casaSlug: { $in: lista.map((c) => c.slug) }, estado: { $in: ESTADOS_OCUPAM }, entrada: { $lt: saida }, saida: { $gt: entrada } },
          { projection: { casaSlug: 1 } }
        )
        .toArray();
      const fora = new Set(ocupadas.map((r) => r.casaSlug));
      lista = lista.filter((c) => !fora.has(c.slug));
    }
    return lista.map(publica);
  } catch (e) {
    console.error("casas publicadas:", e?.message || e);
    return [];
  }
}

/** Cidades com casas publicadas, por país: [{ pais, cidade }]. */
/** Há pelo menos uma casa publicada? (menu do site; sem base → false). */
export async function haCasasPublicadas() {
  if (!hasDb()) return false;
  try {
    return !!(await (await colCasas()).findOne({ estado: "publicada" }, { projection: { _id: 1 } }));
  } catch {
    return false;
  }
}

export async function cidadesComCasas() {
  if (!hasDb()) return [];
  try {
    const l = await (await colCasas())
      .aggregate([{ $match: { estado: "publicada" } }, { $group: { _id: { pais: "$pais", cidade: "$cidade" } } }])
      .toArray();
    return l
      .map((x) => ({ pais: x._id.pais || PAIS_PADRAO, cidade: x._id.cidade }))
      .filter((x) => x.cidade)
      .sort((a, b) => a.pais.localeCompare(b.pais) || a.cidade.localeCompare(b.cidade, "pt"));
  } catch {
    return [];
  }
}

/** Casa publicada (sem campos privados) + noites ocupadas nos próximos 12 meses. */
export async function casaPublica(slug) {
  if (!hasDb() || typeof slug !== "string" || slug.length > 120) return null;
  try {
    const c = await (await colCasas()).findOne({ slug, estado: "publicada" }, { projection: PRIVADOS });
    if (!c) return null;
    const hoje = hojeLisboa();
    const ate = somaDias(hoje, 366);
    const reservas = await (await getDb())
      .collection("al_reservas")
      .find({ casaSlug: slug, estado: { $in: ESTADOS_OCUPAM }, saida: { $gt: hoje }, entrada: { $lt: ate } }, { projection: { entrada: 1, saida: 1, estado: 1 } })
      .toArray();
    return { casa: publica(c), ocupadas: noitesOcupadas(reservas, { desde: hoje, ate }) };
  } catch (e) {
    console.error("casa pública:", e?.message || e);
    return null;
  }
}

// ───────── Proprietário / backoffice ─────────

export async function casasDoProprietario(proprietarioId) {
  return (await colCasas()).find({ proprietarioId }, { projection: { _id: 0, en: 0, enFonte: 0 } }).sort({ criadoEm: -1 }).toArray();
}

export async function casaPorSlug(slug) {
  if (typeof slug !== "string") return null;
  return (await colCasas()).findOne({ slug }, { projection: { _id: 0 } });
}

/** A casa, só se pertencer a este proprietário. */
export async function casaDoProprietario(slug, proprietarioId) {
  if (typeof slug !== "string") return null;
  return (await colCasas()).findOne({ slug, proprietarioId }, { projection: { _id: 0, en: 0, enFonte: 0 } });
}

export async function todasAsCasas() {
  return (await colCasas()).find({}, { projection: { _id: 0, en: 0, enFonte: 0 } }).sort({ atualizadoEm: -1 }).toArray();
}

/** Cria uma casa (estado rascunho). Slug = título + sufixo aleatório (único). */
export async function criarCasa(dados, proprietarioId) {
  const base = slugify(dados.titulo || "casa").slice(0, 60) || "casa";
  const col = await colCasas();
  for (let i = 0; i < 5; i++) {
    const slug = `${base}-${crypto.randomBytes(3).toString("hex")}`;
    try {
      const agora = new Date();
      await col.insertOne({
        divisoes: [],
        fotos: [],
        comodidades: [],
        estadiaMinima: 1,
        plano: "gestao",
        pais: PAIS_PADRAO,
        ...dados,
        moeda: moedaDe(paisValido(dados.pais) ? dados.pais : PAIS_PADRAO),
        slug,
        proprietarioId,
        estado: "rascunho",
        criadoEm: agora,
        atualizadoEm: agora,
      });
      return slug;
    } catch (e) {
      if (e?.code !== 11000) throw e;
    }
  }
  throw new Error("Não foi possível criar a casa. Tenta de novo.");
}

export async function atualizarCasa(slug, dados, filtroExtra = {}) {
  const r = await (await colCasas()).updateOne({ slug, ...filtroExtra }, { $set: { ...dados, atualizadoEm: new Date() } });
  return r.matchedCount > 0;
}

// Transições de estado permitidas (backoffice). O proprietário só envia
// para análise (rascunho → em_analise).
const TRANSICOES = {
  rascunho: ["em_analise", "aprovada"],
  em_analise: ["aprovada", "rascunho"],
  aprovada: ["publicada", "suspensa", "rascunho"],
  publicada: ["suspensa", "aprovada"],
  suspensa: ["publicada", "aprovada", "rascunho"],
};

/** Muda o estado; devolve a mensagem de erro ou null. */
export async function mudarEstadoCasa(slug, novo, { porProprietario = null } = {}) {
  if (!ESTADOS_CASA.includes(novo)) return "Estado inválido.";
  const col = await colCasas();
  const filtro = porProprietario ? { slug, proprietarioId: porProprietario } : { slug };
  const c = await col.findOne(filtro);
  if (!c) return "Casa não encontrada.";
  if (porProprietario && !(c.estado === "rascunho" && novo === "em_analise")) return "Ação não permitida.";
  if (!porProprietario && !TRANSICOES[c.estado]?.includes(novo)) return `Não é possível passar de "${c.estado}" para "${novo}".`;
  if (novo === "publicada" || novo === "em_analise") {
    const falta = faltaParaPublicar(c);
    if (falta.length) return `Falta: ${falta.join(", ")}.`;
  }
  const r = await col.updateOne({ slug, estado: c.estado }, { $set: { estado: novo, atualizadoEm: new Date(), [`estadoEm.${novo}`]: new Date() } });
  return r.matchedCount ? null : "A casa mudou entretanto — recarrega a página.";
}

/** Número de casas ativas (aprovadas/publicadas) de um proprietário — para a comissão reduzida. */
export async function nCasasAtivas(proprietarioId) {
  return (await colCasas()).countDocuments({ proprietarioId, estado: { $in: ["aprovada", "publicada"] } });
}

