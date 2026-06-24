import Papa from "papaparse";
import { useEffect, useState } from "react";
import { CircleMarker, GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import HeatmapLayer from "./HeatMapLayer";

type BusStop = {
  busstop_id: string;
  lat: number;
  lng: number;
};

type HeatPoint = [number, number, number];

export default function Map() {
  const [bairros, setBairros] = useState(null);
  const [loadMap, setLoadMap] = useState(true);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);

  useEffect(() => {
    const carregarBairros = async () => {
      try {
        const response = await fetch("/data/fullmapfortaleza.geojson");
        if (!response.ok) throw new Error("Erro ao carregar bairros");
        const data = await response.json();
        setBairros(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadMap(false);
      }
    };

    const carregarParadas = async () => {
      try {
        const res = await fetch("/data/bus_stops.csv");
        if (!res.ok) throw new Error("Erro ao carregar paradas");
        const text = await res.text();
        const result = Papa.parse<BusStop>(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });
        console.log("Amostra do CSV do Heatmap:", result.data[0]);
        setBusStops(result.data);
      } catch (error) {
        console.error(error);
      }
    };

    const carregarHeatmap = async () => {
      try {
        const res = await fetch("/data/result_heatmap.csv");
        if (!res.ok) throw new Error("Erro ao carregar heatmap");
        const text = await res.text();
        const result = Papa.parse<{
          lat: number;
          lng: number;
          quantidade_lentidao: number;
        }>(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });
        console.log("Amostra do CSV do Heatmap:", result.data[0]);
        const points: HeatPoint[] = result.data.map((row) => [
          row.lat,
          row.lng,
          row.quantidade_lentidao,
        ]);
        setHeatPoints(points);
      } catch (error) {
        console.error(error);
      }
    };

    carregarBairros();
    carregarParadas();
    carregarHeatmap();
  }, []);

  if (loadMap) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <h1 className="text-xl font-semibold text-slate-700">
            Carregando Mapa
          </h1>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[-3.7734, -38.5267]}
      style={{ height: "100%", width: "100%" }}
      zoom={12}
      scrollWheelZoom={true}
    >
      <TileLayer
        url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=A4RnZpNbXphy140t42fJ`}
        attribution=' <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
      />

      {bairros && (
        <GeoJSON
          data={bairros}
          pointToLayer={() => null}
          style={{
            color: "#2563eb",
            weight: 0.9,
            opacity: 0.6,
            fillColor: "#3b82f6",
            fillOpacity: 0.3,
          }}
        />
      )}

      {busStops.map((stop) => (
        <CircleMarker
          key={stop.busstop_id}
          center={[stop.lat, stop.lng]}
          radius={4}
          pathOptions={{ color: "#16a34a", fillColor: "#22c55e" }}
        />
      ))}

      <HeatmapLayer points={heatPoints} />
    </MapContainer>
  );
}
