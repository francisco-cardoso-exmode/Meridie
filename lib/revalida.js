import { revalidatePath } from "next/cache";

// Depois de uma gravação no backoffice, invalida a cache (ISR) de todas as
// páginas — as alterações aparecem logo no site, sem esperar pelo revalidate.
export function revalidaSite() {
  revalidatePath("/", "layout");
}
