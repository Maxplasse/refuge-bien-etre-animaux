import React from 'react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { Database } from '@/types/supabase';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type Animal = Database['public']['Tables']['animaux']['Row'];

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const handleClick = () => {
    navigate(`/animal/${animal.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative">
        <div className="aspect-square bg-gray-200">
          {/* Image à implémenter */}
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="p-3 lg:p-4">
        {/* Version mobile */}
        <div className="lg:hidden space-y-2">
          <h3 className="font-semibold text-base truncate">{animal.nom}</h3>
          <Badge variant="outline" className="capitalize text-xs">
            {animal.espece}
          </Badge>
        </div>

        {/* Version desktop */}
        <div className="hidden lg:block space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{animal.nom}</h3>
            <Badge variant="outline" className="capitalize">
              {animal.espece}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>Race: {animal.race || "Non spécifiée"}</p>
            <p>Sexe: {animal.sexe || "Non spécifié"}</p>
            <p>Date de naissance: {formatDate(animal.date_naissance)}</p>
            {animal.particularites && (
              <p className="text-shelter-purple">
                {animal.particularites}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnimalCard;
