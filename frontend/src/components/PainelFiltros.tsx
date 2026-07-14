import { AnimatePresence, motion } from "framer-motion";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";

type Camadas = {
  bairros: boolean;
  paradas: boolean;
  heatmap: boolean;
};

type Props = {
  camadas: Camadas;
  onToggle: (camada: keyof Camadas) => void;
  bairros: GeoJSON.FeatureCollection | null;
  bairroSelecionado: string | null;
  onSelecionarBairro: (nome: string) => void;
};

export function BairroDestaque({
  feature,
}: {
  feature: GeoJSON.Feature | null;
}) {
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
        color: "#06b6d4",
        weight: 3,
        fillColor: "#06b6d4",
        fillOpacity: 0,
        opacity: 0,
      },
    });

    layer.addTo(map);
    map.flyToBounds(layer.getBounds(), {
      padding: [50, 50],
      duration: 1.1,
      easeLinearity: 0.25,
    });

    requestAnimationFrame(() => {
      layer.eachLayer((l) => {
        const el = (l as L.Path).getElement?.();
        if (el)
          (el as SVGElement).style.transition =
            "opacity 0.5s ease, fill-opacity 0.5s ease";
      });
      layer.setStyle({ opacity: 1, fillOpacity: 0.15 });
    });

    layerRef.current = layer;

    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [feature, map]);

  return null;
}

function BairroDropdown({
  nomes,
  selecionado,
  onSelect,
}: {
  nomes: string[];
  selecionado: string | null;
  onSelect: (nome: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
      >
        <span className={selecionado ? "text-slate-800" : "text-slate-400"}>
          {selecionado ?? "Selecione um bairro..."}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-cyan-500 text-xs"
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top" }}
            className="absolute z-10 mt-2 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-2xl"
          >
            <motion.button
              type="button"
              onClick={() => {
                onSelect("");
                setOpen(false);
              }}
              whileHover={{ backgroundColor: "rgba(241, 245, 249, 0.8)" }}
              className="w-full text-left px-4 py-2.5 text-base text-slate-400 border-b border-slate-100"
            >
              Selecione um bairro...
            </motion.button>
            {nomes.map((nome, i) => (
              <motion.button
                key={nome}
                type="button"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.3), duration: 0.18 }}
                whileHover={{ backgroundColor: "rgba(224, 242, 254, 0.5)" }}
                onClick={() => {
                  onSelect(nome);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-base ${
                  nome === selecionado
                    ? "text-cyan-700 font-semibold bg-cyan-50/50"
                    : "text-slate-700"
                }`}
              >
                {nome}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PainelFiltros({
  camadas,
  onToggle,
  bairros,
  bairroSelecionado,
  onSelecionarBairro,
}: Props) {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="absolute top-6 right-6 z-1000 flex flex-col items-end font-fun">
      <motion.button
        onClick={() => setOpen(!open)}
        layout
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-150"
      >
        <motion.span
          className="text-lg inline-block text-cyan-500"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          {open ? "✕" : "☰"}
        </motion.span>
        <span>Filtros</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={painelRef}
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top right" }}
            className="mt-3 w-72 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200/60"
          >
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.2 }}
              className="px-4 py-3.5 bg-linear-to-r from-cyan-50/30 to-blue-50/30 border-b border-slate-100 rounded-t-2xl"
            >
              <p className="font-semibold text-slate-800 text-sm">
                Defina a sua filtragem
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.22 }}
              className="p-5 space-y-6"
            >
              <div className="space-y-3">
                <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
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
                      className="w-4 h-4 accent-cyan-500"
                    />
                    <span className="text-sm text-slate-700 capitalize">
                      {c}
                    </span>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
                  Ir para bairro
                </p>
                <BairroDropdown
                  nomes={nomesBairros}
                  selecionado={bairroSelecionado}
                  onSelect={onSelecionarBairro}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
