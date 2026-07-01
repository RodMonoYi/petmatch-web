import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bell,
  Bookmark,
  CheckCheck,
  ChevronDown,
  Compass,
  HeartHandshake,
  Info,
  LogOut,
  Menu,
  MessageCircle,
  PawPrint,
  Search as SearchIcon,
  UserRound,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationItem } from '../../types';
import { getApiAssetUrl } from '../../services/api';

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
  const location = useLocation();
  const userInitial = user?.nome?.charAt(0).toUpperCase() || 'U';
  const userPhotoUrl = getApiAssetUrl(user?.foto_perfil_url);
  const authenticatedNavItems = [
    { to: '/discover', label: 'Descobrir', icon: Compass },
    { to: '/search', label: 'Buscar', icon: SearchIcon },
    { to: '/matches', label: 'Matches', icon: HeartHandshake },
    { to: '/saved', label: 'Salvos', icon: Bookmark },
    { to: '/chat', label: 'Chat', icon: MessageCircle },
    { to: '/my-pets', label: 'Meus pets', icon: PawPrint },
    { to: '/profile', label: 'Meu perfil', icon: UserRound },
  ];
  const publicNavItems = [
    { to: '/', label: 'Sobre', icon: Info },
    { to: '/#como-funciona', label: 'Como funciona', icon: Compass },
  ];
  const isActiveRoute = (path: string) => {
    const pathname = path.split('#')[0];
    return location.pathname === pathname;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isAuthenticated ? '/discover' : '/'} className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <PawPrint className="h-5 w-5" />
            </span>
            <span className="truncate text-xl font-semibold text-gray-950 sm:text-2xl">
              PetMatch
            </span>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {isAuthenticated ? (
              <>
                {authenticatedNavItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-700',
                        isActiveRoute(item.to) && 'bg-rose-50 text-rose-700',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </>
            ) : (
              <>
                {publicNavItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-700',
                        isActiveRoute(item.to) && 'bg-rose-50 text-rose-700',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="relative rounded-md p-2 text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-700"
                      aria-label="Notificações"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-semibold text-white">
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
                                  !notification.lida && 'bg-rose-50/60',
                                )}
                              >
                                <span
                                  className={cn(
                                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                                    notification.tipo === 'match'
                                      ? 'bg-rose-100 text-rose-700'
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
                                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-600" />
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
                  to="/profile"
                  className="hidden text-gray-700 transition-colors hover:text-rose-700 md:block"
                  title="Meu perfil"
                >
                  <UserRound className="h-5 w-5" />
                </Link>
                <Link
                  to="/profile"
                  className="hidden items-center gap-2 rounded-md px-2 py-1.5 text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-700 lg:flex"
                >
                  <Avatar className="size-8">
                    {userPhotoUrl && <AvatarImage src={userPhotoUrl} alt={user?.nome || 'Perfil'} />}
                    <AvatarFallback className="bg-rose-100 text-sm font-semibold text-rose-700">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-32 truncate font-medium">{user?.nome}</span>
                  <ChevronDown className="h-4 w-4" />
                </Link>
                <Button variant="outline" onClick={handleLogout} className="hidden md:inline-flex">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="rounded-md p-2 text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-700 xl:hidden"
                      aria-label="Abrir menu"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent className="w-80 max-w-[85vw]">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                      <SheetDescription>
                        Acesse as áreas do PetMatch.
                      </SheetDescription>
                    </SheetHeader>
                    <nav className="flex flex-col gap-1 px-4">
                      {authenticatedNavItems.map((item) => {
                        const Icon = item.icon;

                        return (
                          <SheetClose key={item.to} asChild>
                            <Link
                              to={item.to}
                              className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-700',
                                isActiveRoute(item.to) && 'bg-rose-50 text-rose-700',
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </nav>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button variant="outline" asChild>
                          <Link to="/profile">
                            <UserRound className="h-4 w-4" />
                            Meu perfil
                          </Link>
                        </Button>
                      </SheetClose>
                      <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Sair
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden items-center space-x-2 md:flex">
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Cadastrar</Link>
                </Button>
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="rounded-md p-2 text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-700 xl:hidden"
                      aria-label="Abrir menu"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent className="w-80 max-w-[85vw]">
                    <SheetHeader>
                      <SheetTitle>PetMatch</SheetTitle>
                      <SheetDescription>
                        Encontre perfis e cuide das conversas em um só lugar.
                      </SheetDescription>
                    </SheetHeader>
                    <nav className="flex flex-col gap-1 px-4">
                      {publicNavItems.map((item) => {
                        const Icon = item.icon;

                        return (
                          <SheetClose key={item.label} asChild>
                            <Link
                              to={item.to}
                              className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-700',
                                isActiveRoute(item.to) && 'bg-rose-50 text-rose-700',
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </nav>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button variant="outline" asChild>
                          <Link to="/login">Entrar</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild>
                          <Link to="/register">Cadastrar</Link>
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
