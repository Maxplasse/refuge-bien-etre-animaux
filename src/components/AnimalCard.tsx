
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Syringe } from 'lucide-react';
import { Animal, getStatusLabel, getStatusClass } from './animalData';
import { cn } from '@/lib/utils';

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard = ({ animal }: AnimalCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col animate-fade-in">
      <div className="relative h-48 bg-shelter-soft-gray">
        <img
          src={animal.image}
          alt={animal.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={cn("status-badge", getStatusClass(animal.status))}>
            {getStatusLabel(animal.status)}
          </span>
        </div>
      </div>
      
      <CardContent className="pt-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{animal.name}</h3>
          <div className="text-sm text-gray-500">{animal.gender}</div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Espèce:</span> {animal.species}
            {animal.breed && ` (${animal.breed})`}
          </div>
          
          {animal.age && (
            <div className="text-sm">
              <span className="font-medium">Âge:</span> {animal.age}
            </div>
          )}
          
          <div className="text-sm">
            <span className="font-medium">Arrivée:</span> {new Date(animal.entryDate).toLocaleDateString('fr-FR')}
          </div>
          
          {animal.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
              {animal.description}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Eye className="h-4 w-4 mr-1" />
          Voir
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Edit className="h-4 w-4 mr-1" />
          Éditer
        </Button>
        {animal.status === 'treatment' && (
          <Button variant="outline" size="sm" className="flex-1 text-status-treatment">
            <Syringe className="h-4 w-4 mr-1" />
            Traiter
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AnimalCard;
