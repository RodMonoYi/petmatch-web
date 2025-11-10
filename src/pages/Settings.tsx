import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { latitude, longitude, error: geoError, loading: geoLoading, getCurrentPosition } = useGeolocation();
  
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [raioMaximo, setRaioMaximo] = useState<number>(20);
  const [manualLat, setManualLat] = useState<string>('');
  const [manualLon, setManualLon] = useState<string>('');

  useEffect(() => {
    if (user) {
      // Parse localização existente
      if (user.localizacao_geo) {
        try {
          const loc = JSON.parse(user.localizacao_geo);
          setLocation(loc);
          setManualLat(loc.latitude.toString());
          setManualLon(loc.longitude.toString());
        } catch (e) {
          // Ignorar erro
        }
      }
      // Definir alcance máximo
      if (user.raio_maximo) {
        setRaioMaximo(user.raio_maximo);
      }
    }
  }, [user]);

  const handleUseCurrentLocation = () => {
    getCurrentPosition();
  };

  useEffect(() => {
    if (latitude && longitude) {
      setLocation({ latitude, longitude });
      setManualLat(latitude.toString());
      setManualLon(longitude.toString());
      toast.success('Localização obtida com sucesso!');
    }
  }, [latitude, longitude]);

  const handleManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    
    if (isNaN(lat) || isNaN(lon)) {
      toast.error('Por favor, insira coordenadas válidas');
      return;
    }
    
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      toast.error('Coordenadas inválidas');
      return;
    }
    
    setLocation({ latitude: lat, longitude: lon });
    toast.success('Localização definida!');
  };

  const handleSave = async () => {
    if (!location) {
      toast.error('Por favor, defina sua localização primeiro');
      return;
    }

    setLoading(true);
    try {
      const locationJson = JSON.stringify(location);
      await usersAPI.updateMe({
        localizacao_geo: locationJson,
        raio_maximo: raioMaximo,
      });
      
      await refreshUser();
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>
        <p className="text-gray-600 mt-2">Configure sua localização e alcance de busca</p>
      </div>

      <div className="space-y-6">
        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-pink-500" />
              Localização
            </CardTitle>
            <CardDescription>
              Sua localização ajuda a encontrar pets próximos para matches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Usar localização atual */}
            <div>
              <Button
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                variant="outline"
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {geoLoading ? 'Obtendo localização...' : 'Usar minha localização atual'}
              </Button>
              {geoError && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{geoError}</span>
                </div>
              )}
            </div>

            <div className="text-center text-gray-500">ou</div>

            {/* Localização manual */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="-23.5505"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="-46.6333"
                  value={manualLon}
                  onChange={(e) => setManualLon(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleManualLocation}
              variant="outline"
              className="w-full"
            >
              Definir Localização Manual
            </Button>

            {/* Localização atual */}
            {location && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">Localização definida:</p>
                <p className="text-sm text-green-600">
                  Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alcance máximo */}
        <Card>
          <CardHeader>
            <CardTitle>Alcance de Busca</CardTitle>
            <CardDescription>
              Defina o raio máximo em quilômetros para buscar pets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="raio">Raio máximo (km)</Label>
                <Select
                  value={raioMaximo.toString()}
                  onValueChange={(value) => setRaioMaximo(parseInt(value))}
                >
                  <SelectTrigger id="raio" className="w-full">
                    <SelectValue placeholder="Selecione o alcance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 km</SelectItem>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="20">20 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                    <SelectItem value="100">100 km</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-2">
                  Pets além deste alcance não aparecerão nas sugestões de matches
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão salvar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading || !location}
            size="lg"
            className="min-w-32"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

