import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { petsAPI } from '../services/api';
import { Pet, PetsResponse } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon, MapPin, Calendar, Dog, Cat, Heart, Filter, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Search: React.FC = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSelectedSpecies, setHasSelectedSpecies] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    especie: '',
    raca: '',
    genero: '',
    porte: '',
    searchTerm: '',
  });

  const [showFilters, setShowFilters] = useState(false);

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

      // Se tiver localização, usar para filtrar por distância
      if (user?.localizacao_geo) {
        try {
          const location = JSON.parse(user.localizacao_geo);
          params.latitude = location.latitude;
          params.longitude = location.longitude;
          params.raio = user.raio_maximo || 50; // Alcance maior para busca
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
    });
    setPets([]);
    setPage(1);
    setTotal(0);
    setTotalPages(1);
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

  // Tela inicial - seleção de espécie
  if (!hasSelectedSpecies) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Marketplace de Pets</h1>
          <p className="text-xl text-gray-600">Encontre pets para reprodução por raça, espécie e muito mais</p>
        </div>

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
          {(filters.raca || filters.genero || filters.porte || filters.searchTerm) && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Painel de filtros */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
          </Card>
        )}
      </div>

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
            {pets.map((pet) => (
              <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <Link to={`/pets/${pet.id}`}>
                  {pet.fotos && pet.fotos.length > 0 ? (
                    <div className="relative h-48">
                      <img
                        src={pet.fotos[0]}
                        alt={pet.nome}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {getSpeciesIcon(pet.especie)}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <Heart className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{pet.nome}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{pet.raca}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{pet.especie} • {pet.genero} • {pet.porte}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {calculateAge(pet.data_nascimento)}
                      </div>
                      {pet.descricao && (
                        <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                          {pet.descricao}
                        </p>
                      )}
                      {pet.pedigree && (
                        <div className="inline-block px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded mt-2">
                          Com Pedigree
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
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
