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

// Redes sociais (footer) — editáveis no backoffice.
export async function getRedes() {
  try {
    const db = await getDb();
    const c = await db.collection("config").findOne({ _id: "redes" });
    return { instagram: c?.instagram || "", linkedin: c?.linkedin || "" };
  } catch {
    return { instagram: "", linkedin: "" };
  }
}

export async function setRedes({ instagram = "", linkedin = "" }) {
  const db = await getDb();
  await db
    .collection("config")
    .updateOne({ _id: "redes" }, { $set: { instagram, linkedin } }, { upsert: true });
}

// Dados da empresa (páginas legais + footer) — editáveis no backoffice.
const EMPRESA_VAZIA = {
  denominacao: "",
  nif: "",
  morada: "",
  email: "",
  telefone: "",
  locais: "",
};

export async function getEmpresa() {
  try {
    const db = await getDb();
    const c = await db.collection("config").findOne({ _id: "empresa" });
    const { _id, ...resto } = c || {};
    return { ...EMPRESA_VAZIA, ...resto };
  } catch {
    return { ...EMPRESA_VAZIA };
  }
}

export async function setEmpresa(d = {}) {
  const db = await getDb();
  const doc = {};
  for (const k of Object.keys(EMPRESA_VAZIA)) doc[k] = String(d[k] || "").trim();
  await db
    .collection("config")
    .updateOne({ _id: "empresa" }, { $set: doc }, { upsert: true });
}
