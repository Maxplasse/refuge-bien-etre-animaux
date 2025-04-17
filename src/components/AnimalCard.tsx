import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/types/supabase';

type Animal = Database['public']['Tables']['animaux']['Row'];

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="h-48 bg-gray-200 relative">
          <div className="absolute bottom-2 right-2">
            <Badge variant={animal.sterilise ? "default" : "secondary"}>
              {animal.sterilise ? "Stérilisé" : "Non stérilisé"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{animal.nom}</h3>
            <Badge variant="outline" className="capitalize">
              {animal.espece}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>Race: {animal.race || "Non spécifiée"}</p>
            <p>Sexe: {animal.sexe || "Non spécifié"}</p>
            <p>Couleurs: {animal.couleurs || "Non spécifiées"}</p>
            <p>Date d'entrée: {formatDate(animal.date_entree)}</p>
            {animal.particularites && (
              <p className="text-shelter-purple">
                {animal.particularites}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimalCard;
