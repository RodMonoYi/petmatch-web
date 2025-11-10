import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pet } from '../types';
import { MapPin } from 'lucide-react';

// Fix para ícones padrão do Leaflet (apenas no cliente)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface PetsMapProps {
  pets: Pet[];
  userLocation?: { latitude: number; longitude: number } | null;
  maxRange?: number; // em km
}

// Ícone personalizado para os marcadores
const createCustomIcon = (color: string = 'red') => {
  const iconColor = color === 'blue' ? 'blue' : 'red';
  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColor}.png`,
    shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const PetsMap: React.FC<PetsMapProps> = ({ pets, userLocation, maxRange = 20 }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Centro padrão (São Paulo)
  const defaultCenter: [number, number] = [-23.5505, -46.6333];
  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;

  // Converter km para metros para o círculo
  const radiusInMeters = maxRange * 1000;

  if (!isClient) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={userLocation ? 12 : 10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        key={`map-${center[0]}-${center[1]}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Círculo de alcance do usuário */}
        {userLocation && (
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={radiusInMeters}
            pathOptions={{
              color: '#ec4899',
              fillColor: '#fce7f3',
              fillOpacity: 0.2,
              weight: 2,
            }}
          />
        )}

        {/* Marcador da localização do usuário */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createCustomIcon('blue')}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Sua localização</p>
                <p className="text-sm text-gray-600">
                  Alcance: {maxRange} km
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores dos pets */}
        {pets.map((pet) => {
          if (!pet.usuario?.localizacao_geo) return null;
          
          try {
            const petLocation = JSON.parse(pet.usuario.localizacao_geo);
            if (!petLocation.latitude || !petLocation.longitude) return null;

            return (
              <Marker
                key={pet.id}
                position={[petLocation.latitude, petLocation.longitude]}
                icon={createCustomIcon('red')}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-pink-500" />
                      <p className="font-semibold">{pet.nome}</p>
                    </div>
                    <p className="text-sm text-gray-600">{pet.raca}</p>
                    <p className="text-sm text-gray-600">{pet.especie} • {pet.genero}</p>
                    {pet.distancia_km && (
                      <p className="text-sm text-pink-600 font-medium mt-1">
                        📍 {pet.distancia_km.toFixed(1)} km de distância
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          } catch (e) {
            return null;
          }
        })}
      </MapContainer>
    </div>
  );
};

export default PetsMap;

