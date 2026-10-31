import { getEquipa } from "@/lib/al/auth";
import { tratarUploadAl } from "@/lib/al/upload";

export const dynamic = "force-dynamic";

// Fotos das inspeções, tiradas no telemóvel da equipa e enviadas direto para o Blob.
export async function POST(request) {
  return tratarUploadAl(request, async () => !!(await getEquipa()));
}
