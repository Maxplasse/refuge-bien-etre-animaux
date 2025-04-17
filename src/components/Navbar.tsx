import React from 'react';
import { Home, Plus, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  className?: string;
}

interface NavbarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const NavbarItem: React.FC<NavbarItemProps> = ({ icon, label, isActive }) => (
  <button
    className={cn(
      "flex flex-col items-center gap-1 p-2 text-xs",
      isActive ? "text-shelter-purple" : "text-gray-500"
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t py-2 lg:hidden",
      className
    )}>
      <div className="flex justify-around items-center">
        <NavbarItem
          icon={<Home className="w-6 h-6" />}
          label="Tableau de bord"
          isActive={true}
        />
        <NavbarItem
          icon={<Plus className="w-6 h-6" />}
          label="Ajouter"
        />
        <NavbarItem
          icon={<Calendar className="w-6 h-6" />}
          label="Calendrier"
        />
      </div>
    </nav>
  );
}; 