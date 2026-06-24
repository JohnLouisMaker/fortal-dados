import L from "leaflet";
import "leaflet.heat";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export type HeatPoint = [number, number, number];

type Props = {
  points: HeatPoint[];
  radius?: number;
  blur?: number;
  max?: number;
  minOpacity?: number;
  gradient?: Record<number, string>;
};

export default function HeatmapLayer({
  points,
  radius = 16,
  blur = 20,
  max = 40,
  minOpacity = 0.25,
  gradient = {
    0.3: "#3b82f6",
    0.6: "#f59e0b", 
  },
}: Props) {
  const map = useMap();

  useEffect(() => {
    const validPoints = points.filter((p) => {
      return (
        Array.isArray(p) &&
        p.length === 3 &&
        typeof p[0] === "number" &&
        typeof p[1] === "number" &&
        !isNaN(p[0]) &&
        !isNaN(p[1]) &&
        p[0] !== 0 &&
        p[1] !== 0
      );
    });

    console.log(`Heatmap → Total: ${points.length} | Válidos: ${validPoints.length}`);

    if (validPoints.length === 0) return;

    const heat = L.heatLayer(validPoints, {
      radius,
      blur,
      maxZoom: 15,
      max,
      minOpacity,
      gradient,
    });

    heat.addTo(map);

    return () => {
      if (heat && map) map.removeLayer(heat);
    };
  }, [map, points, radius, blur, max, minOpacity, gradient]);

  return null;
}