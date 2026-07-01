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
      let filteredPets = response.pets;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredPets = response.pets.filter(pet => 
          pet.nome.toLowerCase().includes(term) ||
          pet.raca.toLowerCase().includes(term) ||
          pet.descricao?.toLowerCase().includes(term)
        );
      }

      setPets(filteredPets);
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
        return <Dog className="h-5 w-5 text-pink-500" />;
      case 'gato':
        return <Cat className="h-5 w-5 text-pink-500" />;
      default:
        return <Heart className="h-5 w-5 text-pink-500" />;
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

  const toggleFavorite = (petId: string) => {
    setFavoritePets((prev) => {
      const next = new Set(prev);
      if (next.has(petId)) {
        next.delete(petId);
      } else {
        next.add(petId);
      }
      return next;
    });
  };

  const handleQuickLike = async (pet: Pet) => {
    const compatiblePet = userPets.find((userPet) => (
      userPet.especie === pet.especie &&
      userPet.genero !== pet.genero &&
      userPet.id !== pet.id
    ));

    if (!compatiblePet) {
      toast.error('Cadastre ou selecione um pet compatível para curtir.');
      return;
    }

    try {
      const result = await matchesAPI.swipe(compatiblePet.id, pet.id, 'like');
      if (result.isMatch) {
        toast.success(`É um match com ${pet.nome}!`);
      } else {
        toast.success(`Você curtiu ${pet.nome}.`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao curtir pet.';
      toast.error(message);
    }
  };

  // Tela inicial - seleção de espécie
  if (!hasSelectedSpecies) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Marketplace de Pets</h1>
          <p className="text-xl text-gray-600">Encontre pets para reprodução por raça, espécie e muito mais</p>
        </div>

        <SponsorSlot className="mb-6" />

        <Card className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Qual espécie você deseja buscar?</h2>
            <p className="text-gray-600 mb-8">Selecione uma espécie para começar a busca</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Button
              variant="outline"
              size="lg"
              className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-pink-50 hover:border-pink-300 transition-colors"
              onClick={() => handleSpeciesSelection('Cão')}
            >
              <Dog className="h-12 w-12 text-pink-500" />
              <span className="text-lg font-semibold">Cães</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-pink-50 hover:border-pink-300 transition-colors"
              onClick={() => handleSpeciesSelection('Gato')}
            >
              <Cat className="h-12 w-12 text-pink-500" />
              <span className="text-lg font-semibold">Gatos</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-pink-50 hover:border-pink-300 transition-colors"
              onClick={() => handleSpeciesSelection('all')}
            >
              <Heart className="h-12 w-12 text-pink-500" />
              <span className="text-lg font-semibold">Todas</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Tela de busca com resultados
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Marketplace de Pets</h1>
          <p className="text-gray-600">
            Buscando: <span className="font-semibold">
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
      <div className="mb-6 space-y-4">
        {/* Busca por texto */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar por nome, raça ou descrição..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Botão de filtros */}
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
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Painel de filtros */}
        {showFilters && (
          <Card className="p-4">
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-20">
          <SearchIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nenhum pet encontrado</h2>
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

              return (
              <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {pet.fotos && pet.fotos.length > 0 ? (
                    <img
                      src={pet.fotos[0]}
                      alt={pet.nome}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Heart className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2 rounded-full bg-white p-2 shadow-sm">
                    {getSpeciesIcon(pet.especie)}
                  </div>
                  <Badge variant="outline" className={`absolute left-2 top-2 border ${status.className}`}>
                    {status.label}
                  </Badge>
                </div>
                  
                <CardContent className="space-y-4 p-4">
                  <div>
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg leading-tight">{pet.nome}</h3>
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

                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleQuickLike(pet)}>
                      <Heart className="h-4 w-4 text-pink-500" />
                      Curtir
                    </Button>
                    <Button
                      size="sm"
                      variant={isFavorite ? 'default' : 'outline'}
                      onClick={() => toggleFavorite(pet.id)}
                    >
                      <Star className="h-4 w-4" />
                      Salvar
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
    </div>
  );
};

export default Search;
