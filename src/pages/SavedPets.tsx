import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { petsAPI } from '../services/api';
import { Pet } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Eye,
  Heart,
  MapPin,
  Search,
  Star,
  Syringe,
  Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  calculatePetAge,
  getPetStatus,
  getUserLocationLabel,
  isVaccinated,
} from '../lib/petPresentation';

const SavedPets: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingPetIds, setRemovingPetIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSavedPets();
  }, []);

  const loadSavedPets = async () => {
    setLoading(true);
    try {
      const savedPets = await petsAPI.getSaved();
      setPets(savedPets || []);
    } catch (error) {
      console.error('Erro ao carregar pets salvos:', error);
      toast.error('Erro ao carregar pets salvos.');
    } finally {
      setLoading(false);
    }
  };

  const removeSavedPet = async (pet: Pet) => {
    setRemovingPetIds((currentIds) => new Set(currentIds).add(pet.id));
    try {
      await petsAPI.unsave(pet.id);
      setPets((currentPets) => currentPets.filter((item) => item.id !== pet.id));
      toast.success(`${pet.nome} removido dos salvos.`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover pet salvo.';
      toast.error(message);
    } finally {
      setRemovingPetIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(pet.id);
        return nextIds;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Star className="mx-auto mb-4 h-12 w-12 text-rose-600" />
          <p className="text-gray-600">Carregando pets salvos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="page-kicker">Lista curta</p>
          <h1 className="page-title mt-2">Pets salvos</h1>
          <p className="mt-2 text-gray-600">
            {pets.length === 1
              ? '1 perfil salvo para acompanhar depois'
              : `${pets.length} perfis salvos para acompanhar depois`}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/search">
            <Search className="h-4 w-4" />
            Buscar pets
          </Link>
        </Button>
      </div>

      {pets.length === 0 ? (
        <div className="empty-state">
          <Star className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Nenhum pet salvo
          </h2>
          <p className="mb-6 text-gray-600">
            Salve perfis na busca ou no perfil do pet para encontrá-los aqui.
          </p>
          <Button asChild>
            <Link to="/search">Buscar pets</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.map((pet) => {
            const status = getPetStatus(pet);
            const isRemoving = removingPetIds.has(pet.id);

            return (
              <Card key={pet.id} className="pet-card group py-0">
                <div className="relative h-48 bg-gray-100">
                  {pet.fotos && pet.fotos.length > 0 ? (
                    <img
                      src={pet.fotos[0]}
                      alt={pet.nome}
                      className="pet-photo"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Heart className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <Badge variant="outline" className={`absolute left-2 top-2 border bg-white/90 ${status.className}`}>
                    {status.label}
                  </Badge>
                </div>

                <CardContent className="space-y-4 p-4">
                  <div>
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold leading-tight">{pet.nome}</h3>
                      <span className="text-xs font-medium text-gray-500">
                        {calculatePetAge(pet.data_nascimento)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {pet.raca}
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {getUserLocationLabel(pet.usuario)}
                      </p>
                      <p>{pet.genero} • {pet.porte}</p>
                      <p className="flex items-center gap-1 text-gray-500">
                        <Heart className="h-4 w-4 text-rose-600" />
                        {pet.curtidas_count || 0} {(pet.curtidas_count || 0) === 1 ? 'curtida' : 'curtidas'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {pet.pedigree && (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                        <Trophy className="h-3 w-3" />
                        Pedigree
                      </Badge>
                    )}
                    {isVaccinated(pet) && (
                      <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                        <Syringe className="h-3 w-3" />
                        Vacinado
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/pets/${pet.id}`}>
                        <Eye className="h-4 w-4" />
                        Perfil
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeSavedPet(pet)}
                      disabled={isRemoving}
                    >
                      <Star className="h-4 w-4 fill-rose-600 text-rose-600" />
                      {isRemoving ? 'Removendo' : 'Remover'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedPets;
