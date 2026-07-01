import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { matchesAPI, petsAPI } from '../services/api';
import { Match, Pet } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Heart, Dog, Cat, Bird, Rabbit, PawPrint, Calendar, MapPin, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import SponsorSlot from '../components/ads/SponsorSlot';

const Matches: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [selectedUserPet, setSelectedUserPet] = useState<Pet | null>(null);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState({ swipes: 0, likes: 0, matches: 0 });

  useEffect(() => {
    if (user) {
      fetchUserPets();
      fetchMatches();
    }
  }, [user]);

  useEffect(() => {
    if (selectedUserPet) {
      filterMatchesByPet();
    } else {
      setFilteredMatches(matches);
    }
  }, [selectedUserPet, matches]);

  const fetchUserPets = async () => {
    try {
      const myPets = await petsAPI.getMyPets();
      setUserPets(myPets);
    } catch (error) {
      console.error('Erro ao carregar pets do usuário:', error);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const userMatches = await matchesAPI.getMyMatches();
      const userStats = await matchesAPI.getMyStats();
      setMatches(userMatches);
      setStats(userStats);
    } catch (error) {
      toast.error('Erro ao carregar seus matches.');
      console.error('Erro ao carregar matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMatchesByPet = () => {
    if (!selectedUserPet) {
      setFilteredMatches(matches);
      return;
    }

    const filtered = matches.filter(match => {
      // Verificar se o pet selecionado está neste match
      return match.pet1?.id === selectedUserPet.id || 
             match.pet2?.id === selectedUserPet.id ||
             match.fk_pet_id_1 === selectedUserPet.id || 
             match.fk_pet_id_2 === selectedUserPet.id;
    });
    setFilteredMatches(filtered);
  };

  const getOtherPetFromMatch = (match: Match): Pet | null => {
    // Verificar qual pet pertence ao usuário logado
    const myPetIds = userPets.map(pet => pet.id);
    if (myPetIds.includes(match.fk_pet_id_1)) {
      return match.pet2 || null;
    } else if (myPetIds.includes(match.fk_pet_id_2)) {
      return match.pet1 || null;
    }
    return null;
  };

  const getMyPetFromMatch = (match: Match): Pet | null => {
    // Retorna meu pet que participou do match
    const myPetIds = userPets.map(pet => pet.id);
    if (myPetIds.includes(match.fk_pet_id_1)) {
      return match.pet1 || null;
    } else if (myPetIds.includes(match.fk_pet_id_2)) {
      return match.pet2 || null;
    }
    return null;
  };

  const getSpeciesIcon = (especie: string) => {
    switch (especie.toLowerCase()) {
      case 'cão':
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

  const handleStartChat = (match: Match) => {
    // Navegar para o chat com este match
    window.location.href = `/chat?match=${match.id}`;
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hoje';
    } else if (diffDays === 2) {
      return 'Ontem';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Meus Matches</h1>
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-pink-500" />
          <span className="text-lg font-semibold text-pink-500">
            {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
          </span>
        </div>
      </div>

      <SponsorSlot variant="compact" className="mb-6" />

      {/* Pet Filter */}
      {userPets.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por pet:
          </label>
          <select
            value={selectedUserPet?.id || ''}
            onChange={(e) => {
              const pet = userPets.find(p => p.id === e.target.value);
              setSelectedUserPet(pet || null);
            }}
            className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">Todos os pets</option>
            {userPets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredMatches.length === 0 ? (
        <div className="mx-auto max-w-2xl py-16 text-center">
          <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center rounded-full bg-pink-50">
            <div className="relative">
              <PawPrint className="h-20 w-20 -rotate-12 text-pink-300" />
              <Heart className="absolute -right-6 -top-4 h-12 w-12 fill-pink-500 text-pink-500" />
              <Sparkles className="absolute -bottom-3 -right-2 h-8 w-8 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            {selectedUserPet ? `${selectedUserPet.nome} ainda não tem matches` : 'Você ainda não tem matches'}
          </h2>
          <p className="text-gray-500 mb-6">
            Você já curtiu {stats.likes} {stats.likes === 1 ? 'pet' : 'pets'}. Continue descobrindo para encontrar combinações compatíveis.
          </p>
          <Button onClick={() => window.location.href = '/discover'}>
            Descobrir Pets
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => {
            const otherPet = getOtherPetFromMatch(match);
            const myPet = getMyPetFromMatch(match);
            
            if (!otherPet || !myPet) return null;

            return (
              <Card key={match.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Match Header */}
                <CardHeader className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      <span className="font-semibold">É um Match!</span>
                    </div>
                    <span className="text-sm opacity-90">
                      {formatMatchDate(match.criado_em)}
                    </span>
                  </div>
                </CardHeader>

                {/* Pet Images */}
                <div className="relative">
                  <div className="flex">
                    {/* My Pet */}
                    <div className="w-1/2 relative">
                      {myPet.fotos && myPet.fotos.length > 0 && (
                        <img
                          src={myPet.fotos[0]}
                          alt={myPet.nome}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {myPet.nome}
                      </div>
                    </div>
                    
                    {/* Heart Divider */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="bg-pink-500 rounded-full p-2">
                        <Heart className="h-4 w-4 text-white fill-current" />
                      </div>
                    </div>

                    {/* Other Pet */}
                    <div className="w-1/2 relative">
                      {otherPet.fotos && otherPet.fotos.length > 0 && (
                        <img
                          src={otherPet.fotos[0]}
                          alt={otherPet.nome}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {otherPet.nome}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pet Info */}
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {getSpeciesIcon(otherPet.especie)}
                    <h3 className="text-lg font-bold">{otherPet.nome}</h3>
                    <span className="text-sm text-gray-600">
                      {calculateAge(otherPet.data_nascimento)}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{otherPet.raca}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{otherPet.porte} porte</span>
                    </div>
                  </div>

                  {otherPet.descricao && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {otherPet.descricao}
                    </p>
                  )}

                  <Button 
                    onClick={() => handleStartChat(match)}
                    className="w-full bg-pink-500 hover:bg-pink-600"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Iniciar Conversa
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;
