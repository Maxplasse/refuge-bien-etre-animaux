import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

/**
 * Composant de mise en page global pour l'application
 * Utilise Outlet pour afficher les routes enfants
 */
const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
};

export default AppLayout; 