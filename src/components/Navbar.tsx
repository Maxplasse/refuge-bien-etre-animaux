import React from 'react';
import { Home, Plus, Calendar, LogOut, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  className?: string;
}

interface NavbarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavbarItem: React.FC<NavbarItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    className={cn(
      "flex flex-col items-center gap-1 p-2 text-xs",
      isActive ? "text-shelter-purple" : "text-gray-500"
    )}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Afficher le bouton admin pour tous les utilisateurs connectés
  // const isAdmin = user?.user_metadata?.role === 'admin';
  const isAdmin = !!user;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t py-2 lg:hidden",
      className
    )}>
      <div className="flex justify-around items-center">
        <NavbarItem
          icon={<Home className="w-6 h-6" />}
          label="Tableau de bord"
          isActive={location.pathname === '/dashboard'}
          onClick={() => navigate('/dashboard')}
        />
        <NavbarItem
          icon={<Plus className="w-6 h-6" />}
          label="Ajouter"
          isActive={location.pathname === '/ajouter-animal'}
          onClick={() => navigate('/ajouter-animal')}
        />
        {isAdmin && (
          <NavbarItem
            icon={<UserCog className="w-6 h-6" />}
            label="Admin"
            isActive={location.pathname === '/admin'}
            onClick={() => navigate('/admin')}
          />
        )}
        <NavbarItem
          icon={<Calendar className="w-6 h-6" />}
          label="Calendrier"
          isActive={location.pathname === '/calendrier'}
          onClick={() => navigate('/calendrier')}
        />
        <NavbarItem
          icon={<LogOut className="w-6 h-6" />}
          label="Déconnexion"
          onClick={handleSignOut}
        />
      </div>
    </nav>
  );
}; 