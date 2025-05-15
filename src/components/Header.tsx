import React from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Plus, UserCog } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Afficher le bouton admin pour tous les utilisateurs connectés
  // const isAdmin = user?.user_metadata?.role === 'admin';
  const isAdmin = !!user;

  return (
    <header className={`bg-white shadow-sm py-4 px-6 flex justify-between items-center ${className}`}>
      <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
        <Logo className="h-10 w-auto mr-4" />
        <h1 className="text-xl font-semibold text-gray-800 hidden md:block">Refuge Bien-Être Animaux</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            asChild
          >
            <Link to="/admin">
              <UserCog className="h-4 w-4" />
              <span className="hidden md:inline">Portail admin</span>
            </Link>
          </Button>
        )}
        
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-1 bg-shelter-purple hover:bg-shelter-purple/90"
          asChild
        >
          <Link to="/ajouter-animal">
            <Plus className="h-4 w-4" />
            <span>Ajouter un animal</span>
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default Header; 