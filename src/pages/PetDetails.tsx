import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { petsAPI, matchesAPI } from '../services/api';
import { Pet } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, X, MapPin, Calendar, Dog, Cat, Shield, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const PetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [selectedUserPet, setSelectedUserPet] = useState<Pet | null>(null);

  useEffect(() => {
    if (id) {
      fetchPetDetails();
      fetchUserPets();
    }
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      const petData = await petsAPI.getById(id!);
      setPet(petData);
    } catch (error) {
      console.error('Erro ao carregar pet:', error);
      toast.error('Pet não encontrado.');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPets = async () => {
    try {
      const myPets = await petsAPI.getMyPets();
      setUserPets(myPets || []);
      if (myPets && myPets.length > 0) {
        setSelectedUserPet(myPets[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar seus pets:', error);
    }
  };

  const handleSwipe = async (action: 'like' | 'dislike') => {
    if (!selectedUserPet || !pet) return;

    try {
      const result = await matchesAPI.swipe(selectedUserPet.id, pet.id, action);
      
      if (action === 'like') {
        if (result.isMatch) {
          toast.success(`🎉 É um match! Você e ${pet.nome} se gostaram!`);
          navigate('/matches');
        } else {
          toast.success(`❤️ Você curtiu ${pet.nome}!`);
        }
      } else {
        toast.success(`Você passou em ${pet.nome}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao processar sua escolha.';
      toast.error(message);
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

  if (!pet) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Pet não encontrado</h2>
        <Button onClick={() => navigate('/search')}>Voltar para Busca</Button>
      </div>
    );
  }

  const isMyPet = user?.id === pet.fk_usuario_id;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Galeria de Fotos */}
        <div>
          {pet.fotos && pet.fotos.length > 0 ? (
            <div className="space-y-4">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <img
                  src={pet.fotos[0]}
                  alt={pet.nome}
                  className="w-full h-full object-cover"
                />
              </div>
              {pet.fotos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {pet.fotos.slice(1, 5).map((foto, index) => (
                    <div key={index} className="relative h-20 rounded overflow-hidden">
                      <img
                        src={foto}
                        alt={`${pet.nome} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <Heart className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{pet.nome}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {calculateAge(pet.data_nascimento)}
              </span>
              <span>{pet.raca}</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Espécie</p>
                  <p className="font-semibold">{pet.especie}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gênero</p>
                  <p className="font-semibold">{pet.genero}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Porte</p>
                  <p className="font-semibold">{pet.porte}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Raça</p>
                  <p className="font-semibold">{pet.raca}</p>
                </div>
              </div>

              {pet.pedigree && (
                <div className="flex items-center gap-2 text-pink-600">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold">Com Pedigree</span>
                </div>
              )}

              {pet.verificado_clinica && (
                <div className="flex items-center gap-2 text-green-600">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold">Verificado por Clínica</span>
                </div>
              )}

              {pet.descricao && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Descrição</p>
                  <p className="text-gray-700">{pet.descricao}</p>
                </div>
              )}

              {pet.dados_saude && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Dados de Saúde</p>
                  <div className="space-y-1">
                    {pet.dados_saude.vacinado && (
                      <p className="text-sm">✓ Vacinado</p>
                    )}
                    {pet.dados_saude.castrado !== undefined && (
                      <p className="text-sm">
                        {pet.dados_saude.castrado ? '✓ Castrado' : '✗ Não castrado'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {pet.usuario && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Dono</p>
                  <p className="font-semibold">{pet.usuario.nome}</p>
                  {pet.usuario.telefone && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {pet.usuario.telefone}
                    </p>
                  )}
                  {pet.usuario.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {pet.usuario.email}
                    </p>
                  )}
                </div>
              )}

              {pet.distancia_km && (
                <div className="flex items-center gap-2 text-pink-600">
                  <MapPin className="h-5 w-5" />
                  <span>{pet.distancia_km.toFixed(1)} km de distância</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações */}
          {!isMyPet && userPets.length > 0 && (
            <Card>
              <CardContent className="p-6">
                {userPets.length > 1 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fazer swipe com:
                    </label>
                    <select
                      value={selectedUserPet?.id || ''}
                      onChange={(e) => {
                        const pet = userPets.find(p => p.id === e.target.value);
                        setSelectedUserPet(pet || null);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    >
                      {userPets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 border-red-200 hover:border-red-300 hover:bg-red-50"
                    onClick={() => handleSwipe('dislike')}
                  >
                    <X className="h-5 w-5 mr-2 text-red-500" />
                    Passar
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-pink-500 hover:bg-pink-600"
                    onClick={() => handleSwipe('like')}
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Curtir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isMyPet && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">Este é seu próprio pet</p>
                <Link to="/my-pets">
                  <Button variant="outline" className="mt-4">
                    Gerenciar Meus Pets
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetDetails;


