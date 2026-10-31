import { getDb } from "@/lib/mongodb";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";
import { allEmpreendimentos } from "@/lib/store";
import { normalizarCaminho, classeDispositivo, descodificarCidade } from "@/lib/analytics";

export const dynamic = "force-dynamic";

// Tipos de evento aceites (lista fechada para evitar lixo).
// "pagina_vista": valor = caminho da página (rota do site, sem query).
const TIPOS = new Set([
  "pagina_vista",
  "empreendimento_visto",
  "pesquisa",
  "filtro",
  "comparacao",
  "interesse",
  "lead_enviada",
  "origem",
]);

// Eventos cujo valor tem de ser um empreendimento que existe.
const COM_SLUG = new Set(["empreendimento_visto", "comparacao", "interesse", "lead_enviada"]);
// Origens do formulário que não são empreendimentos.
const ORIGENS_FIXAS = new Set(["contacto"]);

// Conjunto de slugs em memória, renovado a cada 5 minutos.
const SLUGS_TTL = 5 * 60 * 1000;
let slugsCache = { set: null, em: 0 };

async function slugsExistentes() {
  if (slugsCache.set && Date.now() - slugsCache.em < SLUGS_TTL) return slugsCache.set;
  const lista = await allEmpreendimentos({ todos: true });
  slugsCache = { set: new Set(lista.map((e) => e.slug).filter(Boolean)), em: Date.now() };
  return slugsCache.set;
}

async function valorValido(tipo, v) {
  if (!COM_SLUG.has(tipo)) return true;
  const slugs = await slugsExistentes();
  if (tipo === "comparacao") {
    const partes = v.split("|");
    return partes.length === 2 && partes.every((s) => slugs.has(s));
  }
  if (tipo === "interesse" || tipo === "lead_enviada") {
    return ORIGENS_FIXAS.has(v) || slugs.has(v);
  }
  return slugs.has(v);
}

// Hosts aceites como origem do pedido: o próprio site (e localhost em dev).
function hostsDoSite(request) {
  const hosts = new Set(["localhost", "127.0.0.1"]);
  for (const u of [process.env.NEXT_PUBLIC_SITE_URL, process.env.SITE_URL]) {
    try {
      if (u) hosts.add(new URL(u).hostname);
    } catch {}
  }
  for (const h of [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    if (h) hosts.add(h.split(":")[0]);
  }
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (host) hosts.add(host.split(":")[0]);
  return hosts;
}

function origemPermitida(request) {
  const origem = request.headers.get("origin") || request.headers.get("referer");
  if (!origem) return false;
  try {
    const host = new URL(origem).hostname;
    const hosts = hostsDoSite(request);
    // Aceita também o "www." do domínio (e vice-versa).
    return hosts.has(host) || hosts.has(host.replace(/^www\./, "")) || hosts.has(`www.${host}`);
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    if (!origemPermitida(request)) {
      return Response.json({ ok: false }, { status: 403 });
    }

    const { tipo, valor, caminho, fonte } = (await request.json()) || {};
    if (!TIPOS.has(tipo)) {
      return Response.json({ ok: false }, { status: 400 });
    }
    let v = (typeof valor === "string" || typeof valor === "number" ? String(valor) : "")
      .trim()
      .slice(0, 140);
    if (!v) return Response.json({ ok: true });

    // Página onde o evento aconteceu (caminho público sem query → interno PT).
    let pagina = normalizarCaminho(typeof caminho === "string" ? caminho : "");
    if (tipo === "pagina_vista") {
      pagina = normalizarCaminho(v);
      if (!pagina) return Response.json({ ok: false }, { status: 400 });
      v = pagina.caminho;
    }

    // Robôs (pelo User-Agent) não contam como visitas.
    const dispositivo = classeDispositivo(request.headers.get("user-agent"));
    if (!dispositivo) return Response.json({ ok: true });

    // Limite generoso por IP (o IP não é guardado nos eventos).
    if (!(await dentroDoLimite(`track:${ipDe(request)}`, 200, 10 * 60))) {
      return Response.json({ ok: false }, { status: 429 });
    }

    if (!(await valorValido(tipo, v))) {
      return Response.json({ ok: false }, { status: 400 });
    }

    // Localização aproximada dada pela Vercel a partir do IP, no momento —
    // o IP em si não é guardado (privacidade/RGPD).
    const pais = (request.headers.get("x-vercel-ip-country") || "").slice(0, 2).toUpperCase();
    const regiao = (request.headers.get("x-vercel-ip-country-region") || "").slice(0, 10);
    const cidade = descodificarCidade(request.headers.get("x-vercel-ip-city"));
    const f =
      tipo === "origem"
        ? v.slice(0, 60)
        : typeof fonte === "string"
          ? fonte.trim().slice(0, 60)
          : "";

    const evento = { tipo, valor: v, pais, criadoEm: new Date(), dispositivo };
    if (cidade) evento.cidade = cidade;
    if (regiao) evento.regiao = regiao;
    if (f) evento.fonte = f;
    if (pagina) {
      evento.caminho = pagina.caminho;
      evento.lang = pagina.lang;
    }

    const db = await getDb();
    await db.collection("eventos").insertOne(evento);
    return Response.json({ ok: true });
  } catch {
    // Silencioso — tracking nunca pode partir a navegação.
    return Response.json({ ok: false }, { status: 200 });
  }
}
