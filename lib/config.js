import { getDb } from "@/lib/mongodb";

// Destinatários do formulário de contacto: configuráveis no admin (coleção
// "config"), com fallback para a variável de ambiente CONTACT_TO.
function fallback() {
  return (process.env.CONTACT_TO || process.env.SMTP_USER || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function getDestinatarios() {
  try {
    const db = await getDb();
    const c = await db.collection("config").findOne({ _id: "form" });
    if (c?.destinatarios?.length) return c.destinatarios;
  } catch {
    /* ignora */
  }
  return fallback();
}

export async function setDestinatarios(emails) {
  const db = await getDb();
  await db
    .collection("config")
    .updateOne({ _id: "form" }, { $set: { destinatarios: emails } }, { upsert: true });
}
