import { getProprietario } from "@/lib/al/auth";
import { tratarUploadAl } from "@/lib/al/upload";

export const dynamic = "force-dynamic";

// Fotos das casas, enviadas do browser do proprietário direto para o Blob.
export async function POST(request) {
  return tratarUploadAl(request, async () => !!(await getProprietario()));
}
