import { redirect } from "next/navigation";
import { caminho, t } from "@/lib/i18n";
import { getProprietario, getEquipa } from "@/lib/al/auth";

/**
 * Utilitários das páginas das apps do Alojamento Local (servidor).
 * Todas as páginas privadas validam a sessão elas próprias (a navegação
 * interna do Next não volta a passar pelo layout) e não são indexadas.
 */

export const SEM_INDEX = { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } };

export const metaPrivada = (lang, titulo) => ({
  title: t(lang, titulo),
  robots: SEM_INDEX,
  alternates: {},
});

export async function exigirProprietario(lang) {
  const p = await getProprietario();
  if (!p) redirect(caminho(lang, "/proprietario/entrar"));
  return p;
}

export async function exigirEquipa() {
  const m = await getEquipa();
  if (!m) redirect("/equipa/entrar");
  return m;
}

/** Data "AAAA-MM-DD" → texto curto no idioma ("12 jul 2026"). */
export function dataCurta(iso, lang = "pt") {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "en" ? "en-GB" : "pt-PT", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
