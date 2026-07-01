import { Pet, User } from '../types';

export const calculatePetAge = (birthDate: string) => {
  const birth = new Date(birthDate);
  const today = new Date();
  const ageInMonths =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  if (ageInMonths < 12) {
    return `${ageInMonths} ${ageInMonths === 1 ? 'mês' : 'meses'}`;
  }

  const years = Math.floor(ageInMonths / 12);
  return `${years} ${years === 1 ? 'ano' : 'anos'}`;
};

export const getUserLocationLabel = (user?: User) => {
  if (!user) return 'Cidade pendente';

  const locationFromName = user.nome?.split(' - ')[1];
  if (locationFromName) return locationFromName;

  return user.localizacao_geo ? 'Localização definida' : 'Cidade pendente';
};

const hashString = (value: string) => {
  return value.split('').reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) % 9973;
  }, 7);
};

export const getPetStats = (pet: Pet) => {
  const hash = hashString(pet.id || pet.nome);
  return {
    views: 80 + (hash % 220),
    likes: 12 + (hash % 70),
    interested: 2 + (hash % 14),
  };
};

export const isVaccinated = (pet: Pet) => Boolean(pet.dados_saude?.vacinado);

export const isAvailableForBreeding = (pet: Pet) => {
  if (typeof pet.disponivel_reproducao === 'boolean') {
    return pet.disponivel_reproducao;
  }

  return pet.dados_saude?.castrado !== true;
};

export const getPetStatus = (pet: Pet) => {
  if (!isAvailableForBreeding(pet)) {
    return {
      label: 'Não disponível',
      className: 'bg-red-50 text-red-700 border-red-200',
    };
  }

  return {
    label: 'Disponível',
    className: 'bg-green-50 text-green-700 border-green-200',
  };
};

export const getPetPhoto = (pet?: Pet | null) => {
  return pet?.fotos && pet.fotos.length > 0 ? pet.fotos[0] : null;
};
