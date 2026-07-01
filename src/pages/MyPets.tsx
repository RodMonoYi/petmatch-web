import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { petsAPI } from '../services/api';
import { Pet, CreatePetData } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PlusCircle,
  Edit,
  Trash2,
  Dog,
  Cat,
  Bird,
  Rabbit,
  PawPrint,
  Trophy,
  MapPin,
  Syringe,
  Heart,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import SponsorSlot from '../components/ads/SponsorSlot';
import {
  getPetStats,
  getPetStatus,
  getUserLocationLabel,
  isAvailableForBreeding,
  isVaccinated,
} from '../lib/petPresentation';

const MyPets: React.FC = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState<CreatePetData>({
    nome: '',
    especie: '',
    raca: '',
    data_nascimento: '',
    genero: '',
    porte: '',
    descricao: '',
    fotos: [],
    pedigree: false,
    dados_saude: null,
    disponivel_reproducao: true,
    aceita_viagem: false,
  });

  useEffect(() => {
    if (user) {
      fetchMyPets();
    }
  }, [user]);

  const fetchMyPets = async () => {
    setLoading(true);
    try {
      const myPets = await petsAPI.getMyPets();
      setPets(myPets);
    } catch (error) {
      toast.error('Erro ao carregar seus pets.');
      console.error('Erro ao carregar pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPhotos = filesArray.map(file => URL.createObjectURL(file)); // Convert to URL for preview
      setFormData(prev => ({
        ...prev,
        fotos: [...(prev.fotos || []), ...newPhotos],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentPet) {
        // Update pet
        await petsAPI.update(currentPet.id, formData);
        toast.success('Pet atualizado com sucesso!');
      } else {
        // Create new pet
        await petsAPI.create(formData);
        toast.success('Pet cadastrado com sucesso!');
      }
      setIsModalOpen(false);
      fetchMyPets();
    } catch (error) {
      toast.error('Erro ao salvar o pet.');
      console.error('Erro ao salvar pet:', error);
    }
  };

  const handleDelete = async (petId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pet?')) {
      try {
        await petsAPI.delete(petId);
        toast.success('Pet excluído com sucesso!');
        fetchMyPets();
      } catch (error) {
        toast.error('Erro ao excluir o pet.');
        console.error('Erro ao excluir pet:', error);
      }
    }
  };

  const openCreateModal = () => {
    setCurrentPet(null);
    setFormData({
      nome: '',
      especie: '',
      raca: '',
      data_nascimento: '',
      genero: '',
      porte: '',
      descricao: '',
      fotos: [],
      pedigree: false,
      dados_saude: null,
      disponivel_reproducao: true,
      aceita_viagem: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pet: Pet) => {
    setCurrentPet(pet);
    setFormData({
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      data_nascimento: pet.data_nascimento.split('T')[0], // Format date for input
      genero: pet.genero,
      porte: pet.porte,
      descricao: pet.descricao || '',
      fotos: pet.fotos || [],
      pedigree: pet.pedigree,
      dados_saude: pet.dados_saude || null,
      disponivel_reproducao: isAvailableForBreeding(pet),
      aceita_viagem: Boolean(pet.aceita_viagem),
    });
    setIsModalOpen(true);
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
        <h1 className="text-3xl font-bold text-gray-800">Meus Pets</h1>
        <Button onClick={openCreateModal}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Adicionar Novo Pet
        </Button>
      </div>

      <SponsorSlot variant="compact" className="mb-6" />

      {pets.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">Você ainda não tem pets cadastrados.</p>
          <p className="text-md text-gray-500">Clique em "Adicionar Novo Pet" para começar!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => {
            const stats = getPetStats(pet);
            const status = getPetStatus(pet);
            return (
            <Card key={pet.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 bg-gray-100">
                {pet.fotos && pet.fotos.length > 0 ? (
                  <img
                    src={pet.fotos[0]}
                    alt={pet.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PawPrint className="h-14 w-14 text-gray-300" />
                  </div>
                )}
                <Badge variant="outline" className={`absolute left-3 top-3 border ${status.className}`}>
                  {status.label}
                </Badge>
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold flex min-w-0 items-center gap-2">
                  {getSpeciesIcon(pet.especie)} {pet.nome}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(pet)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(pet.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {pet.pedigree && (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                      <Trophy className="h-3 w-3" />
                      Pedigree
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">
                    <MapPin className="h-3 w-3" />
                    {getUserLocationLabel(pet.usuario)}
                  </Badge>
                  {isVaccinated(pet) && (
                    <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                      <Syringe className="h-3 w-3" />
                      Vacinado
                    </Badge>
                  )}
                  <Badge variant="outline" className={status.className}>
                    <Heart className="h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600"><b>Raça:</b> {pet.raca}</p>
                  <p className="text-sm text-gray-600"><b>Gênero:</b> {pet.genero}</p>
                  <p className="text-sm text-gray-600"><b>Porte:</b> {pet.porte}</p>
                </div>
                {pet.descricao && <p className="text-sm text-gray-600 mt-2"><b>Descrição:</b> {pet.descricao}</p>}

                <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3 text-center text-xs text-gray-600">
                  <div>
                    <Eye className="mx-auto mb-1 h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">{stats.views}</span>
                    <p>visitas</p>
                  </div>
                  <div>
                    <Heart className="mx-auto mb-1 h-4 w-4 text-pink-500" />
                    <span className="font-semibold text-gray-900">{pet.curtidas_count || 0}</span>
                    <p>curtidas</p>
                  </div>
                  <div>
                    <MessageCircle className="mx-auto mb-1 h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-gray-900">{stats.interested}</span>
                    <p>interesses</p>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link to={`/pets/${pet.id}`}>
                    <Eye className="h-4 w-4" />
                    Ver Perfil
                  </Link>
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentPet ? 'Editar Pet' : 'Adicionar Novo Pet'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">Nome</Label>
              <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="especie" className="text-right">Espécie</Label>
              <Select name="especie" value={formData.especie} onValueChange={(value) => handleSelectChange('especie', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a espécie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cão">Cão</SelectItem>
                  <SelectItem value="Gato">Gato</SelectItem>
                  <SelectItem value="Pássaro">Pássaro</SelectItem>
                  <SelectItem value="Coelho">Coelho</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="raca" className="text-right">Raça</Label>
              <Input id="raca" name="raca" value={formData.raca} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data_nascimento" className="text-right">Data de Nascimento</Label>
              <Input id="data_nascimento" name="data_nascimento" type="date" value={formData.data_nascimento} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="genero" className="text-right">Gênero</Label>
              <Select name="genero" value={formData.genero} onValueChange={(value) => handleSelectChange('genero', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Macho">Macho</SelectItem>
                  <SelectItem value="Fêmea">Fêmea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="porte" className="text-right">Porte</Label>
              <Select name="porte" value={formData.porte} onValueChange={(value) => handleSelectChange('porte', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o porte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pequeno">Pequeno</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">Descrição</Label>
              <Textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fotos" className="text-right">Fotos</Label>
              <Input id="fotos" name="fotos" type="file" multiple onChange={handleFileChange} className="col-span-3" />
            </div>
            {formData.fotos && formData.fotos.length > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-1"></div>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {formData.fotos.map((photo, index) => (
                    <img key={index} src={photo} alt="Preview" className="w-24 h-24 object-cover rounded-md" />
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pedigree" className="text-right">Pedigree</Label>
              <input id="pedigree" name="pedigree" type="checkbox" checked={formData.pedigree} onChange={handleCheckboxChange} className="col-span-3 w-4 h-4" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="disponivel_reproducao" className="text-right">Disponível</Label>
              <input id="disponivel_reproducao" name="disponivel_reproducao" type="checkbox" checked={Boolean(formData.disponivel_reproducao)} onChange={handleCheckboxChange} className="col-span-3 w-4 h-4" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="aceita_viagem" className="text-right">Aceita viagem</Label>
              <input id="aceita_viagem" name="aceita_viagem" type="checkbox" checked={Boolean(formData.aceita_viagem)} onChange={handleCheckboxChange} className="col-span-3 w-4 h-4" />
            </div>
          </form>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>{currentPet ? 'Salvar Alterações' : 'Cadastrar Pet'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPets;
