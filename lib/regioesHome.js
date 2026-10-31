/**
 * Regiões na página inicial: cartões "Explorar por região" (destaqueHome,
 * ordenados por ordemHome e depois pelo nome) e o banner antes do rodapé
 * (bannerHome). Sem dependências de servidor — usado também no backoffice.
 *
 * Transição: as regiões gravadas antes destes campos existirem não os têm.
 * Para o site não mudar enquanto ninguém as editar, um campo em falta vale o
 * que estava fixo no código (estas 4 regiões, por esta ordem, e o Nordeste).
 */

const LEGADO_DESTAQUE = ["lisboa", "algarve", "sao-paulo", "rio-de-janeiro"];
const LEGADO_BANNER = "nordeste";

export const destaqueHome = (r) =>
  typeof r?.destaqueHome === "boolean" ? r.destaqueHome : LEGADO_DESTAQUE.includes(r?.slug);

export const bannerHome = (r) =>
  typeof r?.bannerHome === "boolean" ? r.bannerHome : r?.slug === LEGADO_BANNER;

export function ordemHome(r) {
  const n = r?.ordemHome;
  if (n !== "" && n != null && Number.isFinite(Number(n))) return Number(n);
  const i = LEGADO_DESTAQUE.indexOf(r?.slug);
  return i >= 0 ? i + 1 : 99;
}

const porOrdem = (a, b) =>
  ordemHome(a) - ordemHome(b) || String(a.nome || "").localeCompare(String(b.nome || ""), "pt");

/** Regiões dos cartões da Home, já ordenadas. */
export const regioesHome = (regioes) => (regioes || []).filter(destaqueHome).sort(porOrdem);

/** Região do banner antes do rodapé (a primeira pela ordem), ou null. */
export const regiaoBannerHome = (regioes) => (regioes || []).filter(bannerHome).sort(porOrdem)[0] || null;
