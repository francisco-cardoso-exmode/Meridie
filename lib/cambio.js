// Câmbio EUR → BRL em tempo real.
//
// Os preços são guardados numa só moeda (EUR ou BRL) e mostrados nas duas.
// A conversão usa a cotação do momento, obtida de fontes públicas e gratuitas
// (Banco Central Europeu, via Frankfurter, com alternativas). A taxa fica em
// cache curta (ver TTL) para não se chamar a API a cada preço mostrado.
//
// Se nenhuma fonte responder, usa-se a última taxa conhecida e, em último
// caso, o valor de recurso abaixo — o site nunca fica sem mostrar o preço.

export const TAXA_EUR_BRL_FALLBACK = 6.2;

// Validade da cotação, em segundos (a seguir vai-se buscar uma nova).
export const CAMBIO_TTL = 900; // 15 minutos

// Se as fontes falharem, só se volta a tentar passado este tempo.
const ESPERA_APOS_FALHA = 60 * 1000; // 1 minuto

const FONTES = [
  {
    url: "https://api.frankfurter.dev/v1/latest?base=EUR&symbols=BRL",
    ler: (j) => j?.rates?.BRL,
  },
  {
    url: "https://open.er-api.com/v6/latest/EUR",
    ler: (j) => j?.rates?.BRL,
  },
  {
    url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json",
    ler: (j) => j?.eur?.brl,
  },
];

// Defesa contra respostas estranhas (0, null, texto, valores absurdos).
const valida = (t) => Number.isFinite(t) && t > 1 && t < 50;

let cache = { taxa: TAXA_EUR_BRL_FALLBACK, atualizadoEm: 0, aoVivo: false };
let pendente = null; // pedido a decorrer (evita chamadas em paralelo)
let proximaTentativa = 0;

async function buscar() {
  for (const fonte of FONTES) {
    try {
      const r = await fetch(fonte.url, {
        // Cache do Next (no servidor); no browser este módulo só usa a taxa
        // que já vem do servidor / de /api/cambio.
        next: { revalidate: CAMBIO_TTL },
        signal: AbortSignal.timeout(4000),
      });
      if (!r.ok) continue;
      const taxa = Number(fonte.ler(await r.json()));
      if (valida(taxa)) return taxa;
    } catch {
      /* fonte em baixo — tenta a seguinte */
    }
  }
  return null;
}

// Cotação atual: { taxa, atualizadoEm (ms), aoVivo }.
// `aoVivo` é false enquanto se estiver a usar a taxa de recurso.
export async function getCambio() {
  const agora = Date.now();
  const fresca = cache.aoVivo && agora - cache.atualizadoEm < CAMBIO_TTL * 1000;
  if (fresca || agora < proximaTentativa) return cache;

  if (!pendente) {
    pendente = buscar().finally(() => {
      pendente = null;
    });
  }
  const taxa = await pendente;

  if (taxa) cache = { taxa, atualizadoEm: Date.now(), aoVivo: true };
  else proximaTentativa = Date.now() + ESPERA_APOS_FALHA;

  return cache;
}

export async function getTaxaEurBrl() {
  return (await getCambio()).taxa;
}

// Texto explicativo da conversão (usado no tooltip dos preços).
export function etiquetaCambio(taxa, lang = "pt") {
  const t = Number(taxa) || TAXA_EUR_BRL_FALLBACK;
  const prefixo = lang === "en" ? "Approximate conversion at the current rate" : "Conversão aproximada ao câmbio atual";
  return `${prefixo}: 1 € = ${t.toLocaleString(lang === "en" ? "en-GB" : "pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} R$`;
}
