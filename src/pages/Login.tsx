import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, PawPrint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginData } from '../types';
import AuthVisual from '../components/auth/AuthVisual';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    senha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      navigate('/discover');
    } catch (error) {
      // Error is handled by the AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <AuthVisual
          kicker="Sua área"
          title="Continue de onde parou."
          description="Veja curtidas recebidas, perfis salvos, matches e conversas sem precisar refazer a busca."
        />

        <div className="w-full max-w-md justify-self-center space-y-6">
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <PawPrint className="h-6 w-6" />
              </span>
              <span className="text-3xl font-semibold text-gray-950">PetMatch</span>
            </Link>
            <h2 className="mt-6 text-2xl font-semibold text-gray-950">
              Entrar na conta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Novo por aqui?{' '}
              <Link
                to="/register"
                className="font-medium text-rose-700 hover:text-rose-800"
              >
                crie seu acesso
              </Link>
            </p>
          </div>

          <Card className="auth-card">
            <CardHeader>
              <CardTitle>Dados de acesso</CardTitle>
              <CardDescription>
                Use o email cadastrado para voltar ao PetMatch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      name="senha"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.senha}
                      onChange={handleChange}
                      placeholder="Sua senha"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-rose-700 hover:text-rose-800"
                  >
                    Esqueci minha senha
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-600">
            Ainda não tem conta?{' '}
            <Link
              to="/register"
              className="font-medium text-rose-700 hover:text-rose-800"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
