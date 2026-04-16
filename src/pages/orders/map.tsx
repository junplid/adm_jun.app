import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import { renderToString } from "react-dom/server";
import { IoStorefront } from "react-icons/io5";
import { FaMapMarkerAlt } from "react-icons/fa";

// --- TIPAGENS ---
export interface DeliveryPoint {
  name: string | null;
  status: string;
  n_order: string;
  delivery_address: string | null;
  delivery_number: string | null;
  delivery_reference_point: string | null;
  lat: number;
  lng: number;
  n_router?: string;
}

interface RouteMapProps {
  storeLocation: { lat: number; lng: number };
  points: DeliveryPoint[];
}

// --- COMPONENTE AUXILIAR DO MAPA (Ajusta o zoom para ver todos os pontos) ---
function MapFitter({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    const container = map.getContainer();
    resizeObserver.observe(container);

    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    return () => resizeObserver.disconnect();
  }, [map, bounds]);
  return null;
}

// --- ÍCONES CUSTOMIZADOS ---
// Ícone da Loja
const storeIcon = divIcon({
  html: renderToString(
    <div className="bg-gray-900 flex items-center justify-center p-1.5 h-8 w-8 rounded-full border-2 border-white shadow-lg">
      <IoStorefront size={18} color="#ffffff" />
    </div>,
  ),
  className: "custom-leaflet-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Ícone Dinâmico para os Pedidos (Muda de cor conforme a rota)
const createPointIcon = (color: string) => {
  return divIcon({
    html: renderToString(
      <div
        style={{
          color: color,
          filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.4))",
        }}
      >
        <FaMapMarkerAlt size={32} />
      </div>,
    ),
    className: "custom-leaflet-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const columns: { [x: string]: { label: string; color: string } } = {
  confirmed: {
    color: "#0ea4e9",
    label: "Em espera",
  },
  processing: {
    color: "#f97416",
    label: "PREPARANDO",
  },
  ready: {
    color: "#22c55e",
    label: "Prontos pra entrega",
  },
  on_way: {
    color: "#3b83f6",
    label: "A caminho",
  },
  completed: {
    color: "#14b8a5",
    label: "Concluídos",
  },
};

export const RouteMapComponent = ({ storeLocation, points }: RouteMapProps) => {
  const bounds = useMemo(() => {
    const coords: [number, number][] = [[storeLocation.lat, storeLocation.lng]];
    points.forEach((p) => coords.push([p.lat, p.lng]));
    return coords as LatLngBoundsExpression;
  }, [storeLocation, points]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md border border-gray-200">
      <MapContainer
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* PINO DA LOJA */}
        <Marker
          position={[storeLocation.lat, storeLocation.lng]}
          icon={storeIcon}
        >
          <Popup>
            <strong>Sua Loja</strong>
          </Popup>
        </Marker>

        {/* PINOS DOS PEDIDOS */}
        {points.map((point) => {
          // Busca se o ponto já tem uma rota vinculada
          const pinColor = columns[point.status]?.color ?? "#9CA3AF";
          const pinStatus = columns[point.status]?.label ?? "#9CA3AF";

          return (
            <Marker
              key={point.n_order}
              position={[point.lat, point.lng]}
              icon={createPointIcon(pinColor)}
            >
              <Popup>
                <div
                  className="flex flex-col gap-2 max-w-35 p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col">
                    <strong className="text-gray-800">
                      {point.name} #{point.n_order}
                    </strong>

                    <span className="text-gray-500">
                      "{point.delivery_reference_point}"
                    </span>

                    <span className="font-semibold" style={{ color: pinColor }}>
                      {pinStatus}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapFitter bounds={bounds} />
      </MapContainer>
    </div>
  );
};
