import L from "leaflet";
import "leaflet.heat";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

type HeatPoint = [number, number, number];

type Props = {
  points: HeatPoint[];
};

declare module "leaflet" {
  function heatLayer(
    latlngs: HeatPoint[],
    options?: {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      max?: number;
      gradient?: Record<number, string>;
    },
  ): L.Layer;
}

export default function HeatmapLayer({ points }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heat = L.heatLayer(points, {
      radius: 11, 
      blur: 10,
      maxZoom: 14,
      max: 50, 
      gradient: { 0.4: "#3b82f6", 0.65: "#f59e0b", 1.0: "#ef4444" },
    });

    heat.addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}
