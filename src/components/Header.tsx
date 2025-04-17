import React from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className={`bg-white shadow-sm py-4 px-6 flex justify-between items-center ${className}`}>
      <div className="flex items-center">
        <Logo className="h-10 w-auto mr-4" />
        <h1 className="text-xl font-semibold text-gray-800 hidden md:block">Refuge Bien-Être Animaux</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden md:flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-1" />
            <span className="mr-2">{user.email}</span>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOut}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Déconnexion</span>
        </Button>
      </div>
    </header>
  );
};

export default Header; 