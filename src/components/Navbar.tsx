import React from 'react';
import { Home, Plus, UserCog, LogOut } from 'lucide-react';
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
      "flex flex-col items-center justify-center p-1 text-xs w-20",
      isActive 
        ? "text-black font-medium" 
        : "text-gray-500"
    )}
    onClick={onClick}
  >
    <div className={cn(
      "rounded-full p-2 mb-1",
      isActive ? "bg-[#e9e5fa]" : ""
    )}>
      {icon}
    </div>
    <span>{label}</span>
  </button>
);

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is admin based on metadata
  const isAdmin = user?.user_metadata?.role === 'admin';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 lg:hidden">
      <nav className={cn(
        "bg-white rounded-full shadow-lg py-1 mx-auto max-w-md border-2 border-[#e9e5fa] flex justify-between items-center",
        className
      )}>
        <div className="flex-1 flex justify-center">
          <NavbarItem
            icon={<Home className="w-5 h-5" />}
            label="Accueil"
            isActive={location.pathname === '/dashboard'}
            onClick={() => navigate('/dashboard')}
          />
        </div>
        
        <div className="flex-1 flex justify-center">
          <div className="flex flex-col items-center">
            <button 
              className="bg-black text-white rounded-full p-3 shadow-lg flex items-center justify-center"
              onClick={() => navigate('/ajouter-animal')}
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-xs mt-1">Ajouter un animal</span>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center">
          {isAdmin ? (
            <NavbarItem
              icon={<UserCog className="w-5 h-5" />}
              label="Admin"
              isActive={location.pathname === '/admin'}
              onClick={() => navigate('/admin')}
            />
          ) : (
            <NavbarItem
              icon={<LogOut className="w-5 h-5" />}
              label="Déconnexion"
              onClick={handleSignOut}
            />
          )}
        </div>
      </nav>
    </div>
  );
}; 