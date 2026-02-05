import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import NotificationCenter from './NotificationCenter';
import UserAvatar from './UserAvatar';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Afficher le bouton admin pour tous les utilisateurs connectés
  const isAdmin = !!user;

  return (
    <header className={`bg-white shadow-sm py-4 px-6 flex justify-between items-center ${className}`}>
      <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
        <Logo className="h-16 w-auto" />
      </div>
      
      <div className="flex items-center gap-4">
        {/* Show NotificationCenter only on desktop */}
        <div className="hidden lg:block">
          {isAdmin && <NotificationCenter />}
        </div>
        
        {/* User Avatar with dropdown menu */}
        {isAdmin && <UserAvatar />}
      </div>
    </header>
  );
};

export default Header; 