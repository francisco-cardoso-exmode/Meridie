import { SITE_URL } from "@/lib/site";
import { allEmpreendimentos, allRegioes } from "@/lib/store";
import { allMarcas } from "@/lib/marcas";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { caminho } from "@/lib/i18n";

// Cada página nos dois idiomas, com as alternativas hreflang.
const duas = (p, extra) =>
  ["pt", "en"].map((lang) => ({
    url: `${SITE_URL}${caminho(lang, p || "/")}`.replace(/\/$/, "") || SITE_URL,
    alternates: {
      languages: {
        "pt-PT": `${SITE_URL}${caminho("pt", p || "/")}`,
        en: `${SITE_URL}${caminho("en", p || "/")}`,
      },
    },
    ...extra,
  }));

export const revalidate = 3600;

export default async function sitemap() {
  const agora = new Date();

  const estaticas = [
    "",
    "/portugal",
    "/brasil",
    "/empreendimentos",
    "/marcas",
    ...(TECNOLOGIA_VISIVEL ? ["/tecnologia"] : []),
    "/comparar",
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
      lastModified: agora,
      changeFrequency: p === "" ? "daily" : "weekly",
      priority: p === "" ? 1 : 0.7,
    })
  );

  let empreendimentos = [];
  let regioes = [];
  let marcas = [];
  try {
    const [emps, regs] = await Promise.all([allEmpreendimentos(), allRegioes()]);
    empreendimentos = emps.flatMap((e) =>
      duas(`/empreendimentos/${e.slug}`, { lastModified: agora, changeFrequency: "weekly", priority: 0.8 })
    );
    regioes = regs.flatMap((r) =>
      duas(`/regioes/${r.slug}`, { lastModified: agora, changeFrequency: "weekly", priority: 0.6 })
    );
    marcas = (await allMarcas()).flatMap((m) =>
      duas(`/marcas/${m.slug}`, { lastModified: agora, changeFrequency: "monthly", priority: 0.6 })
    );
  } catch {
    // Sem DB no build — só as páginas estáticas.
  }

  return [...estaticas, ...empreendimentos, ...regioes, ...marcas];
}
