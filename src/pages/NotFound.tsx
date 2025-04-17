
import React from 'react';
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-shelter-purple">404</h1>
          <p className="text-xl text-gray-600 mb-6">
            Cette page n'existe pas
          </p>
          <Button className="bg-shelter-purple hover:bg-shelter-dark-purple">
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
