import React, { ReactNode } from 'react';
import Header from './Header';
import { Toaster } from '@/components/ui/sonner'; // Importe o Toaster do sonner

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Toaster /> {/* Use o Toaster do sonner */}
    </div>
  );
};

export default Layout;


