import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Camera,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  Trash2,
  UserRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getApiAssetUrl, usersAPI } from '../services/api';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFormData({
      nome: user.nome || '',
      email: user.email || '',
      telefone: user.telefone || '',
    });
  }, [user]);

  if (!user) {
    return null;
  }

  const profilePhotoUrl = getApiAssetUrl(user.foto_perfil_url);
  const userInitial = user.nome?.charAt(0).toUpperCase() || 'U';
  const hasLocation = Boolean(user.localizacao_geo);
  const memberSince = user.criado_em
    ? new Date(user.criado_em).toLocaleDateString('pt-BR')
    : null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const updatedUser = await usersAPI.updateMe({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
      });
      setUser(updatedUser);
      toast.success('Perfil atualizado.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar perfil.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Escolha uma imagem.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const updatedUser = await usersAPI.uploadProfilePhoto(file);
      setUser(updatedUser);
      toast.success('Foto de perfil atualizada.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao enviar foto.';
      toast.error(message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveProfilePhoto = async () => {
    setRemovingPhoto(true);
    try {
      const updatedUser = await usersAPI.removeProfilePhoto();
      setUser(updatedUser);
      toast.success('Foto de perfil removida.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover foto.';
      toast.error(message);
    } finally {
      setRemovingPhoto(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="page-kicker">Conta</p>
        <h1 className="page-title mt-2">Meu perfil</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Mantenha seus dados atualizados para facilitar conversas e matches.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="soft-panel">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-28 w-28 border border-stone-200">
                {profilePhotoUrl && (
                  <AvatarImage src={profilePhotoUrl} alt={user.nome} />
                )}
                <AvatarFallback className="bg-rose-100 text-4xl font-semibold text-rose-700">
                  {userInitial}
                </AvatarFallback>
              </Avatar>

              <h2 className="mt-4 text-2xl font-semibold text-gray-950">
                {user.nome}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{user.email}</p>
              {memberSince && (
                <p className="mt-1 text-xs text-gray-400">
                  No PetMatch desde {memberSince}
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleProfilePhotoChange}
              />

              <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  <Camera className="h-4 w-4" />
                  {uploadingPhoto ? 'Enviando' : 'Trocar foto'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveProfilePhoto}
                  disabled={removingPhoto || !user.foto_perfil_url}
                >
                  <Trash2 className="h-4 w-4" />
                  {removingPhoto ? 'Removendo' : 'Remover'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="soft-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-rose-600" />
              Dados do tutor
            </CardTitle>
            <CardDescription>
              Essas informações aparecem para tutores em conversas e perfis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="soft-panel mt-6">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold text-gray-950">Localização</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {hasLocation
                  ? `Localização definida. Alcance atual: ${user.raio_maximo || 20} km.`
                  : 'Defina sua localização para melhorar sugestões próximas.'}
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/profile/location">
              <Settings className="h-4 w-4" />
              Configurações de localização
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
