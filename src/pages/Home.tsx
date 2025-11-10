import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Users, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Heart,
      title: 'Matches Inteligentes',
      description: 'Algoritmo avançado que encontra os parceiros perfeitos para seu pet baseado em compatibilidade genética e comportamental.',
    },
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Verificação de perfis por clínicas parceiras e sistema de avaliações para garantir a segurança de todos.',
    },
    {
      icon: Users,
      title: 'Comunidade Ativa',
      description: 'Conecte-se com outros tutores responsáveis que compartilham o mesmo amor pelos animais.',
    },
    {
      icon: Star,
      title: 'Cruzamento Responsável',
      description: 'Promovemos práticas éticas de reprodução com foco na saúde e bem-estar dos animais.',
    },
  ];

  const benefits = [
    'Perfis verificados por veterinários',
    'Chat seguro e privado',
    'Histórico genético completo',
    'Agendamento de encontros',
    'Suporte especializado',
    'Certificados reprodutivos',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Conectando pets,
              <span className="text-pink-500"> criando laços</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A primeira plataforma de cruzamento responsável de animais domésticos.
              Encontre parceiros compatíveis para seu pet de forma segura e confiável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button size="lg" asChild className="text-lg px-8 py-3">
                  <Link to="/discover">
                    Começar a Descobrir
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="text-lg px-8 py-3">
                    <Link to="/register">
                      Cadastrar Gratuitamente
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="text-lg px-8 py-3">
                    <Link to="/login">Já tenho conta</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o PetMatch?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oferecemos a plataforma mais completa e segura para cruzamento responsável de pets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Tudo que você precisa em um só lugar
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nossa plataforma oferece todas as ferramentas necessárias para um cruzamento
                responsável e seguro, desde a busca até o acompanhamento pós-cruzamento.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-8 text-center">
                <Heart className="h-24 w-24 text-pink-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Mais de 1000+ matches realizados
                </h3>
                <p className="text-gray-600">
                  Tutores satisfeitos que encontraram parceiros perfeitos para seus pets
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para encontrar o parceiro ideal para seu pet?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Junte-se a milhares de tutores que já confiam no PetMatch para cruzamentos responsáveis.
          </p>
          {!isAuthenticated && (
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
              <Link to="/register">
                Começar Agora - É Grátis!
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

