import { SITE_URL } from "@/lib/site";
import { allEmpreendimentos, allRegioes } from "@/lib/store";
import { allMarcas } from "@/lib/marcas";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";

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
  ].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: agora,
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  let empreendimentos = [];
  let regioes = [];
  let marcas = [];
  try {
    const [emps, regs] = await Promise.all([allEmpreendimentos(), allRegioes()]);
    empreendimentos = emps.map((e) => ({
      url: `${SITE_URL}/empreendimentos/${e.slug}`,
      lastModified: agora,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    regioes = regs.map((r) => ({
      url: `${SITE_URL}/regioes/${r.slug}`,
      lastModified: agora,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    marcas = (await allMarcas()).map((m) => ({
      url: `${SITE_URL}/marcas/${m.slug}`,
      lastModified: agora,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // Sem DB no build — só as páginas estáticas.
  }

  return [...estaticas, ...empreendimentos, ...regioes, ...marcas];
}
