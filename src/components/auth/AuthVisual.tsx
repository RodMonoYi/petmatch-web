import React from 'react';
import authImage from '../../assets/petmatch-auth.webp';

interface AuthVisualProps {
  kicker: string;
  title: string;
  description: string;
}

const AuthVisual: React.FC<AuthVisualProps> = ({ kicker, title, description }) => {
  return (
    <aside className="relative hidden min-h-[640px] overflow-hidden rounded-lg border border-stone-200 bg-gray-950 shadow-sm lg:block">
      <img
        src={authImage}
        alt="Tutora usando o PetMatch com cão e gato em casa"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-8 text-white">
        <p className="text-xs font-semibold uppercase text-rose-100">{kicker}</p>
        <h1 className="mt-3 max-w-md text-4xl font-semibold leading-tight">
          {title}
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-white/82">
          {description}
        </p>
      </div>
    </aside>
  );
};

export default AuthVisual;
