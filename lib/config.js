import { getDb } from "@/lib/mongodb";

// Nas leituras, `estrito: true` (backoffice) lança o erro se a base falhar —
// para a página de Definições não mostrar valores vazios e gravá-los por cima
// dos reais. O site público fica com os valores por defeito.

// Destinatários do formulário de contacto: configuráveis no admin (coleção
// "config"). Se a lista guardada estiver vazia, vale a variável de ambiente
// CONTACT_TO (ou, sem ela, SMTP_USER).
export function destinatariosPorDefeito() {
  return (process.env.CONTACT_TO || process.env.SMTP_USER || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Lista guardada no backoffice (pode ser vazia).
export async function getDestinatariosGuardados({ estrito = false } = {}) {
  try {
    const db = await getDb();
    const c = await db.collection("config").findOne({ _id: "form" });
    return Array.isArray(c?.destinatarios) ? c.destinatarios : [];
  } catch (e) {
    if (estrito) throw e;
    return [];
  }
}

// Para onde vão mesmo as mensagens (lista guardada, ou a de defeito).
export async function getDestinatarios() {
  const guardados = await getDestinatariosGuardados();
  return guardados.length ? guardados : destinatariosPorDefeito();
}

export async function setDestinatarios(emails) {
  const db = await getDb();
  await db
    .collection("config")
    .updateOne({ _id: "form" }, { $set: { destinatarios: emails } }, { upsert: true });
}

// Redes sociais (footer) — editáveis no backoffice.
export async function getRedes({ estrito = false } = {}) {
  try {
    const db = await getDb();
    const c = await db.collection("config").findOne({ _id: "redes" });
    return { instagram: c?.instagram || "", linkedin: c?.linkedin || "" };
  } catch (e) {
    if (estrito) throw e;
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

export async function getEmpresa({ estrito = false } = {}) {
  try {
    const db = await getDb();
    const c = await db.collection("config").findOne({ _id: "empresa" });
    const { _id, ...resto } = c || {};
    return { ...EMPRESA_VAZIA, ...resto };
  } catch (e) {
    if (estrito) throw e;
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
