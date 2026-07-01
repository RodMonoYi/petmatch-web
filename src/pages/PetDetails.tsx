import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { petsAPI, matchesAPI } from '../services/api';
import { Pet } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Heart,
  X,
  MapPin,
  Calendar,
  Shield,
  Phone,
  Mail,
  Star,
  MessageCircle,
  Flag,
  Syringe,
  Trophy,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SponsorSlot from '../components/ads/SponsorSlot';
import {
  calculatePetAge,
  getPetStatus,
  getUserLocationLabel,
  isVaccinated,
} from '../lib/petPresentation';

const PetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [selectedUserPet, setSelectedUserPet] = useState<Pet | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (id) {
      setSelectedUserPet(null);
      fetchPetDetails();
      fetchUserPets();
    }
  }, [id]);

  useEffect(() => {
    if (!pet || userPets.length === 0) return;

    const compatiblePet = userPets.find((userPet) => (
      userPet.especie === pet.especie &&
      userPet.genero !== pet.genero &&
      userPet.id !== pet.id
    ));
    const sameSpeciesPet = userPets.find((userPet) => (
      userPet.especie === pet.especie &&
      userPet.id !== pet.id
    ));

    if (!selectedUserPet) {
      setSelectedUserPet(compatiblePet || sameSpeciesPet || userPets[0]);
      return;
    }

  }, [pet, selectedUserPet, userPets]);

  const fetchPetDetails = async () => {
    try {
      const petData = await petsAPI.getById(id!);
      setPet(petData);
      setIsSaved(Boolean(petData.salvo));
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
    } catch (error) {
      console.error('Erro ao carregar seus pets:', error);
    }
  };

  const handleSwipe = async (action: 'like' | 'dislike') => {
    if (!selectedUserPet || !pet) return;

    if (selectedUserPet.especie !== pet.especie) {
      toast.error('Você precisa selecionar um pet da mesma espécie.');
      return;
    }

    if (selectedUserPet.genero === pet.genero) {
      toast.error('Para reprodução, os pets precisam ter gêneros opostos.');
      return;
    }

    const isLikedBySelectedPet = Boolean(
      selectedUserPet && pet.curtido_por_pet_ids?.includes(selectedUserPet.id),
    );

    if (action === 'like' && isLikedBySelectedPet) {
      toast('Você já curtiu este pet.');
      return;
    }

    if (action === 'like') {
      setLiking(true);
    }

    try {
      const result = await matchesAPI.swipe(selectedUserPet.id, pet.id, action);
      
      if (action === 'like') {
        setPet((currentPet) =>
          {
            if (!currentPet || !selectedUserPet) return currentPet;

            const likedByPetIds = new Set(currentPet.curtido_por_pet_ids || []);
            likedByPetIds.add(selectedUserPet.id);

            return {
              ...currentPet,
              curtido: true,
              curtido_por_pet_ids: Array.from(likedByPetIds),
              curtidas_count: result.alreadySwiped
                ? currentPet.curtidas_count
                : (currentPet.curtidas_count || 0) + 1,
            };
          },
        );

        if (result.isMatch) {
          toast.success(`🎉 É um match! Você e ${pet.nome} se gostaram!`);
          navigate('/matches');
        } else if (result.alreadySwiped) {
          toast('Você já curtiu este pet.');
        } else {
          toast.success(`❤️ Você curtiu ${pet.nome}!`);
        }
      } else {
        toast.success(`Você passou em ${pet.nome}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao processar sua escolha.';
      toast.error(message);
    } finally {
      if (action === 'like') {
        setLiking(false);
      }
    }
  };

  const handleToggleSave = async () => {
    if (!pet) return;

    if (isMyPet) {
      toast.error('Seu próprio pet já fica disponível em Meus Pets.');
      return;
    }

    const previousSaved = isSaved;
    setSaving(true);
    setIsSaved(!previousSaved);
    setPet((currentPet) =>
      currentPet ? { ...currentPet, salvo: !previousSaved } : currentPet,
    );

    try {
      if (previousSaved) {
        await petsAPI.unsave(pet.id);
        toast.success(`${pet.nome} removido dos salvos.`);
      } else {
        await petsAPI.save(pet.id);
        toast.success(`${pet.nome} salvo.`);
      }
    } catch (error: any) {
      setIsSaved(previousSaved);
      setPet((currentPet) =>
        currentPet ? { ...currentPet, salvo: previousSaved } : currentPet,
      );
      const message = error.response?.data?.message || 'Erro ao atualizar salvos.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-rose-600"></div>
          <p className="mt-4 text-sm text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="empty-state">
          <h2 className="text-2xl font-semibold text-gray-950 mb-4">Pet não encontrado</h2>
          <Button onClick={() => navigate('/search')}>Voltar para busca</Button>
        </div>
      </div>
    );
  }

  const isMyPet = user?.id === pet.fk_usuario_id;
  const status = getPetStatus(pet);
  const isLiked = Boolean(
    selectedUserPet && pet.curtido_por_pet_ids?.includes(selectedUserPet.id),
  );
  const selectedPetCompatibility = (() => {
    if (!selectedUserPet) {
      return {
        canLike: false,
        message: 'Cadastre um pet para curtir perfis compatíveis.',
      };
    }

    if (selectedUserPet.especie !== pet.especie) {
      return {
        canLike: false,
        message: 'Selecione um pet da mesma espécie para tentar um match.',
      };
    }

    if (selectedUserPet.genero === pet.genero) {
      return {
        canLike: false,
        message: 'Para reprodução, os pets precisam ter gêneros opostos.',
      };
    }

    return {
      canLike: true,
      message: '',
    };
  })();
  const likeButtonDisabled =
    isMyPet ||
    userPets.length === 0 ||
    isLiked ||
    liking ||
    !selectedPetCompatibility.canLike;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div>
          {pet.fotos && pet.fotos.length > 0 ? (
            <div className="space-y-4">
              <div className="relative h-[28rem] overflow-hidden rounded-lg border border-stone-200 bg-gray-100 shadow-sm">
                <img
                  src={pet.fotos[0]}
                  alt={pet.nome}
                  className="w-full h-full object-cover"
                />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className={`border ${status.className}`}>
                    {status.label}
                  </Badge>
                  {pet.verificado_clinica && (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      Verificado
                    </Badge>
                  )}
                </div>
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
            <div className="flex h-[28rem] items-center justify-center rounded-lg border border-stone-200 bg-gray-100">
              <Heart className="h-24 w-24 text-gray-400" />
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Button onClick={() => handleSwipe('like')} disabled={likeButtonDisabled}>
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-white' : ''}`} />
              {isLiked ? 'Curtido' : liking ? 'Curtindo' : 'Curtir'}
            </Button>
            <Button
              variant={isSaved ? 'default' : 'outline'}
              onClick={handleToggleSave}
              disabled={saving || isMyPet}
            >
              <Star className={`h-4 w-4 ${isSaved ? 'fill-white' : ''}`} />
              {isSaved ? 'Salvo' : saving ? 'Salvando' : 'Salvar'}
            </Button>
            <Button variant="outline" onClick={() => toast('Faça match para liberar o chat.')}>
              <MessageCircle className="h-4 w-4" />
              Mensagem
            </Button>
            <Button variant="outline" onClick={() => toast.success('Denúncia registrada para análise.')}>
              <Flag className="h-4 w-4" />
              Denunciar
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="page-kicker">Perfil do pet</p>
            <h1 className="mt-2 text-4xl font-semibold text-gray-950">{pet.nome}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {calculatePetAge(pet.data_nascimento)}
              </span>
              <span>{pet.raca}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {getUserLocationLabel(pet.usuario)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
                <Heart className="h-3 w-3" />
                {pet.curtidas_count || 0} {(pet.curtidas_count || 0) === 1 ? 'curtida' : 'curtidas'}
              </Badge>
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
          </div>

          <SponsorSlot variant="compact" />

          <Card className="soft-panel">
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
                <div className="flex items-center gap-2 text-rose-700">
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

              <div>
                <p className="text-sm text-gray-500 mb-3">Linha do tempo</p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Clock className="mt-0.5 h-4 w-4 text-rose-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Cadastro do perfil</p>
                      <p className="text-xs text-gray-500">{new Date(pet.criado_em).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  {pet.dados_saude?.ultima_consulta && (
                    <div className="flex gap-3">
                      <Syringe className="mt-0.5 h-4 w-4 text-sky-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Última consulta</p>
                        <p className="text-xs text-gray-500">
                          {new Date(pet.dados_saude.ultima_consulta).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}
                  {pet.pedigree && (
                    <div className="flex gap-3">
                      <Trophy className="mt-0.5 h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Pedigree informado</p>
                        <p className="text-xs text-gray-500">Documento disponível no perfil</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
                <div className="flex items-center gap-2 text-rose-700">
                  <MapPin className="h-5 w-5" />
                  <span>{pet.distancia_km.toFixed(1)} km de distância</span>
                </div>
              )}
            </CardContent>
          </Card>

          {!isMyPet && userPets.length > 0 && (
            <Card className="soft-panel">
              <CardContent className="p-6">
                {userPets.length > 1 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Curtir usando:
                    </label>
                    <select
                      value={selectedUserPet?.id || ''}
                      onChange={(e) => {
                        const pet = userPets.find(p => p.id === e.target.value);
                        setSelectedUserPet(pet || null);
                      }}
                      className="w-full rounded-md border border-stone-300 bg-white p-2 text-sm focus:border-rose-500 focus:ring-rose-500"
                    >
                      {userPets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                          {p.especie !== pet.especie
                            ? ' - espécie diferente'
                            : p.genero === pet.genero
                              ? ' - mesmo gênero'
                              : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {!selectedPetCompatibility.canLike && (
                  <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {selectedPetCompatibility.message}
                  </p>
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
                    className="flex-1 bg-rose-600 hover:bg-rose-700"
                    onClick={() => handleSwipe('like')}
                    disabled={likeButtonDisabled}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-white' : ''}`} />
                    {isLiked ? 'Curtido' : liking ? 'Curtindo' : 'Curtir'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isMyPet && (
            <Card className="soft-panel">
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


