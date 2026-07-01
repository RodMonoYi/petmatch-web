import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { petsAPI, matchesAPI } from '../services/api';
import { Pet } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, X, MapPin, Calendar, Dog, Cat, Bird, Rabbit, PawPrint } from 'lucide-react';
import toast from 'react-hot-toast';

const Discover: React.FC = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [selectedUserPet, setSelectedUserPet] = useState<Pet | null>(null);
  const [hasSearched, setHasSearched] = useState(false); // Flag para saber se já tentou buscar pets

  useEffect(() => {
    if (user) {
      fetchUserPets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedUserPet) {
      fetchPotentialMatches();
    }
  }, [selectedUserPet]);

  const fetchUserPets = async () => {
    try {
      const myPets = await petsAPI.getMyPets();
      setUserPets(myPets || []); // Garantir que sempre seja um array
      if (myPets && myPets.length > 0) {
        setSelectedUserPet(myPets[0]);
      } else {
        setLoading(false); // Para o loading se não há pets
      }
    } catch (error) {
      toast.error('Erro ao carregar seus pets.');
      console.error('Erro ao carregar pets do usuário:', error);
      setUserPets([]); // Garantir que seja um array vazio em caso de erro
      setLoading(false); // Para o loading em caso de erro
    }
  };

  const fetchPotentialMatches = async (append: boolean = false) => {
    if (!selectedUserPet) return;
    
    setLoading(true);
    setHasSearched(true); // Marca que já tentou buscar
    try {
      // Aumentar limite para 50 pets para ter mais opções
      const potentialPets = await matchesAPI.getPotentialMatches(selectedUserPet.id, 50);
      console.log('Pets encontrados:', potentialPets?.length || 0);
      
      if (append) {
        // Adicionar novos pets aos existentes, evitando duplicatas
        setPets(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPets = potentialPets.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPets];
        });
      } else {
        setPets(potentialPets || []); // Garantir que sempre seja um array
        setCurrentPetIndex(0);
      }
    } catch (error) {
      console.error('Erro ao carregar pets potenciais:', error);
      toast.error('Erro ao carregar pets disponíveis.');
      // Se der erro, define pets como array vazio para mostrar mensagem apropriada
      if (!append) {
        setPets([]);
        setCurrentPetIndex(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: 'like' | 'dislike') => {
    if (!selectedUserPet || currentPetIndex >= pets.length) return;

    const targetPet = pets[currentPetIndex];
    
    try {
      const result = await matchesAPI.swipe(selectedUserPet.id, targetPet.id, action);
      
      if (action === 'like') {
        if (result.isMatch) {
          toast.success(`🎉 É um match! Você e ${targetPet.nome} se gostaram!`);
        } else {
          toast.success(`❤️ Você curtiu ${targetPet.nome}!`);
        }
      }
      
      // Move to next pet
      const nextIndex = currentPetIndex + 1;
      setCurrentPetIndex(nextIndex);
      
      // Se estiver próximo do fim (últimos 3 pets), buscar mais
      if (nextIndex >= pets.length - 3 && pets.length > 0) {
        fetchPotentialMatches(true); // Append novos pets
      }
    } catch (error) {
      toast.error('Erro ao processar sua escolha.');
      console.error('Erro no swipe:', error);
    }
  };

  const getSpeciesIcon = (especie: string) => {
    switch (especie.toLowerCase()) {
      case 'cão':
      case 'cachorro':
        return <Dog className="h-5 w-5 text-rose-600" />;
      case 'gato':
        return <Cat className="h-5 w-5 text-rose-600" />;
      case 'passaro':
        return <Bird className="h-5 w-5 text-rose-600" />;
      case 'coelho':
        return <Rabbit className="h-5 w-5 text-rose-600" />;
      default:
        return <PawPrint className="h-5 w-5 text-rose-600" />;
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} ${ageInMonths === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-rose-600"></div>
          <p className="mt-4 text-sm text-gray-600">Buscando perfis compatíveis...</p>
        </div>
      </div>
    );
  }

  if (userPets.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="empty-state">
          <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-950 mb-3">Cadastre seu primeiro pet</h2>
          <p className="text-gray-600 mb-6">
            Para descobrir perfis, primeiro precisamos saber para qual pet você está buscando.
          </p>
          <Button onClick={() => (window.location.href = '/my-pets')}>
            Cadastrar pet
          </Button>
        </div>
      </div>
    );
  }

  // Só mostra "não há mais pets" se já tentou buscar E não há pets OU já viu todos
  if (hasSearched && (pets.length === 0 || currentPetIndex >= pets.length)) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="empty-state">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-950 mb-3">Nenhum perfil novo por enquanto</h2>
          <p className="text-gray-600 mb-6">
            {pets.length === 0 
              ? 'Não encontramos pets disponíveis no seu alcance. Tente ajustar o raio nas configurações ou volte mais tarde.'
              : 'Você já viu todos os perfis disponíveis para esse pet. Volte depois para ver novidades.'}
          </p>
          <Button onClick={fetchPotentialMatches}>
            Buscar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Se ainda não buscou ou não há pets, não renderiza o card ainda
  if (!hasSearched || pets.length === 0 || currentPetIndex >= pets.length) {
    return null; // Retorna null enquanto carrega ou não há pets
  }

  const currentPet = pets[currentPetIndex];
  
  if (!currentPet) {
    return null; // Segurança adicional
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <div className="mb-6">
        <p className="page-kicker">Descobrir</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">Um perfil por vez</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Curta quando fizer sentido para o pet selecionado. Se não for compatível,
          a lista já evita esse perfil.
        </p>
      </div>

      {userPets.length > 1 && (
        <div className="soft-panel mb-6 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descobrir para:
          </label>
          <select
            value={selectedUserPet?.id || ''}
            onChange={(e) => {
              const pet = userPets.find(p => p.id === e.target.value);
              setSelectedUserPet(pet || null);
            }}
            className="w-full rounded-md border border-stone-300 bg-white p-2 text-sm focus:border-rose-500 focus:ring-rose-500"
          >
            {userPets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="relative mb-6">
        <Card className="pet-card group py-0">
          {currentPet.fotos && currentPet.fotos.length > 0 && (
            <div className="relative h-96">
              <img
                src={currentPet.fotos[0]}
                alt={currentPet.nome}
                className="pet-photo"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  {getSpeciesIcon(currentPet.especie)}
                  <h2 className="text-2xl font-semibold">{currentPet.nome}</h2>
                  <span className="text-lg">
                    {calculateAge(currentPet.data_nascimento)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm opacity-90 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>{currentPet.raca}</span>
                </div>
                <div className="flex items-center gap-1 text-sm opacity-90">
                  <MapPin className="h-4 w-4" />
                  <span>{currentPet.porte} porte</span>
                  {currentPet.distancia_km && (
                    <span className="ml-2">• {currentPet.distancia_km.toFixed(1)} km</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <CardContent className="p-4">
            {currentPet.descricao && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {currentPet.descricao}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-6">
        <Button
          variant="outline"
          size="lg"
          className="h-16 w-16 rounded-full border-red-200 bg-white hover:border-red-300 hover:bg-red-50"
          onClick={() => handleSwipe('dislike')}
        >
          <X className="h-8 w-8 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          className="h-16 w-16 rounded-full bg-rose-600 hover:bg-rose-700"
          onClick={() => handleSwipe('like')}
        >
          <Heart className="h-8 w-8 text-white" />
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        Pet {currentPetIndex + 1} de {pets.length}
      </div>
    </div>
  );
};

export default Discover;
