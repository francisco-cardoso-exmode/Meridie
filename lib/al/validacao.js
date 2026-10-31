import { fotoOtimizavel } from "@/components/fotoHosts.mjs";
import { COMODIDADES, PLANOS, TIPOLOGIAS, ESTADOS_DIVISAO, paisValido, moedaDe } from "@/lib/al/regras";

/**
 * Validação do que as apps do Alojamento Local gravam (como lib/validar.js
 * para o backoffice): só campos conhecidos, tipos e tamanhos certos.
 */

export const texto = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const inteiro = (v, min, max) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && v !== "" && v != null ? Math.min(max, Math.max(min, n)) : null;
};
const decimal = (v, min, max) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== "" && v != null ? Math.min(max, Math.max(min, Math.round(n * 100) / 100)) : null;
};

/** URL de foto aceite: https num host de imagens permitido (Vercel Blob). */
export const fotoValida = (u) => typeof u === "string" && u.startsWith("https://") && u.length < 600 && fotoOtimizavel(u);
export const listaFotos = (v, max = 40) => (Array.isArray(v) ? [...new Set(v.filter(fotoValida))].slice(0, max) : []);

const listaTextos = (v, maxItens, maxTam) =>
  Array.isArray(v) ? [...new Set(v.map((x) => texto(x, maxTam)).filter(Boolean))].slice(0, maxItens) : [];

// Campos da casa editáveis pelo proprietário (e pelo backoffice).
const CAMPOS_CASA = [
  "titulo", "descricao", "cidade", "zona", "morada", "tipologia", "quartos", "casasBanho",
  "capacidade", "precoNoite", "limpeza", "estadiaMinima", "licencaAL", "fotos", "comodidades",
  "divisoes", "regras", "checkinInfo", "coordenadas", "plano", "pais", "moeda",
  "inscricaoMunicipal", "condominioPermite",
];

/**
 * Limpa o corpo de um pedido de criação/edição de casa. Só devolve os campos
 * presentes no corpo (edição parcial). `admin: true` aceita também
 * comissaoReduzida.
 */
export function limparCasa(corpo, { admin = false } = {}) {
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) return null;
  const tem = (k) => corpo[k] !== undefined;
  const d = {};
  for (const k of ["titulo", "cidade", "zona", "licencaAL"]) if (tem(k)) d[k] = texto(corpo[k], 120);
  if (tem("morada")) d.morada = texto(corpo.morada, 300);
  if (tem("descricao")) d.descricao = texto(corpo.descricao, 6000);
  if (tem("regras")) d.regras = texto(corpo.regras, 3000);
  if (tem("checkinInfo")) d.checkinInfo = texto(corpo.checkinInfo, 4000);
  if (tem("tipologia")) d.tipologia = TIPOLOGIAS.includes(corpo.tipologia) ? corpo.tipologia : "";
  if (tem("quartos")) d.quartos = inteiro(corpo.quartos, 0, 50);
  if (tem("casasBanho")) d.casasBanho = inteiro(corpo.casasBanho, 0, 50);
  if (tem("capacidade")) d.capacidade = inteiro(corpo.capacidade, 1, 50);
  if (tem("precoNoite")) d.precoNoite = decimal(corpo.precoNoite, 0, 100000);
  if (tem("limpeza")) d.limpeza = decimal(corpo.limpeza, 0, 10000);
  if (tem("estadiaMinima")) d.estadiaMinima = inteiro(corpo.estadiaMinima, 1, 90) ?? 1;
  if (tem("fotos")) d.fotos = listaFotos(corpo.fotos);
  if (tem("comodidades"))
    d.comodidades = Array.isArray(corpo.comodidades) ? [...new Set(corpo.comodidades.filter((c) => c in COMODIDADES))] : [];
  if (tem("divisoes")) d.divisoes = listaTextos(corpo.divisoes, 30, 60);
  // País → moeda (nunca vem do corpo). Campos legais de cada país.
  if (tem("pais") && paisValido(corpo.pais)) {
    d.pais = corpo.pais;
    d.moeda = moedaDe(corpo.pais);
  }
  if (tem("inscricaoMunicipal")) d.inscricaoMunicipal = texto(corpo.inscricaoMunicipal, 60);
  if (tem("condominioPermite")) d.condominioPermite = corpo.condominioPermite === true;
  if (tem("plano")) d.plano = PLANOS.includes(corpo.plano) ? corpo.plano : "gestao";
  if (tem("coordenadas")) {
    const c = corpo.coordenadas;
    const vazio = (v) => v === "" || v == null;
    const lat = Number(c?.lat);
    const lng = Number(c?.lng);
    d.coordenadas =
      c && !vazio(c.lat) && !vazio(c.lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
  }
  if (admin && tem("comissaoReduzida")) d.comissaoReduzida = corpo.comissaoReduzida === true;
  // Ignora o resto do corpo (estado, slug, proprietário… só pelas ações próprias).
  return Object.fromEntries(Object.entries(d).filter(([k]) => CAMPOS_CASA.includes(k) || k === "comissaoReduzida"));
}

/**
 * O que falta para a casa poder ser publicada (lista vazia = pode). As regras
 * legais dependem do país:
 * - PT: n.º de Registo de Alojamento Local (RNAL) obrigatório;
 * - BR: não há licença AL; é obrigatório confirmar que o condomínio permite
 *   locação por temporada (a inscrição municipal é opcional).
 */
export function faltaParaPublicar(c) {
  const falta = [];
  const pais = c?.pais || "PT";
  if (!texto(c?.titulo)) falta.push("título");
  if (pais === "PT" && !texto(c?.licencaAL)) falta.push("n.º de registo AL");
  if (pais === "BR" && c?.condominioPermite !== true) falta.push("confirmação de que o condomínio permite locação por temporada");
  if (!(c?.precoNoite > 0)) falta.push("preço por noite");
  if (!texto(c?.cidade)) falta.push("cidade");
  if (!(c?.capacidade > 0)) falta.push("capacidade");
  if (!c?.fotos?.length) falta.push("pelo menos uma foto");
  return falta;
}

/** Relatório de uma divisão (app da equipa). */
export function limparDivisaoRelatorio(d) {
  if (!d || typeof d !== "object") return null;
  const divisao = texto(d.divisao, 60);
  if (!divisao) return null;
  return {
    divisao,
    fotos: listaFotos(d.fotos, 30),
    estado: ESTADOS_DIVISAO.includes(d.estado) ? d.estado : "ok",
    notas: texto(d.notas, 2000),
    checklist: Array.isArray(d.checklist)
      ? d.checklist
          .filter((x) => x && typeof x === "object")
          .slice(0, 20)
          .map((x) => ({ item: texto(x.item, 80), ok: x.ok === true }))
          .filter((x) => x.item)
      : [],
  };
}

export const emailValido = (e) => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
