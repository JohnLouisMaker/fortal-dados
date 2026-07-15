import { AnimatePresence, motion } from "framer-motion";
import L from "leaflet";
import Papa from "papaparse";
import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import ChatBot from "./ChatBox";
import type { HeatPoint } from "./HeatMapLayer";
import HeatmapLayer from "./HeatMapLayer";
import PainelFiltros, { BairroDestaque } from "./PainelFiltros";

type BusStop = { busstop_id: string; lat: number; lng: number };
type Camadas = { bairros: boolean; paradas: boolean; heatmap: boolean };

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const FORTALEZA_BOUNDS = {
  latMin: -3.8886,
  latMax: -3.6912,
  lngMin: -38.6362,
  lngMax: -38.4015,
};

function dentroDeFortaleza(lat: number, lng: number): boolean {
  return (
    lat >= FORTALEZA_BOUNDS.latMin &&
    lat <= FORTALEZA_BOUNDS.latMax &&
    lng >= FORTALEZA_BOUNDS.lngMin &&
    lng <= FORTALEZA_BOUNDS.lngMax
  );
}

function ParadasLayer({ paradas }: { paradas: BusStop[] }) {
  const map = useMap();
  const [visible, setVisible] = useState(map.getZoom() >= 14);

  useEffect(() => {
    const onZoom = () => setVisible(map.getZoom() >= 14);
    map.on("zoomend", onZoom);
    return () => {
      map.off("zoomend", onZoom);
    };
  }, [map]);

  if (!visible) return null;

  return (
    <>
      {paradas.map((p) => (
        <CircleMarker
          key={p.busstop_id}
          center={[p.lat, p.lng]}
          radius={3}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#f59e0b",
            fillOpacity: 0.9,
            weight: 1.5,
          }}
        />
      ))}
    </>
  );
}

export default function Map() {
  const [bairros, setBairros] = useState<GeoJSON.FeatureCollection | null>(
    null,
  );
  const [loadMap, setLoadMap] = useState(true);
  const [paradas, setParadas] = useState<BusStop[]>([]);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [camadas, setCamadas] = useState<Camadas>({
    bairros: true,
    paradas: true,
    heatmap: true,
  });

  // Estado do bairro selecionado agora vive aqui, no nível mais alto,
  // para que tanto o dropdown do PainelFiltros quanto o ChatBot possam
  // disparar o mesmo destaque/flyTo no mapa.
  const [featureSelecionada, setFeatureSelecionada] =
    useState<GeoJSON.Feature | null>(null);

  const toggleCamada = (c: keyof Camadas) =>
    setCamadas((prev) => ({ ...prev, [c]: !prev[c] }));

  const selecionarBairroPorNome = (nome: string) => {
    if (!nome) {
      setFeatureSelecionada(null);
      return;
    }
    const feature =
      bairros?.features.find((f) => f.properties?.name === nome) ?? null;
    setFeatureSelecionada(feature);
  };

  const nomeBairroSelecionado = useMemo(
    () => (featureSelecionada?.properties?.name as string) ?? null,
    [featureSelecionada],
  );

  useEffect(() => {
    const carregarBairros = async () => {
      try {
        const res = await fetch("/data/fullmapfortaleza.geojson");
        if (!res.ok) throw new Error("Erro ao carregar bairros");
        setBairros(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoadMap(false);
      }
    };

    const carregarParadas = async () => {
      try {
        const res = await fetch("/data/bus_stops.csv");
        if (!res.ok) throw new Error("Erro ao carregar paradas");
        const { data } = Papa.parse<BusStop>(await res.text(), {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });
        setParadas(data.filter((p) => dentroDeFortaleza(p.lat, p.lng)));
      } catch (e) {
        console.error(e);
      }
    };

    const carregarHeatmap = async () => {
      try {
        const res = await fetch(`${API_URL}/heatmap`);
        if (!res.ok) throw new Error("Erro ao carregar heatmap");
        const payload = await res.json();

        // Garante que temos um array vindo da chave 'data' para iterar
        const responseData = Array.isArray(payload.data) ? payload.data : [];

        // Mapeia e higieniza os dados para garantir que são números válidos
        const points: HeatPoint[] = responseData
          .filter((r) => Array.isArray(r) && r.length >= 2)
          .map((r) => {
            const lat = Number(r[0]);
            const lng = Number(r[1]);
            const intensidade = r[2] !== undefined ? Number(r[2]) : 1;

            return [lat, lng, intensidade] as HeatPoint;
          })
          .filter((p) => !isNaN(p[0]) && !isNaN(p[1]));

        console.log(
          `[Heatmap] Carregado com sucesso! Total de pontos válidos: ${points.length}`,
        );
        setHeatPoints(points);
      } catch (e) {
        console.error("Erro ao processar dados do heatmap:", e);
      }
    };

    carregarBairros();
    carregarParadas();
    carregarHeatmap();
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <AnimatePresence mode="wait">
        {loadMap ? (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
              <p className="text-cyan-600 font-semibold tracking-wide">
                Carregando mapa
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <MapContainer
              center={[-3.7734, -38.5267]}
              style={{ height: "100%", width: "100%" }}
              zoom={12}
              scrollWheelZoom={true}
            >
              <TileLayer
                url={`https://api.maptiler.com/maps/dataviz/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
                attribution='&copy; <a href="https://www.maptiler.com">MapTiler</a> &copy; OpenStreetMap contributors'
              />

              {bairros && (
                <GeoJSON
                  data={bairros}
                  pointToLayer={(_, latlng) =>
                    L.circleMarker(latlng, {
                      radius: 0,
                      opacity: 0,
                      fillOpacity: 0,
                    })
                  }
                  style={{
                    color: "#94a3b8",
                    weight: 0.8,
                    opacity: 0.35,
                    fillOpacity: 0,
                  }}
                />
              )}

              {camadas.heatmap && (
                <HeatmapLayer
                  points={heatPoints}
                  radius={14}
                  blur={18}
                  max={1500}
                  minOpacity={0.15}
                  gradient={{ 0.3: "#25c450", 0.65: "#f59e0b", 1.0: "#ef4444" }}
                />
              )}

              {camadas.paradas && <ParadasLayer paradas={paradas} />}

              <BairroDestaque feature={featureSelecionada} />

              <PainelFiltros
                camadas={camadas}
                onToggle={toggleCamada}
                bairros={bairros}
                bairroSelecionado={nomeBairroSelecionado}
                onSelecionarBairro={selecionarBairroPorNome}
              />
            </MapContainer>

            <ChatBot onBairroDetected={selecionarBairroPorNome} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
