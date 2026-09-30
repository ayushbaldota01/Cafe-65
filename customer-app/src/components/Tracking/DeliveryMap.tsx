import { useOrderStore } from '../../store/orderStore';
import { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Props {
  orderId: string;
  destination: { lat: number; lng: number };
}

export function DeliveryMap({ orderId, destination }: Props) {
  const { activeDeliveryLocation } = useOrderStore();
  const location = activeDeliveryLocation[orderId];
  const [route, setRoute] = useState<[number, number][]>([]);
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    if (!location || !destination) return;
    
    let isSubscribed = true;
    
    const fetchRoute = async () => {
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${location.lng},${location.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]); // OSRM gives [lng, lat]
          if (isSubscribed) {
            setRoute(coords);
            setEta(Math.round(data.routes[0].duration / 60));
          }
        }
      } catch (err) {
        console.error("OSRM Route fetch error", err);
      }
    };

    fetchRoute();
    const intervalId = setInterval(fetchRoute, 30000); // refresh every 30s
    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [location?.lat, location?.lng, destination.lat, destination.lng]);

  if (!location) {
    return (
      <div className="w-full h-full bg-gray-50 relative flex flex-col items-center justify-center">
        <div className="relative flex h-12 w-12 mb-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-20"></span>
          <div className="relative inline-flex rounded-full h-12 w-12 bg-white shadow-sm border items-center justify-center">
            <MapPin className="w-6 h-6 text-brand-500 animate-bounce" />
          </div>
        </div>
        <div className="z-10 font-bold text-gray-500 animate-pulse text-sm">Locating rider...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {eta !== null && (
        <div className="absolute top-4 left-4 right-4 sm:right-auto z-[1000] bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between sm:justify-start gap-4 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Live ETA</span>
              <span className="text-xl font-black text-gray-900 flex items-center gap-1.5 leading-none mt-0.5">
                <Clock className="w-5 h-5 text-brand-600" />
                {eta} <span className="text-sm font-bold text-gray-500 mt-1">min{eta !== 1 ? 's' : ''}</span>
              </span>
            </div>
          </div>
        </div>
      )}
      <MapContainer center={[location.lat, location.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[location.lat, location.lng]} />
        <Marker position={[destination.lat, destination.lng]} />
        {route.length > 0 && <Polyline positions={route} color="#ea580c" weight={5} />}
      </MapContainer>
    </div>
  );
}
