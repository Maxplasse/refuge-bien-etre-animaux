import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileTopBar } from './MobileTopBar';

/**
 * Composant de mise en page global pour l'application
 * Utilise Outlet pour afficher les routes enfants
 */
const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileTopBar />
      <main className="pt-12 pb-24 lg:pt-0 lg:pb-0">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
};

export default AppLayout; 