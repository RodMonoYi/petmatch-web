import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, ChevronDown, Heart, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const notificationCount = isAuthenticated ? 3 : 0;
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
                <button
                  type="button"
                  className="relative rounded-md p-2 text-gray-700 transition-colors hover:bg-pink-50 hover:text-pink-500"
                  aria-label="Notificações"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-semibold text-white">
                      {notificationCount}
                    </span>
                  )}
                </button>
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
