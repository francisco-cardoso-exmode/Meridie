"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Cores dos marcadores por tipo de ponto de interesse.
export const CORES_PONTO = {
  historico: "#c89b3c",
  praia: "#1f9bb0",
  montanha: "#3b8c5a",
  natureza: "#3b8c5a",
  cidade: "#1b3f6e",
  gastronomia: "#b4564b",
};

export default function RegionMap({ mapa, pontos = [], nome }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    let cancelado = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelado || !elRef.current || mapRef.current) return;

      const map = L.map(elRef.current, {
        scrollWheelZoom: false,
        attributionControl: true,
      }).setView([mapa.lat, mapa.lng], mapa.zoom);
      mapRef.current = map;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      pontos.forEach((p) => {
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
          .bindPopup(`<strong>${p.nome}</strong>`);
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

  return (
    <div
      className="region-map"
      ref={elRef}
      role="img"
      aria-label={`Mapa de ${nome}`}
    />
  );
}
