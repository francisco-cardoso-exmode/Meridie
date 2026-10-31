import { getDb } from "@/lib/mongodb";

// Limite de pedidos por chave (ex.: "contacto:<ip>") numa janela de tempo,
// guardado no MongoDB (não há Redis/KV). Devolve true se o pedido pode seguir.
// Se a base de dados falhar, deixa passar — o limite nunca pode partir o site.
let indiceCriado = false;

export async function dentroDoLimite(chave, max, janelaSeg) {
  try {
    const db = await getDb();
    const col = db.collection("rate_limits");
    if (!indiceCriado) {
      await col.createIndex({ expiraEm: 1 }, { expireAfterSeconds: 0 });
      indiceCriado = true;
    }
    const agora = new Date();
    const r = await col.findOneAndUpdate(
      { _id: chave, expiraEm: { $gt: agora } },
      { $inc: { n: 1 } },
      { returnDocument: "after" }
    );
    if (r) return r.n <= max;
    // Janela nova (ou a anterior expirou).
    await col.updateOne(
      { _id: chave },
      { $set: { n: 1, expiraEm: new Date(agora.getTime() + janelaSeg * 1000) } },
      { upsert: true }
    );
    return true;
  } catch {
    return true;
  }
}

// IP do visitante dado pela Vercel.
export function ipDe(request) {
  const xff = request.headers.get("x-forwarded-for") || "";
  return xff.split(",")[0].trim() || request.headers.get("x-real-ip") || "desconhecido";
}
