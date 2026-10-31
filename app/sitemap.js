import { allEmpreendimentos, allRegioes } from "@/lib/store";
import { allMarcas } from "@/lib/marcas";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { urlPublica } from "@/lib/seo";

// Data da última alteração de um documento (se existir e for válida). Sem
// data, o campo é omitido — melhor do que dizer "mudou agora" em cada pedido.
function dataDe(doc) {
  const v = doc?.atualizadoEm || doc?.updatedAt;
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

// Cada página nos dois idiomas, com as alternativas hreflang (+ x-default).
// Os URLs vêm todos de urlPublica: o <loc> e o hreflang batem certo (a raiz
// com "/" no fim, o resto sem).
const duas = (p, { lastModified, ...extra } = {}) => {
  const languages = {
    "pt-PT": urlPublica("pt", p),
    en: urlPublica("en", p),
    "x-default": urlPublica("pt", p),
  };
  return ["pt", "en"].map((lang) => ({
    url: urlPublica(lang, p),
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages },
    ...extra,
  }));
};

export const revalidate = 3600;

export default async function sitemap() {
  // O /comparar fica de fora (noindex — combinações infinitas de ?a=&b=).
  const estaticas = [
    "/",
    "/portugal",
    "/brasil",
    "/empreendimentos",
    "/marcas",
    ...(TECNOLOGIA_VISIVEL ? ["/tecnologia"] : []),
    "/como-funciona",
    "/quem-somos",
    "/parcerias",
    "/publicidade",
    "/faq",
    "/contactos",
    "/privacidade",
    "/cookies",
    "/termos",
  ].flatMap((p) =>
    duas(p, {
      changeFrequency: p === "/" ? "daily" : "weekly",
      priority: p === "/" ? 1 : 0.7,
    })
  );

  let empreendimentos = [];
  let regioes = [];
  let marcas = [];
  try {
    const [emps, regs] = await Promise.all([allEmpreendimentos(), allRegioes()]);
    empreendimentos = emps
      .filter((e) => e.publicado !== false)
      .flatMap((e) =>
        duas(`/empreendimentos/${e.slug}`, { lastModified: dataDe(e), changeFrequency: "weekly", priority: 0.8 })
      );
    regioes = regs.flatMap((r) =>
      duas(`/regioes/${r.slug}`, { lastModified: dataDe(r), changeFrequency: "weekly", priority: 0.6 })
    );
    marcas = (await allMarcas())
      .filter((m) => m.ativo !== false)
      .flatMap((m) =>
        duas(`/marcas/${m.slug}`, { lastModified: dataDe(m), changeFrequency: "monthly", priority: 0.6 })
      );
  } catch {
    // Sem DB no build — só as páginas estáticas.
  }

  return [...estaticas, ...empreendimentos, ...regioes, ...marcas];
}
