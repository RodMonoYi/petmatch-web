import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { matchesAPI, petsAPI } from '../services/api';
import { Pet, PetsResponse } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search as SearchIcon,
  MapPin,
  Calendar,
  Dog,
  Cat,
  Heart,
  Filter,
  X,
  Eye,
  Star,
  Syringe,
  Trophy,
  PawPrint,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SponsorSlot from '../components/ads/SponsorSlot';
import {
  calculatePetAge,
  getPetStatus,
  getUserLocationLabel,
  isVaccinated,
} from '../lib/petPresentation';

const Search: React.FC = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSelectedSpecies, setHasSelectedSpecies] = useState(false);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [favoritePets, setFavoritePets] = useState<Set<string>>(new Set());
  const [likedPets, setLikedPets] = useState<Set<string>>(new Set());
  const [savingPetIds, setSavingPetIds] = useState<Set<string>>(new Set());
  const [likingPetIds, setLikingPetIds] = useState<Set<string>>(new Set());
  const [petPendingLike, setPetPendingLike] = useState<Pet | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    especie: '',
    raca: '',
    genero: '',
    porte: '',
    searchTerm: '',
    idadeMin: '',
    idadeMax: '',
    distancia: '',
    pedigree: 'all',
    vacinado: 'all',
    disponivel: 'all',
    aceitaViagem: 'all',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      petsAPI.getMyPets()
        .then((myPets) => setUserPets(myPets || []))
        .catch(() => setUserPets([]));
    }
  }, [user]);

  // Só busca quando espécie for selecionada
  useEffect(() => {
    if (hasSelectedSpecies) {
      searchPets();
    }
  }, [page, filters, hasSelectedSpecies]);

  const handleSpeciesSelection = (especie: string) => {
    setFilters(prev => ({ ...prev, especie }));
    setHasSelectedSpecies(true);
    setPage(1);
  };

  const searchPets = async () => {
    if (!hasSelectedSpecies) return;
    
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 12,
      };

      // Adicionar filtros se preenchidos (exceto se for "all")
      if (filters.especie && filters.especie !== 'all') {
        params.especie = filters.especie;
      }
      if (filters.raca) {
        params.raca = filters.raca;
      }
      if (filters.genero && filters.genero !== 'all') {
        params.genero = filters.genero;
      }
      if (filters.porte && filters.porte !== 'all') {
        params.porte = filters.porte;
      }
      if (filters.idadeMin) {
        params.idade_min = Number(filters.idadeMin);
      }
      if (filters.idadeMax) {
        params.idade_max = Number(filters.idadeMax);
      }
      if (filters.pedigree !== 'all') {
        params.pedigree = filters.pedigree === 'true';
      }
      if (filters.vacinado !== 'all') {
        params.vacinado = filters.vacinado === 'true';
      }
      if (filters.disponivel !== 'all') {
        params.disponivel_reproducao = filters.disponivel === 'true';
      }
      if (filters.aceitaViagem !== 'all') {
        params.aceita_viagem = filters.aceitaViagem === 'true';
      }

      // Se tiver localização, usar para filtrar por distância
      if (user?.localizacao_geo) {
        try {
          const location = JSON.parse(user.localizacao_geo);
          params.latitude = location.latitude;
          params.longitude = location.longitude;
          params.raio = filters.distancia ? Number(filters.distancia) : user.raio_maximo || 50;
        } catch (e) {
          // Ignorar erro
        }
      }

      const response: PetsResponse = await petsAPI.getAll(params);
      
      // Filtrar por termo de busca no frontend (nome, raça, descrição)
      let filteredPets = response.pets.filter((pet) => pet.fk_usuario_id !== user?.id);
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredPets = response.pets.filter(pet => 
          pet.nome.toLowerCase().includes(term) ||
          pet.raca.toLowerCase().includes(term) ||
          pet.descricao?.toLowerCase().includes(term)
        );
      }

      setPets(filteredPets);
      setFavoritePets((currentFavorites) => {
        const nextFavorites = new Set(currentFavorites);
        filteredPets.forEach((pet) => {
          if (pet.salvo) {
            nextFavorites.add(pet.id);
          } else {
            nextFavorites.delete(pet.id);
          }
        });
        return nextFavorites;
      });
      setLikedPets((currentLikes) => {
        const nextLikes = new Set(currentLikes);
        filteredPets.forEach((pet) => {
          if (pet.curtido) {
            nextLikes.add(pet.id);
          } else {
            nextLikes.delete(pet.id);
          }
        });
        return nextLikes;
      });
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      toast.error('Erro ao buscar pets.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Resetar para primeira página ao mudar filtro
  };

  const clearFilters = () => {
    setFilters({
      especie: filters.especie, // Manter espécie selecionada
      raca: '',
      genero: '',
      porte: '',
      searchTerm: '',
      idadeMin: '',
      idadeMax: '',
      distancia: '',
      pedigree: 'all',
      vacinado: 'all',
      disponivel: 'all',
      aceitaViagem: 'all',
    });
    setPage(1);
  };

  const resetSearch = () => {
    setHasSelectedSpecies(false);
    setFilters({
      especie: '',
      raca: '',
      genero: '',
      porte: '',
      searchTerm: '',
      idadeMin: '',
      idadeMax: '',
      distancia: '',
      pedigree: 'all',
      vacinado: 'all',
      disponivel: 'all',
      aceitaViagem: 'all',
    });
    setPets([]);
    setPage(1);
    setTotal(0);
    setTotalPages(1);
  };

  const getSpeciesIcon = (especie: string) => {
    switch (especie.toLowerCase()) {
      case 'cão':
      case 'cachorro':
        return <Dog className="h-5 w-5 text-rose-600" />;
      case 'gato':
        return <Cat className="h-5 w-5 text-rose-600" />;
      default:
        return <Heart className="h-5 w-5 text-rose-600" />;
    }
  };

  const hasActiveFilters = Boolean(
    filters.raca ||
    filters.genero ||
    filters.porte ||
    filters.searchTerm ||
    filters.idadeMin ||
    filters.idadeMax ||
    filters.distancia ||
    filters.pedigree !== 'all' ||
    filters.vacinado !== 'all' ||
    filters.disponivel !== 'all' ||
    filters.aceitaViagem !== 'all'
  );

  const getLikeAvailability = (pet: Pet) => {
    if (user?.id === pet.fk_usuario_id) {
      return {
        canLike: false,
        pet: null,
        label: 'Seu pet',
        message: 'Este pet pertence a você.',
      };
    }

    const sameSpeciesPets = userPets.filter((userPet) => (
      userPet.especie === pet.especie &&
      userPet.id !== pet.id
    ));
    const compatiblePets = sameSpeciesPets.filter((userPet) => (
      userPet.genero !== pet.genero
    ));
    const likedByPetIds = new Set(pet.curtido_por_pet_ids || []);
    const compatiblePet = compatiblePets.find((userPet) => (
      !likedByPetIds.has(userPet.id)
    ));

    if (compatiblePet) {
      return {
        canLike: true,
        pet: compatiblePet,
        label: 'Curtir',
        message: '',
      };
    }

    if (sameSpeciesPets.length > 0) {
      if (compatiblePets.length > 0) {
        return {
          canLike: false,
          pet: null,
          label: 'Curtido',
          message: 'Todos os seus pets compatíveis já curtiram este perfil.',
        };
      }

      return {
        canLike: false,
        pet: null,
        label: 'Bloqueado',
        message: 'Para reprodução, os pets compatíveis por espécie precisam ter gêneros opostos.',
      };
    }

    return {
      canLike: false,
      pet: null,
      label: 'Bloqueado',
      message: 'Você precisa ter um pet da mesma espécie para curtir.',
    };
  };

  const getCompatibleLikePets = (pet: Pet) => {
    const likedByPetIds = new Set(pet.curtido_por_pet_ids || []);

    return userPets.filter((userPet) => (
      userPet.especie === pet.especie &&
      userPet.genero !== pet.genero &&
      userPet.id !== pet.id &&
      !likedByPetIds.has(userPet.id)
    ));
  };

  const getPetPhoto = (pet: Pet) => pet.fotos?.[0] || '';

  const setPetSavedState = (petId: string, saved: boolean) => {
    setPets((currentPets) =>
      currentPets.map((pet) =>
        pet.id === petId ? { ...pet, salvo: saved } : pet,
      ),
    );
    setFavoritePets((currentFavorites) => {
      const nextFavorites = new Set(currentFavorites);
      if (saved) {
        nextFavorites.add(petId);
      } else {
        nextFavorites.delete(petId);
      }
      return nextFavorites;
    });
  };

  const toggleFavorite = async (pet: Pet) => {
    if (user?.id === pet.fk_usuario_id) {
      toast.error('Seu próprio pet já fica disponível em Meus Pets.');
      return;
    }

    const wasSaved = favoritePets.has(pet.id) || Boolean(pet.salvo);
    setSavingPetIds((currentIds) => new Set(currentIds).add(pet.id));
    setPetSavedState(pet.id, !wasSaved);

    try {
      if (wasSaved) {
        await petsAPI.unsave(pet.id);
        toast.success(`${pet.nome} removido dos salvos.`);
      } else {
        await petsAPI.save(pet.id);
        toast.success(`${pet.nome} salvo.`);
      }
    } catch (error: any) {
      setPetSavedState(pet.id, wasSaved);
      const message = error.response?.data?.message || 'Erro ao atualizar salvos.';
      toast.error(message);
    } finally {
      setSavingPetIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(pet.id);
        return nextIds;
      });
    }
  };

  const openLikeSelector = (pet: Pet) => {
    const likeAvailability = getLikeAvailability(pet);

    if (!likeAvailability.canLike) {
      toast.error(likeAvailability.message);
      return;
    }

    setPetPendingLike(pet);
  };

  const handleLikeWithPet = async (targetPet: Pet, sourcePet: Pet) => {
    setLikingPetIds((currentIds) => new Set(currentIds).add(targetPet.id));
    try {
      const result = await matchesAPI.swipe(sourcePet.id, targetPet.id, 'like');
      setPets((currentPets) =>
        currentPets.map((currentPet) => {
          if (currentPet.id !== targetPet.id) return currentPet;

          const likedByPetIds = new Set(currentPet.curtido_por_pet_ids || []);
          likedByPetIds.add(sourcePet.id);

          return {
            ...currentPet,
            curtido: true,
            curtido_por_pet_ids: Array.from(likedByPetIds),
            curtidas_count: result.alreadySwiped
              ? currentPet.curtidas_count
              : (currentPet.curtidas_count || 0) + 1,
          };
        }),
      );
      setLikedPets((currentLikes) => new Set(currentLikes).add(targetPet.id));
      setPetPendingLike(null);

      if (result.isMatch) {
        toast.success(`É um match com ${targetPet.nome}!`);
      } else if (result.alreadySwiped) {
        toast('Você já curtiu este pet.');
      } else {
        toast.success(`${sourcePet.nome} curtiu ${targetPet.nome}.`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao curtir pet.';
      toast.error(message);
    } finally {
      setLikingPetIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(targetPet.id);
        return nextIds;
      });
    }
  };

  const compatibleLikePets = petPendingLike ? getCompatibleLikePets(petPendingLike) : [];

  if (!hasSelectedSpecies) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="page-kicker">Busca</p>
          <h1 className="page-title mt-3">Que tipo de pet você quer encontrar?</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-gray-600">
            Comece pela espécie. Depois você pode filtrar por raça, gênero,
            distância, saúde e disponibilidade.
          </p>
        </div>

        <SponsorSlot className="mb-6" />

        <Card className="soft-panel p-5 sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="text-2xl font-semibold text-gray-950">Escolha a espécie</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
              Isso evita resultados soltos demais logo no início.
            </p>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <Button
              variant="outline"
              size="lg"
              className="h-24 w-full min-w-0 flex-col gap-2 border-stone-200 bg-white px-2 hover:border-rose-200 hover:bg-rose-50 sm:h-28 sm:gap-3"
              onClick={() => handleSpeciesSelection('Cão')}
            >
              <Dog className="h-7 w-7 text-rose-600 sm:h-9 sm:w-9" />
              <span className="text-sm font-semibold sm:text-lg">Cães</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-24 w-full min-w-0 flex-col gap-2 border-stone-200 bg-white px-2 hover:border-rose-200 hover:bg-rose-50 sm:h-28 sm:gap-3"
              onClick={() => handleSpeciesSelection('Gato')}
            >
              <Cat className="h-7 w-7 text-rose-600 sm:h-9 sm:w-9" />
              <span className="text-sm font-semibold sm:text-lg">Gatos</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-24 w-full min-w-0 flex-col gap-2 border-stone-200 bg-white px-2 hover:border-rose-200 hover:bg-rose-50 sm:h-28 sm:gap-3"
              onClick={() => handleSpeciesSelection('all')}
            >
              <Heart className="h-7 w-7 text-rose-600 sm:h-9 sm:w-9" />
              <span className="text-sm font-semibold sm:text-lg">Todas</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Tela de busca com resultados
  return (
    <div className="page-shell">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="page-kicker">Busca</p>
          <h1 className="page-title mt-2">Perfis encontrados</h1>
          <p className="mt-2 text-gray-600">
            Especie: <span className="font-semibold text-gray-900">
              {filters.especie === 'all' ? 'Todas as espécies' : filters.especie + 's'}
            </span>
          </p>
        </div>
        <Button variant="ghost" onClick={resetSearch} size="sm">
          <X className="h-4 w-4 mr-2" />
          Nova Busca
        </Button>
      </div>

      {/* Barra de busca e filtros */}
      <div className="soft-panel mb-6 space-y-4 p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar por nome, raça ou descrição..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {showFilters && <X className="h-4 w-4" />}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              Limpar filtros
            </Button>
          )}
        </div>

        {showFilters && (
          <Card className="border-stone-200 bg-stone-50/70 p-4 shadow-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="genero">Gênero</Label>
                <Select
                  value={filters.genero || undefined}
                  onValueChange={(value) => handleFilterChange('genero', value)}
                >
                  <SelectTrigger id="genero">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Macho">Macho</SelectItem>
                    <SelectItem value="Fêmea">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="porte">Porte</Label>
                <Select
                  value={filters.porte || undefined}
                  onValueChange={(value) => handleFilterChange('porte', value)}
                >
                  <SelectTrigger id="porte">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Pequeno">Pequeno</SelectItem>
                    <SelectItem value="Médio">Médio</SelectItem>
                    <SelectItem value="Grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="raca">Raça</Label>
                <Input
                  id="raca"
                  placeholder="Ex: Golden Retriever"
                  value={filters.raca}
                  onChange={(e) => handleFilterChange('raca', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="distancia">Distância</Label>
                <Select
                  value={filters.distancia || undefined}
                  onValueChange={(value) => handleFilterChange('distancia', value)}
                >
                  <SelectTrigger id="distancia">
                    <SelectValue placeholder="Alcance padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Até 5 km</SelectItem>
                    <SelectItem value="10">Até 10 km</SelectItem>
                    <SelectItem value="20">Até 20 km</SelectItem>
                    <SelectItem value="50">Até 50 km</SelectItem>
                    <SelectItem value="100">Até 100 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="idadeMin">Idade mínima</Label>
                <Input
                  id="idadeMin"
                  type="number"
                  min="0"
                  max="30"
                  placeholder="0"
                  value={filters.idadeMin}
                  onChange={(e) => handleFilterChange('idadeMin', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="idadeMax">Idade máxima</Label>
                <Input
                  id="idadeMax"
                  type="number"
                  min="0"
                  max="30"
                  placeholder="8"
                  value={filters.idadeMax}
                  onChange={(e) => handleFilterChange('idadeMax', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="pedigree">Pedigree</Label>
                <Select
                  value={filters.pedigree}
                  onValueChange={(value) => handleFilterChange('pedigree', value)}
                >
                  <SelectTrigger id="pedigree">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Com pedigree</SelectItem>
                    <SelectItem value="false">Sem pedigree</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vacinado">Vacinação</Label>
                <Select
                  value={filters.vacinado}
                  onValueChange={(value) => handleFilterChange('vacinado', value)}
                >
                  <SelectTrigger id="vacinado">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Vacinado</SelectItem>
                    <SelectItem value="false">Não vacinado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="disponivel">Disponibilidade</Label>
                <Select
                  value={filters.disponivel}
                  onValueChange={(value) => handleFilterChange('disponivel', value)}
                >
                  <SelectTrigger id="disponivel">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Disponível</SelectItem>
                    <SelectItem value="false">Não disponível</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="aceitaViagem">Aceita viagem</Label>
                <Select
                  value={filters.aceitaViagem}
                  onValueChange={(value) => handleFilterChange('aceitaViagem', value)}
                >
                  <SelectTrigger id="aceitaViagem">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}
      </div>

      <SponsorSlot variant="compact" className="mb-6" />

      {/* Resultados */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-rose-600"></div>
        </div>
      ) : pets.length === 0 ? (
        <div className="empty-state">
          <SearchIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-950 mb-4">Nenhum pet encontrado</h2>
          <p className="text-gray-600 mb-6">
            Tente ajustar os filtros ou buscar por outros termos.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={clearFilters}>Limpar Filtros</Button>
            <Button variant="outline" onClick={resetSearch}>
              Nova Busca
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {total} {total === 1 ? 'pet encontrado' : 'pets encontrados'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.map((pet) => {
              const status = getPetStatus(pet);
              const isFavorite = favoritePets.has(pet.id);
              const isSaving = savingPetIds.has(pet.id);
              const isLiking = likingPetIds.has(pet.id);
              const likeAvailability = getLikeAvailability(pet);
              const isFullyLiked =
                !likeAvailability.canLike && likeAvailability.label === 'Curtido';
              const hasAnyLike = likedPets.has(pet.id);
              const likeBlocked = !likeAvailability.canLike;

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
                  <div className="absolute right-2 top-2 rounded-md bg-white/95 p-2 shadow-sm">
                    {getSpeciesIcon(pet.especie)}
                  </div>
                  <Badge variant="outline" className={`absolute left-2 top-2 border ${status.className}`}>
                    {status.label}
                  </Badge>
                </div>
                  
                <CardContent className="space-y-4 p-4">
                  <div>
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold leading-tight text-gray-950">{pet.nome}</h3>
                      <span className="text-xs font-medium text-gray-500">{calculatePetAge(pet.data_nascimento)}</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {pet.raca}
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {getUserLocationLabel(pet.usuario)}
                        {pet.distancia_km ? ` • ${pet.distancia_km.toFixed(1)} km` : ''}
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
                      {pet.aceita_viagem && (
                        <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">
                          <MapPin className="h-3 w-3" />
                          Aceita viagem
                        </Badge>
                      )}
                  </div>

                  {pet.descricao && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {pet.descricao}
                    </p>
                  )}

                  {!likeAvailability.canLike && (
                    <p className="rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                      {likeAvailability.message}
                    </p>
                  )}
                  {hasAnyLike && likeAvailability.canLike && (
                    <p className="rounded-md bg-sky-50 px-2 py-1.5 text-xs text-sky-800">
                      Outro pet seu já curtiu este perfil. Você ainda pode curtir com {likeAvailability.pet?.nome}.
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant={isFullyLiked ? 'default' : 'outline'}
                      onClick={() => openLikeSelector(pet)}
                      disabled={likeBlocked || isLiking}
                    >
                      <Heart className={`h-4 w-4 ${isFullyLiked ? 'fill-white' : 'text-rose-600'}`} />
                      {isFullyLiked ? 'Curtido' : isLiking ? 'Curtindo' : likeAvailability.label}
                    </Button>
                    <Button
                      size="sm"
                      variant={isFavorite ? 'default' : 'outline'}
                      onClick={() => toggleFavorite(pet)}
                      disabled={isSaving}
                    >
                      <Star className={`h-4 w-4 ${isFavorite ? 'fill-white' : ''}`} />
                      {isFavorite ? 'Salvo' : isSaving ? 'Salvando' : 'Salvar'}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/pets/${pet.id}`}>
                        <Eye className="h-4 w-4" />
                        Perfil
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={Boolean(petPendingLike)} onOpenChange={(open) => !open && setPetPendingLike(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Escolha qual pet vai curtir</DialogTitle>
          </DialogHeader>

          {petPendingLike && (
            <div className="space-y-4">
              <div className="rounded-lg border border-rose-100 bg-rose-50/70 p-3">
                <p className="text-sm text-gray-700">
                  Você está curtindo <strong>{petPendingLike.nome}</strong>.
                  Selecione um pet compatível para tentar o match.
                </p>
              </div>

              {compatibleLikePets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-stone-300 p-6 text-center">
                  <PawPrint className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                  <p className="font-medium text-gray-900">Nenhum pet disponível</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Todos os seus pets compatíveis já curtiram este perfil ou não há
                    pet da mesma espécie com gênero oposto.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {compatibleLikePets.map((userPet) => {
                    const photo = getPetPhoto(userPet);
                    const isLiking = petPendingLike
                      ? likingPetIds.has(petPendingLike.id)
                      : false;

                    return (
                      <button
                        key={userPet.id}
                        type="button"
                        onClick={() => handleLikeWithPet(petPendingLike, userPet)}
                        disabled={isLiking}
                        className="flex w-full items-center gap-3 rounded-lg border border-stone-200 bg-white p-3 text-left transition hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="flex h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                          {photo ? (
                            <img
                              src={photo}
                              alt={userPet.nome}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-rose-600">
                              <PawPrint className="h-6 w-6" />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-gray-950">
                            {userPet.nome}
                          </span>
                          <span className="mt-0.5 block truncate text-sm text-gray-500">
                            {userPet.raca} • {userPet.genero}
                          </span>
                        </span>
                        <span className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white">
                          {isLiking ? 'Curtindo' : 'Curtir'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Search;
