import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, User, LogOut, MessageCircle, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
              <div className="flex items-center space-x-2">
                <Link
                  to="/settings"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                  title="Configurações"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                <span className="text-gray-700 hidden sm:inline">Olá, {user?.nome}</span>
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
