import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle, Heart, Eye, MapPin } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import { getUserLocationLabel } from '../lib/petPresentation';

interface Message {
  id: string;
  conteudo: string;
  enviada_em: string;
  fk_remetente_id: string;
  fk_conversa_id: string;
  remetente?: {
    id: string;
    nome: string;
  };
}

interface Conversation {
  id: string;
  fk_match_id?: string;
  criado_em: string;
  fk_participante_1_id: string;
  fk_participante_2_id: string;
  participante1: {
    id: string;
    nome: string;
    localizacao_geo?: string;
  };
  participante2: {
    id: string;
    nome: string;
    localizacao_geo?: string;
  };
  match: {
    id: string;
    pet1: {
      id: string;
      nome: string;
      especie: string;
      raca?: string;
      fotos?: string[] | string;
      fk_usuario_id?: string;
    };
    pet2: {
      id: string;
      nome: string;
      especie: string;
      raca?: string;
      fotos?: string[] | string;
      fk_usuario_id?: string;
    };
  };
  ultimaMensagem?: Message;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('match');
  const conversationId = searchParams.get('conversation');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    if (user) {
      // Conectar ao WebSocket
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const SOCKET_URL = API_URL.replace('/api', '');
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
      });

      newSocket.on('connect', () => {
        console.log('Conectado ao chat');
      });

      newSocket.on('newMessage', (message: Message) => {
        const activeConversation = selectedConversationRef.current;
        if (activeConversation && message.fk_conversa_id === activeConversation.id) {
          setMessages(prev => {
            if (prev.some(existingMessage => existingMessage.id === message.id)) {
              return prev;
            }

            return [...prev, message];
          });
        }

        setConversations(prev => prev.map(conversation =>
          conversation.id === message.fk_conversa_id
            ? { ...conversation, ultimaMensagem: message }
            : conversation
        ));
      });

      setSocket(newSocket);

      // Carregar conversas
      loadConversations();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if ((!matchId && !conversationId) || selectedConversation || conversations.length === 0) {
      return;
    }

    const conversationFromLink = conversations.find((conversation) => (
      conversation.id === conversationId ||
      conversation.fk_match_id === matchId ||
      conversation.match?.id === matchId
    ));

    if (conversationFromLink) {
      setSelectedConversation(conversationFromLink);
    }
  }, [conversationId, conversations, matchId, selectedConversation]);

  useEffect(() => {
    if (selectedConversation && socket) {
      // Entrar na sala da conversa
      socket.emit('joinConversation', { conversationId: selectedConversation.id });
      
      // Carregar mensagens da conversa
      loadMessages(selectedConversation.id);

      return () => {
        // Sair da sala da conversa
        socket.emit('leaveConversation', { conversationId: selectedConversation.id });
      };
    }
  }, [selectedConversation, socket]);

  const loadConversations = async () => {
    try {
      const conversations = await chatAPI.getConversations();
      setConversations(conversations);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const messages = await chatAPI.getMessages(conversationId);
      setMessages(messages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !socket) return;

    try {
      socket.emit('sendMessage', {
        conversationId: selectedConversation.id,
        conteudo: newMessage.trim(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.fk_participante_1_id === user?.id
      ? conversation.participante2
      : conversation.participante1;
  };

  const getOtherPet = (conversation: Conversation) => {
    if (conversation.match.pet1.fk_usuario_id && conversation.match.pet1.fk_usuario_id !== user?.id) {
      return conversation.match.pet1;
    }

    if (conversation.match.pet2.fk_usuario_id && conversation.match.pet2.fk_usuario_id !== user?.id) {
      return conversation.match.pet2;
    }

    return conversation.fk_participante_1_id === user?.id
      ? conversation.match.pet2
      : conversation.match.pet1;
  };

  const getPetImage = (pet: Conversation['match']['pet1']) => {
    if (Array.isArray(pet.fotos)) {
      return pet.fotos[0];
    }

    if (typeof pet.fotos === 'string') {
      try {
        const parsedPhotos = JSON.parse(pet.fotos);
        return Array.isArray(parsedPhotos) ? parsedPhotos[0] : null;
      } catch (error) {
        return null;
      }
    }

    return null;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
          {/* Lista de Conversas */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-pink-500" />
                Conversas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma conversa ainda</p>
                    <p className="text-sm">Faça matches para começar a conversar!</p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(conversation);
                    const otherPet = getOtherPet(conversation);
                    const otherPetImage = getPetImage(otherPet);
                    return (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-pink-50 border-pink-200' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="size-11">
                            {otherPetImage && <AvatarImage src={otherPetImage} alt={otherPet.nome} />}
                            <AvatarFallback className="bg-pink-100 text-pink-600">
                              {otherPet.nome.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-gray-900 truncate">
                                {otherPet.nome}
                              </p>
                              {conversation.ultimaMensagem && (
                                <span className="text-xs text-gray-400">
                                  {formatTime(conversation.ultimaMensagem.enviada_em)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {otherParticipant.nome} • {otherPet.raca || otherPet.especie}
                            </p>
                            {conversation.ultimaMensagem && (
                              <p className="text-xs text-gray-400 truncate">
                                {conversation.ultimaMensagem.conteudo}
                              </p>
                            )}
                          </div>
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </div>
                      </div>
                    );
                  })
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Área de Chat */}
          <Card className="md:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  {(() => {
                    const otherParticipant = getOtherParticipant(selectedConversation);
                    const otherPet = getOtherPet(selectedConversation);
                    const otherPetImage = getPetImage(otherPet);

                    return (
                  <CardTitle className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-11">
                      {otherPetImage && <AvatarImage src={otherPetImage} alt={otherPet.nome} />}
                      <AvatarFallback className="bg-pink-100 text-pink-600">
                        {otherPet.nome.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{otherPet.nome}</p>
                      <p className="flex items-center gap-1 text-sm text-gray-500 font-normal">
                        <MapPin className="h-3.5 w-3.5" />
                        {getUserLocationLabel(otherParticipant)} • Tutor: {otherParticipant.nome}
                      </p>
                    </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/pets/${otherPet.id}`}>
                        <Eye className="h-4 w-4" />
                        Ver Perfil
                      </Link>
                    </Button>
                  </CardTitle>
                    );
                  })()}
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100vh-16rem)]">
                  {/* Mensagens */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.fk_remetente_id === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.fk_remetente_id === user?.id
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.conteudo}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.fk_remetente_id === user?.id
                                  ? 'text-pink-100'
                                  : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.enviada_em)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input de Mensagem */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
