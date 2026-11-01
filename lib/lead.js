/**
 * Estados das leads (mensagens do formulário de contacto) — regras puras.
 * As leads novas gravam `estado: "nova"`. As antigas, de antes de haver estado,
 * contam como "nova" se tiverem até 30 dias e como "arquivada" depois disso.
 */
export const ESTADOS_LEAD = {
  nova: "Nova",
  em_contacto: "Em contacto",
  negociacao: "Em negociação",
  cliente: "Cliente",
  sem_interesse: "Sem interesse",
  arquivada: "Arquivada",
};

const LEGADO_NOVA_MS = 30 * 24 * 3600 * 1000;

export function estadoLead(l, agora = Date.now()) {
  if (l?.estado && Object.hasOwn(ESTADOS_LEAD, l.estado)) return l.estado;
  const t = l?.criadoEm ? new Date(l.criadoEm).getTime() : 0;
  return agora - t <= LEGADO_NOVA_MS ? "nova" : "arquivada";
}

// O mesmo critério de "nova", como filtro do Mongo (para contar sem ler tudo).
export function filtroLeadsNovas(agora = Date.now()) {
  return {
    $or: [{ estado: "nova" }, { estado: { $exists: false }, criadoEm: { $gte: new Date(agora - LEGADO_NOVA_MS) } }],
  };
}
