import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stethoscope, ShieldCheck, Sparkles } from 'lucide-react';

interface SponsorSlotProps {
  variant?: 'banner' | 'compact';
  className?: string;
}

const SponsorSlot: React.FC<SponsorSlotProps> = ({ variant = 'banner', className = '' }) => {
  if (variant === 'compact') {
    return (
      <aside className={`rounded-lg border border-emerald-100 bg-white/85 p-4 shadow-sm ${className}`}>
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-emerald-50 p-2 text-emerald-700">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-200 bg-white text-emerald-700">
                Patrocinado
              </Badge>
              <span className="text-xs font-medium text-emerald-700">Clínica parceira</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">Check-up pré-cruzamento</p>
            <p className="mt-1 text-sm text-gray-600">
              Avaliação, vacinação e laudo para perfis mais confiáveis.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <section className={`rounded-lg border border-emerald-100 bg-white px-4 py-4 shadow-sm ${className}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-emerald-50 p-2 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Patrocinado
              </Badge>
              <span className="text-sm font-medium text-gray-900">PetMatch Verificado</span>
            </div>
            <p className="text-sm text-gray-600">
              Clínicas parceiras podem validar vacinas, pedigree e saúde reprodutiva do pet.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="md:self-center">
          <Link to="/settings">
            <Sparkles className="h-4 w-4" />
            Verificar perfil
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default SponsorSlot;
