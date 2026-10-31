import { tratarUploadAl } from "@/lib/al/upload";
import { reservaPorToken } from "@/lib/al/reservas";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Fotos de um problema reportado pelo hóspede: o token do link da estadia vem
// no clientPayload (o hóspede não tem conta). Limite de 30 fotos/hora por IP.
export async function POST(request) {
  const ip = ipDe(request);
  return tratarUploadAl(request, async (payload) => {
    if (!(await dentroDoLimite(`al-estadia-upload:${ip}`, 30, 60 * 60))) return false;
    let token = "";
    try {
      token = JSON.parse(payload || "{}").token || "";
    } catch {
      return false;
    }
    return !!(await reservaPorToken(token));
  });
}
