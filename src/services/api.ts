import axios from 'axios';
import { AuthResponse, LoginData, RegisterData, User, Pet, CreatePetData, SearchPetsParams, PetsResponse, Match, Conversation, Message, NotificationItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: RegisterData): Promise<AuthResponse> =>
    api.post('/auth/register', data).then(res => res.data),
  
  login: (data: LoginData): Promise<AuthResponse> =>
    api.post('/auth/login', { email: data.email, senha: data.senha }).then(res => res.data),
  
  getProfile: (): Promise<User> =>
    api.get('/auth/profile').then(res => res.data),
};

// Users API
export const usersAPI = {
  getMe: (): Promise<User> =>
    api.get('/users/me').then(res => res.data),
  
  updateMe: (data: Partial<User>): Promise<User> =>
    api.patch('/users/me', data).then(res => res.data),

  uploadProfilePhoto: (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('foto', file);

    return api.post('/users/me/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  removeProfilePhoto: (): Promise<User> =>
    api.delete('/users/me/profile-photo').then(res => res.data),
  
  deleteMe: (): Promise<void> =>
    api.delete('/users/me').then(res => res.data),
};

export const getApiAssetUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^https?:\/\//.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Pets API
export const petsAPI = {
  create: (data: CreatePetData): Promise<Pet> =>
    api.post('/pets', data).then(res => res.data),
  
  getAll: (params?: SearchPetsParams): Promise<PetsResponse> =>
    api.get('/pets', { params }).then(res => res.data),
  
  getMyPets: (): Promise<Pet[]> =>
    api.get('/pets/my-pets').then(res => res.data),

  getSaved: (): Promise<Pet[]> =>
    api.get('/pets/saved').then(res => res.data),
  
  getById: (id: string): Promise<Pet> =>
    api.get(`/pets/${id}`).then(res => res.data),
  
  update: (id: string, data: Partial<CreatePetData>): Promise<Pet> =>
    api.patch(`/pets/${id}`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/pets/${id}`).then(res => res.data),

  save: (id: string): Promise<{ petId: string; salvo: boolean }> =>
    api.post(`/pets/${id}/save`).then(res => res.data),

  unsave: (id: string): Promise<{ petId: string; salvo: boolean }> =>
    api.delete(`/pets/${id}/save`).then(res => res.data),
};

// Matches API
export const matchesAPI = {
  swipe: (petId: string, targetPetId: string, action: 'like' | 'dislike') =>
    api.post(`/matches/swipe/${petId}`, { fk_pet_id_2: targetPetId, action }).then(res => res.data),
  
  getMyMatches: (): Promise<Match[]> =>
    api.get('/matches/my-matches').then(res => res.data),

  getMyStats: (): Promise<{ swipes: number; likes: number; matches: number }> =>
    api.get('/matches/my-stats').then(res => res.data),
  
  getPotentialMatches: (petId: string, limit?: number): Promise<Pet[]> =>
    api.get(`/matches/potential/${petId}`, { params: { limit } }).then(res => res.data),
  
  getById: (id: string): Promise<Match> =>
    api.get(`/matches/${id}`).then(res => res.data),
};

// Chat API
export const chatAPI = {
  sendMessage: (conversationId: string, conteudo: string): Promise<Message> =>
    api.post('/chat/send', { conversationId, conteudo }).then(res => res.data),
  
  getConversations: (): Promise<Conversation[]> =>
    api.get('/chat/conversations').then(res => res.data),
  
  getMessages: (conversationId: string): Promise<Message[]> =>
    api.get(`/chat/conversations/${conversationId}/messages`).then(res => res.data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params?: { limit?: number; unreadOnly?: boolean }): Promise<NotificationItem[]> =>
    api.get('/notifications', { params }).then(res => res.data),

  getUnreadCount: (): Promise<number> =>
    api.get('/notifications/unread-count').then(res => Number(res.data)),

  markAsRead: (id: string): Promise<NotificationItem> =>
    api.patch(`/notifications/${id}/read`).then(res => res.data),

  markAllAsRead: (): Promise<{ unreadCount: number }> =>
    api.patch('/notifications/read-all').then(res => res.data),
};

export default api;
