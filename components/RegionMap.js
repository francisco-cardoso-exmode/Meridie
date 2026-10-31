"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { useT } from "@/components/LangProvider";
import { CORES_PONTO, temMapa } from "@/lib/mapa";

// As cores vivem em lib/mapa.js (a página de servidor também as usa na legenda).
export { CORES_PONTO };

// Default estável (um [] novo em cada render recriava o mapa).
const SEM_PONTOS = [];

const escapaHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export default function RegionMap({ mapa, pontos = SEM_PONTOS, nome }) {
  const { t, tf } = useT();
  const elRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    if (!temMapa(mapa)) return;
    let cancelado = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelado || !elRef.current || mapRef.current) return;

      const map = L.map(elRef.current, {
        scrollWheelZoom: false,
        attributionControl: true,
      }).setView([mapa.lat, mapa.lng], mapa.zoom || 11);
      mapRef.current = map;

      // Tiles do OpenStreetMap: não exigem chave de API (os da CARTO passaram a
      // exigir e mostravam "API KEY REQUIRED" em vez do mapa).
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      (pontos || []).forEach((p) => {
        if (typeof p?.lat !== "number" || typeof p?.lng !== "number") return;
        const cor = CORES_PONTO[p.tipo] || "#1b3f6e";
        const icon = L.divIcon({
          className: "rm-pin",
          html: `<span style="--c:${cor}"></span>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -10],
        });
        L.marker([p.lat, p.lng], { icon, title: p.nome })
          .addTo(map)
          .bindPopup(`<strong>${escapaHtml(p.nome)}</strong>`);
      });
    })();

    return () => {
      cancelado = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapa, pontos]);

  // Sem coordenadas não há mapa — nem uma caixa vazia.
  if (!temMapa(mapa)) return null;

  return (
    <div
      className="region-map"
      ref={elRef}
      role="img"
      aria-label={tf("Mapa de {nome}", { nome })}
    />
  );
}
