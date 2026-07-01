import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle,
  HeartHandshake,
  MapPin,
  MessageCircle,
  PawPrint,
  Search,
  Shield,
  Star,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SponsorSlot from '../components/ads/SponsorSlot';
import heroImage from '../assets/petmatch-hero.webp';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: PawPrint,
      title: 'Perfis com contexto',
      description:
        'Fotos, idade, porte, raça, localização, saúde informada e preferências do tutor no mesmo lugar.',
    },
    {
      icon: HeartHandshake,
      title: 'Compatibilidade clara',
      description:
        'O app evita ações incompatíveis e mostra por que um match não pode acontecer quando houver restrição.',
    },
    {
      icon: Star,
      title: 'Salvos para olhar depois',
      description:
        'Marque perfis interessantes e volte quando tiver tempo de comparar com calma.',
    },
    {
      icon: MessageCircle,
      title: 'Conversa quando fizer sentido',
      description:
        'Matches e mensagens ficam juntos, com notificações para não perder uma curtida ou resposta.',
    },
  ];

  const steps = [
    'Cadastre o perfil do seu pet com as informações principais.',
    'Busque por espécie, raça, distância, saúde e disponibilidade.',
    'Curta, salve ou converse quando houver match entre os tutores.',
  ];

  return (
    <div className="min-h-screen">
      <section className="relative isolate min-h-[76vh] overflow-hidden bg-gray-950">
        <img
          src={heroImage}
          alt="Tutores apresentando seus pets em um parque"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-black/75 via-black/45 to-transparent" />

        <div className="relative mx-auto flex min-h-[76vh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <p className="mb-4 text-sm font-semibold uppercase text-rose-100">
              Cruzamento responsável, com calma
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-[1.03] sm:text-6xl lg:text-7xl">
              PetMatch
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/88">
              Uma forma mais organizada de encontrar perfis compatíveis, salvar
              opções e conversar com outros tutores antes de tomar qualquer decisão.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isAuthenticated ? (
                <Button size="lg" asChild className="bg-rose-600 hover:bg-rose-700">
                  <Link to="/discover">
                    Descobrir perfis
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="bg-rose-600 hover:bg-rose-700">
                    <Link to="/register">
                      Criar conta
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="border-white/50 bg-white/10 text-white hover:bg-white hover:text-gray-950"
                  >
                    <Link to="/login">Entrar</Link>
                  </Button>
                </>
              )}
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 text-sm text-white/86 sm:grid-cols-3">
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4 text-rose-200" />
                Busca filtrada
              </span>
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-rose-200" />
                Dados visíveis
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-200" />
                Proximidade
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="surface-band px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SponsorSlot />
        </div>
      </div>

      <section id="como-funciona" className="page-shell py-14 sm:py-18">
        <div className="mb-10 max-w-3xl">
          <p className="page-kicker">Como funciona</p>
          <h2 className="page-title mt-3">Menos chute, mais informação útil.</h2>
          <p className="page-copy mt-4">
            O PetMatch organiza os detalhes que normalmente ficam espalhados em
            mensagens: perfil do pet, filtros, salvos, curtidas, matches e conversa.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step} className="soft-panel p-5">
              <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 text-sm font-semibold text-emerald-800">
                {index + 1}
              </span>
              <p className="text-base leading-7 text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-band py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="page-kicker">No dia a dia</p>
            <h2 className="page-title mt-3">Ferramentas pequenas, mas práticas.</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="soft-panel p-5">
                <feature.icon className="mb-4 h-6 w-6 text-rose-700" />
                <h3 className="text-lg font-semibold text-gray-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-14 sm:py-18">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="page-kicker">Cuidado antes do match</p>
            <h2 className="page-title mt-3">Uma decisão dessas precisa de contexto.</h2>
            <p className="page-copy mt-4">
              A ideia não é acelerar qualquer encontro. É facilitar uma conversa
              responsável entre tutores, com dados suficientes para comparar perfis
              e procurar orientação veterinária quando necessário.
            </p>
          </div>

          <div className="soft-panel p-5">
            <div className="space-y-4">
              {[
                'Compatibilidade por espécie e gênero antes da curtida.',
                'Feedback quando uma ação não está disponível.',
                'Perfis salvos para revisar sem perder a busca.',
                'Notificacoes para curtidas, matches e mensagens.',
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <span className="text-sm leading-6 text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-950 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold">
              Comece pelo perfil do seu pet.
            </h2>
            <p className="mt-2 max-w-2xl text-white/70">
              Depois disso, a busca, os salvos e as curtidas ficam bem mais simples.
            </p>
          </div>
          <Button size="lg" asChild className="bg-rose-600 hover:bg-rose-700">
            <Link to={isAuthenticated ? '/my-pets' : '/register'}>
              {isAuthenticated ? 'Gerenciar meus pets' : 'Criar conta'}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
