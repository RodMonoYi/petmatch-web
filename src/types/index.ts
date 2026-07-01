export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  localizacao_geo?: string; // JSON: { latitude: number, longitude: number }
  raio_maximo?: number; // Alcance máximo em km (5, 10, 20, 50, 100)
  criado_em: string;
  atualizado_em: string;
}

export interface Pet {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  data_nascimento: string;
  genero: string;
  porte: string;
  descricao?: string;
  fotos?: string[];
  pedigree: boolean;
  dados_saude?: any;
  verificado_clinica: boolean;
  disponivel_reproducao?: boolean;
  aceita_viagem?: boolean;
  fk_usuario_id: string;
  usuario?: User;
  distancia_km?: number; // Distância em km (adicionado no getPotentialMatches)
  curtidas_count?: number;
  curtido?: boolean;
  curtido_por_pet_ids?: string[];
  salvo?: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Match {
  id: string;
  status: string;
  criado_em: string;
  fk_pet_id_1: string;
  fk_pet_id_2: string;
  pet1: Pet;
  pet2: Pet;
  conversa?: Conversation;
}

export interface Conversation {
  id: string;
  fk_match_id: string;
  fk_participante_1_id: string;
  fk_participante_2_id: string;
  criado_em: string;
  match?: Match;
  participante1?: User;
  participante2?: User;
  mensagens?: Message[];
  ultimaMensagem?: Message;
}

export interface Message {
  id: string;
  conteudo: string;
  enviada_em: string;
  fk_conversa_id: string;
  fk_remetente_id: string;
  remetente?: User;
}

export type NotificationType = 'like' | 'match' | 'message';

export interface NotificationItem {
  id: string;
  tipo: NotificationType;
  titulo: string;
  mensagem: string;
  lida: boolean;
  dados?: {
    matchId?: string;
    conversationId?: string;
    messageId?: string;
    senderId?: string;
    sourcePetId?: string;
    targetPetId?: string;
    petId?: string;
  } | null;
  criado_em: string;
  lida_em?: string | null;
  fk_usuario_id: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface CreatePetData {
  nome: string;
  especie: string;
  raca: string;
  data_nascimento: string;
  genero: string;
  porte: string;
  descricao?: string;
  fotos?: string[];
  pedigree?: boolean;
  dados_saude?: any;
  disponivel_reproducao?: boolean;
  aceita_viagem?: boolean;
}

export interface SearchPetsParams {
  especie?: string;
  raca?: string;
  genero?: string;
  porte?: string;
  pedigree?: boolean;
  vacinado?: boolean;
  disponivel_reproducao?: boolean;
  aceita_viagem?: boolean;
  idade_min?: number;
  idade_max?: number;
  latitude?: number;
  longitude?: number;
  raio?: number;
  page?: number;
  limit?: number;
}

export interface PetsResponse {
  pets: Pet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
