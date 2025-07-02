import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, Plus } from 'lucide-react';
import { Database } from '@/types/supabase';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type Animal = Database['public']['Tables']['animaux']['Row'];
type Quarantine = Database['public']['Tables']['quarantines']['Row'];

interface AnimalWithQuarantine extends Animal {
  quarantine?: Quarantine;
  isInQuarantine?: boolean;
  isDeceased?: boolean;
  deathDate?: string | null;
  hasTraitement?: boolean;
}

interface AnimalCardProps {
  animal: AnimalWithQuarantine;
  categoryName: string;
}

// Icône croix médicale verte
const MedicalCrossIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#34A853" />
    <rect x="7" y="10" width="10" height="4" rx="1" fill="white" />
    <rect x="10" y="7" width="4" height="10" rx="1" fill="white" />
  </svg>
);

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, categoryName }) => {
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
      className={cn(
        "overflow-hidden hover:shadow-lg transition-shadow cursor-pointer",
        animal.isDeceased && "opacity-80 border-gray-300"
      )}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative">
        <div className={cn(
          "aspect-square bg-gray-200",
          animal.isDeceased && "grayscale"
        )}>
          {animal.photo_url ? (
            <img 
              src={animal.photo_url} 
              alt={animal.nom || 'Photo de l\'animal'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Pas de photo
            </div>
          )}
        </div>
        
        {/* Status indicators */}
        <div className="absolute top-2 right-2 flex gap-1">
          {animal.isInQuarantine && (
            <div className="rounded-full shadow-md flex items-center justify-center" style={{ background: '#ef4444', width: 24, height: 24 }} title="En quarantaine">
              <AlertTriangle className="h-4 w-4" color="white" />
            </div>
          )}
          {animal.hasTraitement && (
            <div className="rounded-full shadow-md flex items-center justify-center" style={{ background: '#34A853', width: 24, height: 24 }} title="En soin">
              <MedicalCrossIcon size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="p-3 lg:p-4">
        {/* Version mobile */}
        <div className="lg:hidden space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base truncate">{animal.nom}</h3>
            <div className="flex gap-1">
              {animal.isDeceased && (
                <Badge variant="secondary" className="text-xs">Décédé</Badge>
              )}
            </div>
          </div>
          <Badge variant="outline" className="capitalize text-xs">
            {categoryName}
          </Badge>
        </div>

        {/* Version desktop */}
        <div className="hidden lg:block space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <h3 className="font-semibold text-lg">{animal.nom}</h3>
              <div className="flex gap-1 ml-2">
                {animal.isDeceased && (
                  <Badge variant="secondary">Décédé</Badge>
                )}
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {categoryName}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>Race: {animal.race || "Non spécifiée"}</p>
            <p>Sexe: {animal.sexe || "Non spécifié"}</p>
            <p>Date de naissance: {formatDate(animal.date_naissance)}</p>
            {animal.deathDate && (
              <p className="text-gray-700 font-medium">
                Date de décès: {formatDate(animal.deathDate)}
              </p>
            )}
            {animal.quarantine?.raison && (
              <p className="text-red-500 font-medium">
                Raison quarantaine: {animal.quarantine.raison}
              </p>
            )}
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
