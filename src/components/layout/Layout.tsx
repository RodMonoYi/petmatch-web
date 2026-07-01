import React, { ReactNode } from 'react';
import Header from './Header';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;
