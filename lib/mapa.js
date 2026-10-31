// Mapa das regiões — partilhado entre a página (servidor, legenda) e o
// RegionMap (client). Ficheiro pequeno de propósito: não arrasta dados.

// Cores dos marcadores por tipo de ponto de interesse.
export const CORES_PONTO = {
  historico: "#c89b3c",
  praia: "#1f9bb0",
  montanha: "#3b8c5a",
  natureza: "#3b8c5a",
  cidade: "#1b3f6e",
  gastronomia: "#b4564b",
};

// A região tem coordenadas para desenhar o mapa?
export const temMapa = (mapa) =>
  !!mapa && typeof mapa.lat === "number" && typeof mapa.lng === "number";
