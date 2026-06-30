import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
type Camadas = {
  bairros: boolean;
  paradas: boolean;
  heatmap: boolean;
};

type Props = {
  camadas: Camadas;
  onToggle: (camada: keyof Camadas) => void;
  bairros: GeoJSON.FeatureCollection | null;
};

function BairroDestaque({ feature }: { feature: GeoJSON.Feature | null }) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (!feature) return;

    const layer = L.geoJSON(feature, {
      style: {
        color: "#f59e0b",
        weight: 3.5,
        fillColor: "#f59e0b",
        fillOpacity: 0.2,
        opacity: 1,
      },
    });

    layer.addTo(map);
    map.fitBounds(layer.getBounds(), { padding: [50, 50] });

    layerRef.current = layer;

    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [feature, map]);

  return null;
}

export default function PainelFiltros({ camadas, onToggle, bairros }: Props) {
  const [open, setOpen] = useState(false);
  const [featureSelecionada, setFeatureSelecionada] =
    useState<GeoJSON.Feature | null>(null);

  const painelRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!painelRef.current) return;
    L.DomEvent.disableClickPropagation(painelRef.current);
    L.DomEvent.disableScrollPropagation(painelRef.current);
  });

  const nomesBairros =
    bairros?.features
      .map((f) => f.properties?.name as string)
      .filter(Boolean)
      .sort() ?? [];

  const handleBairro = (nome: string) => {
    if (!nome) {
      setFeatureSelecionada(null);
      return;
    }
    const feature =
      bairros?.features.find((f) => f.properties?.name === nome) ?? null;
    setFeatureSelecionada(feature);
  };

  return (
    <>
  
      <div className="absolute top-4 right-4 z-1000 flex flex-col items-end">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-2xl shadow-lg transition-all active:scale-95"
        >
          <span className="text-lg">☰</span>
          <span>Filtros</span>
        </button>

    
        <AnimatePresence>
          {open && (
            <motion.div
              ref={painelRef}
            
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-3 w-72 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-amber-200 overflow-hidden"
            >
              <div className="px-4 py-3 bg-linear-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
                <p className="font-semibold text-slate-700">Filtros</p>
                <button
                  onClick={() => setOpen(false)}
                  className="text-slate-400 hover:text-red-500 text-2xl leading-none transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-6">
         
                <div className="space-y-3">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                    Camadas
                  </p>
                  {(["paradas", "heatmap"] as const).map((c) => (
                    <label
                      key={c}
                      className="flex items-center gap-3 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={camadas[c]}
                        onChange={() => onToggle(c)}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <span className="text-sm text-slate-700 capitalize">
                        {c}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Ir para bairro */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                    Ir para bairro
                  </p>
                  <select
                    onChange={(e) => handleBairro(e.target.value)}
                    className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  >
                    <option value="">Selecione um bairro...</option>
                    {nomesBairros.map((nome) => (
                      <option key={nome} value={nome}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BairroDestaque feature={featureSelecionada} />
    </>
  );
}