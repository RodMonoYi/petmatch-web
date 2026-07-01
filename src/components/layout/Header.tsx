import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Bell,
  CheckCheck,
  ChevronDown,
  Heart,
  HeartHandshake,
  LogOut,
  MessageCircle,
  PawPrint,
  Settings,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationItem } from '../../types';

const getNotificationPath = (notification: NotificationItem) => {
  if (notification.tipo === 'message' && notification.dados?.conversationId) {
    return `/chat?conversation=${notification.dados.conversationId}`;
  }

  if (notification.tipo === 'match') {
    if (notification.dados?.conversationId) {
      return `/chat?conversation=${notification.dados.conversationId}`;
    }

    if (notification.dados?.matchId) {
      return `/chat?match=${notification.dados.matchId}`;
    }

    return '/matches';
  }

  if (notification.tipo === 'like' && notification.dados?.sourcePetId) {
    return `/pets/${notification.dados.sourcePetId}`;
  }

  return '/discover';
};

const getNotificationIcon = (notification: NotificationItem) => {
  if (notification.tipo === 'message') {
    return MessageCircle;
  }

  if (notification.tipo === 'match') {
    return HeartHandshake;
  }

  return PawPrint;
};

const formatNotificationDate = (date: string) =>
  new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();
  const navigate = useNavigate();
  const userInitial = user?.nome?.charAt(0).toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-pink-500" />
            <span className="text-2xl font-bold text-gray-900">PetMatch</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/discover"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  Descobrir
                </Link>
                <Link
                  to="/search"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  Buscar
                </Link>
                <Link
                  to="/matches"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  Matches
                </Link>
                <Link
                  to="/chat"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  Chat
                </Link>
                <Link
                  to="/my-pets"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  Meus Pets
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/sobre"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  Sobre
                </Link>
                <Link
                  to="/sobre"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  Como Funciona
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="relative rounded-md p-2 text-gray-700 transition-colors hover:bg-pink-50 hover:text-pink-500"
                      aria-label="Notificações"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-semibold text-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-96 max-w-[calc(100vw-2rem)] p-0"
                  >
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900">
                          Notificações
                        </h2>
                        <p className="text-xs text-gray-500">
                          {unreadCount === 1
                            ? '1 não lida'
                            : `${unreadCount} não lidas`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="h-8 px-2 text-xs"
                      >
                        <CheckCheck className="mr-1 h-4 w-4" />
                        Marcar lidas
                      </Button>
                    </div>

                    <ScrollArea className="max-h-96">
                      {loading && notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                          Carregando notificações...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                          <p className="text-sm font-medium text-gray-700">
                            Sem notificações
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notification) => {
                            const Icon = getNotificationIcon(notification);

                            return (
                              <Link
                                key={notification.id}
                                to={getNotificationPath(notification)}
                                onClick={() => markAsRead(notification.id)}
                                className={cn(
                                  'flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50',
                                  !notification.lida && 'bg-pink-50/60',
                                )}
                              >
                                <span
                                  className={cn(
                                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                                    notification.tipo === 'match'
                                      ? 'bg-pink-100 text-pink-600'
                                      : notification.tipo === 'message'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-amber-100 text-amber-700',
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-start justify-between gap-3">
                                    <span className="truncate text-sm font-semibold text-gray-900">
                                      {notification.titulo}
                                    </span>
                                    {!notification.lida && (
                                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pink-500" />
                                    )}
                                  </span>
                                  <span className="mt-0.5 line-clamp-2 text-sm leading-5 text-gray-600">
                                    {notification.mensagem}
                                  </span>
                                  <span className="mt-1 block text-xs text-gray-400">
                                    {formatNotificationDate(notification.criado_em)}
                                  </span>
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                <Link
                  to="/settings"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                  title="Configurações"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                <Link
                  to="/settings"
                  className="hidden items-center gap-2 rounded-md px-2 py-1.5 text-gray-700 transition-colors hover:bg-gray-50 hover:text-pink-500 sm:flex"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-pink-100 text-sm font-semibold text-pink-700">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-32 truncate font-medium">{user?.nome}</span>
                  <ChevronDown className="h-4 w-4" />
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
