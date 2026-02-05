import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCog, Plus, LogOut, LayoutDashboard, User } from 'lucide-react';

interface UserAvatarProps {
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ className }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = !!user;
  const isOnAdminPage = location.pathname.startsWith('/admin');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return <User className="h-4 w-4" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`focus:outline-none focus:ring-2 focus:ring-shelter-purple focus:ring-offset-2 rounded-full ${className}`}>
          <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarFallback className="bg-shelter-purple text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isAdmin && (
          <>
            <DropdownMenuItem
              onClick={() => navigate(isOnAdminPage ? '/dashboard' : '/admin')}
              className="cursor-pointer"
            >
              {isOnAdminPage ? (
                <>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </>
              ) : (
                <>
                  <UserCog className="mr-2 h-4 w-4" />
                  Portail admin
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onClick={() => navigate('/ajouter-animal')}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un animal
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
