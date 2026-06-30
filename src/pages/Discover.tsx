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
      case 'cachorro':
        return <Dog className="h-5 w-5 text-pink-500" />;
      case 'gato':
        return <Cat className="h-5 w-5 text-pink-500" />;
      case 'passaro':
        return <Bird className="h-5 w-5 text-pink-500" />;
      case 'coelho':
        return <Rabbit className="h-5 w-5 text-pink-500" />;
      default:
        return <PawPrint className="h-5 w-5 text-pink-500" />;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (userPets.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="max-w-md mx-auto mt-20">
          <PawPrint className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cadastre seu primeiro pet!</h2>
          <p className="text-gray-600 mb-6">
            Para começar a descobrir novos amigos, você precisa cadastrar pelo menos um pet.
          </p>
          <Button onClick={() => (window.location.href = '/my-pets')}>
            Cadastrar Pet
          </Button>
        </div>
      </div>
    );
  }

  // Só mostra "não há mais pets" se já tentou buscar E não há pets OU já viu todos
  if (hasSearched && (pets.length === 0 || currentPetIndex >= pets.length)) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="max-w-md mx-auto mt-20">
          <Heart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Não há mais pets para descobrir!</h2>
          <p className="text-gray-600 mb-6">
            {pets.length === 0 
              ? 'Não há pets disponíveis no seu alcance. Tente aumentar o alcance nas configurações ou volte mais tarde!'
              : 'Você já viu todos os pets disponíveis. Volte mais tarde para ver novos amigos!'}
          </p>
          <Button onClick={fetchPotentialMatches}>
            Buscar Novamente
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
    <div className="container mx-auto p-4 max-w-md">
      {/* Pet Selection */}
      {userPets.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descobrir para:
          </label>
          <select
            value={selectedUserPet?.id || ''}
            onChange={(e) => {
              const pet = userPets.find(p => p.id === e.target.value);
              setSelectedUserPet(pet || null);
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          >
            {userPets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Current Pet Card */}
      <div className="relative mb-6">
        <Card className="overflow-hidden shadow-2xl">
          {currentPet.fotos && currentPet.fotos.length > 0 && (
            <div className="relative h-96">
              <img
                src={currentPet.fotos[0]}
                alt={currentPet.nome}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  {getSpeciesIcon(currentPet.especie)}
                  <h2 className="text-2xl font-bold">{currentPet.nome}</h2>
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

      {/* Action Buttons */}
      <div className="flex justify-center gap-6">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 border-red-200 hover:border-red-300 hover:bg-red-50"
          onClick={() => handleSwipe('dislike')}
        >
          <X className="h-8 w-8 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          className="rounded-full w-16 h-16 bg-pink-500 hover:bg-pink-600"
          onClick={() => handleSwipe('like')}
        >
          <Heart className="h-8 w-8 text-white" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Pet {currentPetIndex + 1} de {pets.length}
      </div>
    </div>
  );
};

export default Discover;

