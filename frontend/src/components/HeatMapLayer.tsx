import L from "leaflet";
import "leaflet.heat";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

type HeatPoint = [number, number, number];

type Props = {
  points: HeatPoint[];
  radius?: number;
  blur?: number;
  maxZoom?: number;
  max?: number;
  minOpacity?: number;
  gradient?: Record<number, string>;
};

export default function HeatmapLayer({
  points,
  radius = 15,
  blur = 12,
  maxZoom = 16,
  max = 100,
  minOpacity = 0.35,
  gradient = {
    0.4: "#3b82f6", 
    0.65: "#f59e0b", 
    1.0: "#ef4444",
  },
}: Props) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius,
      blur,
      maxZoom,
      max,
      minOpacity,
      gradient,
    }).addTo(map);
    
    return () => {
      if (heatLayer && map) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points, radius, blur, maxZoom, max, minOpacity, gradient]);

  return null;
}
