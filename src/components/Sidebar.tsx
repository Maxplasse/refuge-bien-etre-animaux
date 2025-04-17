
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Search, 
  PlusCircle, 
  Calendar, 
  Syringe, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const navItems = [
    { name: 'Tableau de bord', icon: Home, href: '/' },
    { name: 'Rechercher', icon: Search, href: '/search' },
    { name: 'Ajouter un animal', icon: PlusCircle, href: '/add-animal' },
    { name: 'Calendrier', icon: Calendar, href: '/calendar' },
    { name: 'Traitements', icon: Syringe, href: '/treatments' },
  ];

  return (
    <div 
      className={cn(
        "bg-white border-r border-border transition-all duration-300 fixed inset-y-0 left-0 z-20 lg:relative",
        open ? "w-64" : "w-0 lg:w-16 overflow-hidden"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className={cn("font-semibold text-xl text-shelter-purple", !open && "lg:hidden")}>
            Refuge
          </h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex"
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>
        
        <nav className="flex-1 py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-shelter-light-purple hover:text-shelter-purple",
                    item.href === '/' ? "bg-shelter-light-purple text-shelter-purple" : "text-gray-700"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className={cn(!open && "lg:hidden")}>
                    {item.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="border-t p-4">
          <a
            href="/settings"
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-shelter-light-purple hover:text-shelter-purple text-gray-700"
            )}
          >
            <Settings className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className={cn(!open && "lg:hidden")}>Paramètres</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
