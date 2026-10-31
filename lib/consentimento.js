// Consentimento de cookies (RGPD) — só para o browser.
// A escolha fica em localStorage ("accept" | "reject"); qualquer mudança é
// anunciada com o evento "meridie-consent" (ouvido pelo banner e pelo GA).

export const CHAVE_CONSENTIMENTO = "meridie_consent";
export const EVENTO_CONSENTIMENTO = "meridie-consent";

// Consent Mode v2: tudo "denied" por defeito. Vai inline no <body> (layout),
// antes de o gtag.js poder carregar.
export const CONSENT_PADRAO = `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});`;

export function lerConsentimento() {
  try {
    return localStorage.getItem(CHAVE_CONSENTIMENTO);
  } catch {
    return null;
  }
}

export function guardarConsentimento(valor) {
  try {
    if (valor) localStorage.setItem(CHAVE_CONSENTIMENTO, valor);
    else localStorage.removeItem(CHAVE_CONSENTIMENTO);
  } catch {}
  window.dispatchEvent(new Event(EVENTO_CONSENTIMENTO));
}

/** "Gerir cookies": esquece a escolha e volta a mostrar o aviso. */
export const reabrirConsentimento = () => guardarConsentimento(null);

/**
 * Retira o consentimento de análise: avisa o Google Analytics (Consent Mode)
 * e apaga os cookies _ga* / _gid / _gat* no domínio atual e nos domínios-pai
 * (o GA costuma gravá-los em ".dominio.pt").
 */
export function revogarAnalytics(gaId) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
  if (gaId) window[`ga-disable-${gaId}`] = true;

  const nomes = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => /^_ga/.test(n) || n === "_gid" || /^_gat/.test(n));
  if (!nomes.length) return;
  const partes = window.location.hostname.split(".");
  const dominios = [""];
  for (let i = 0; i < partes.length - 1; i++) dominios.push(`.${partes.slice(i).join(".")}`);
  for (const n of nomes) {
    for (const d of dominios) {
      document.cookie = `${n}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}
