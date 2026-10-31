import { getDb } from "@/lib/mongodb";
import { CONFIG_PADRAO } from "@/lib/al/regras";

// Definições do Alojamento Local (coleção "config", _id "alojamento"):
// comissão das OTA por origem e % de cada plano. Sem base → valores por defeito.

const pct = (v, def) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? Math.round(n * 100) / 100 : def;
};

export async function getConfigAl({ estrito = false } = {}) {
  try {
    const c = await (await getDb()).collection("config").findOne({ _id: "alojamento" });
    return {
      comissaoOta: { ...CONFIG_PADRAO.comissaoOta, ...(c?.comissaoOta || {}) },
      planos: { ...CONFIG_PADRAO.planos, ...(c?.planos || {}) },
    };
  } catch (e) {
    if (estrito) throw e;
    return structuredClone(CONFIG_PADRAO);
  }
}

export async function setConfigAl(d = {}) {
  const P = CONFIG_PADRAO;
  const doc = {
    comissaoOta: {
      airbnb: pct(d?.comissaoOta?.airbnb, P.comissaoOta.airbnb),
      booking: pct(d?.comissaoOta?.booking, P.comissaoOta.booking),
    },
    planos: {
      anuncio: pct(d?.planos?.anuncio, P.planos.anuncio),
      gestao: pct(d?.planos?.gestao, P.planos.gestao),
      reduzida: pct(d?.planos?.reduzida, P.planos.reduzida),
    },
  };
  await (await getDb()).collection("config").updateOne({ _id: "alojamento" }, { $set: doc }, { upsert: true });
  return doc;
}
