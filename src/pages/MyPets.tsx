import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { petsAPI } from '../services/api';
import { Pet, CreatePetData } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Dog, Cat, Bird, Rabbit, PawPrint } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

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
    });
    setIsModalOpen(true);
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

      {pets.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">Você ainda não tem pets cadastrados.</p>
          <p className="text-md text-gray-500">Clique em "Adicionar Novo Pet" para começar!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              {pet.fotos && pet.fotos.length > 0 && (
                <img
                  src={pet.fotos[0]}
                  alt={pet.nome}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
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
              <CardContent>
                <p className="text-sm text-gray-600"><b>Espécie:</b> {pet.especie}</p>
                <p className="text-sm text-gray-600"><b>Raça:</b> {pet.raca}</p>
                <p className="text-sm text-gray-600"><b>Gênero:</b> {pet.genero}</p>
                <p className="text-sm text-gray-600"><b>Porte:</b> {pet.porte}</p>
                {pet.descricao && <p className="text-sm text-gray-600 mt-2"><b>Descrição:</b> {pet.descricao}</p>}
              </CardContent>
            </Card>
          ))}
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
                  <SelectItem value="cachorro">Cachorro</SelectItem>
                  <SelectItem value="gato">Gato</SelectItem>
                  <SelectItem value="passaro">Pássaro</SelectItem>
                  <SelectItem value="coelho">Coelho</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
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
                  <SelectItem value="macho">Macho</SelectItem>
                  <SelectItem value="femea">Fêmea</SelectItem>
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
                  <SelectItem value="pequeno">Pequeno</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="grande">Grande</SelectItem>
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

