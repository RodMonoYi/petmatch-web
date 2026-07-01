import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, PawPrint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RegisterData } from '../types';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
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
      await register(formData);
      navigate('/discover');
    } catch (error) {
      // Error is handled by the AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <div className="hidden lg:block">
          <p className="page-kicker">Primeiro passo</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-gray-950">
            Monte um perfil que ajude outros tutores a decidir.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-8 text-gray-600">
            Depois do cadastro, você pode adicionar seus pets, informar saúde,
            fotos e preferências de busca.
          </p>
        </div>

        <div className="w-full max-w-md justify-self-center space-y-6">
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <PawPrint className="h-6 w-6" />
              </span>
              <span className="text-3xl font-semibold text-gray-950">PetMatch</span>
            </Link>
            <h2 className="mt-6 text-2xl font-semibold text-gray-950">
              Criar conta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Já tem acesso?{' '}
              <Link
                to="/login"
                className="font-medium text-rose-700 hover:text-rose-800"
              >
                entre na sua conta
              </Link>
            </p>
          </div>

          <Card className="auth-card">
            <CardHeader>
              <CardTitle>Dados do tutor</CardTitle>
              <CardDescription>
                Comece pelo seu cadastro. O perfil do pet vem logo depois.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                  />
                </div>

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
                  <Label htmlFor="telefone">Telefone (opcional)</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      name="senha"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.senha}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Criando conta...' : 'Criar conta'}
                </Button>

                <div className="text-center text-xs leading-5 text-gray-500">
                  Ao criar uma conta, você concorda com nossos{' '}
                  <Link to="/terms" className="text-rose-700 hover:text-rose-800">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link to="/privacy" className="text-rose-700 hover:text-rose-800">
                    Política de Privacidade
                  </Link>
                  .
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="font-medium text-rose-700 hover:text-rose-800"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
