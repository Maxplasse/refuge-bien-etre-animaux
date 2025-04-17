import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, PlusCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const navItems = [
    { name: 'Tableau de bord', icon: Home, href: '/' },
    { name: 'Ajouter un animal', icon: PlusCircle, href: '/add-animal' },
    { name: 'Calendrier', icon: Calendar, href: '/calendar' },
  ];

  return (
    <div className={cn(
      "hidden lg:block sticky top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300",
      open ? "lg:w-64" : "lg:w-16"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className={cn("flex items-center flex-1 justify-center", !open && "hidden")}>
            <h1 className="text-xl font-bold text-shelter-purple">Refuge Bien-être</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setOpen(!open)}
            className="shrink-0"
          >
            {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-shelter-purple/10 hover:text-shelter-purple",
                    item.href === '/' ? "bg-shelter-purple/10 text-shelter-purple" : "text-gray-600"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className={cn("font-medium", !open && "hidden")}>
                    {item.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
