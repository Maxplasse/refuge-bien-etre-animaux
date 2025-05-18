import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Plus, UserCog, LayoutDashboard } from 'lucide-react';
import Logo from '@/components/Logo';
import NotificationCenter from './NotificationCenter';

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
  
  // Déterminer si l'utilisateur est sur la page admin
  const isOnAdminPage = location.pathname.startsWith('/admin');
  
  // Définir le texte et l'icône du bouton en fonction de la page
  const adminButtonProps = isOnAdminPage 
    ? {
        to: '/dashboard',
        text: 'Dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />
      }
    : {
        to: '/admin',
        text: 'Portail admin',
        icon: <UserCog className="h-4 w-4" />
      };

  return (
    <header className={`bg-white shadow-sm py-4 px-6 flex justify-between items-center ${className}`}>
      <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
        <Logo className="h-16 w-auto" />
      </div>
      
      <div className="flex items-center gap-4">
        {isAdmin && <NotificationCenter />}
        
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            asChild
          >
            <Link to={adminButtonProps.to}>
              {adminButtonProps.icon}
              <span className="hidden md:inline">{adminButtonProps.text}</span>
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