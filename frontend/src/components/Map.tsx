import { useEffect, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";

export default function Map() {
  const [bairros, setBairros] = useState(null);
  const [loadMap, setLoadMap] = useState(true);

  useEffect(() => {
    const carregarMapaFortaleza = async () => {
      try {
        const response = await fetch("/data/fullmapfortaleza.geojson");
        if (!response.ok) throw new Error("Erro ao carregar os Dados");

        const data = await response.json();

        setBairros(data);
        console.log("Dados Carregado:", data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadMap(false);
      }
    };

    carregarMapaFortaleza();
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
    <>
      <MapContainer
        center={[-3.7734, -38.5267]}
        style={{ height: "100%", width: "100%" }}
        zoom={12}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
      </MapContainer>
    </>
  );
}
