
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Calendar, 
  Syringe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import AnimalCard from './AnimalCard';
import { animals, AnimalStatus } from './animalData';

const AnimalDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AnimalStatus | 'all'>('all');
  const [filterSpecies, setFilterSpecies] = useState<'all' | 'chien' | 'chat' | 'autre'>('all');
  
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (animal.breed?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || animal.status === filterStatus;
    const matchesSpecies = filterSpecies === 'all' || animal.species === filterSpecies;
    
    return matchesSearch && matchesStatus && matchesSpecies;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        
        <div className="flex flex-wrap gap-2">
          <Button className="bg-shelter-purple hover:bg-shelter-dark-purple">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvel animal
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Calendrier
          </Button>
          <Button variant="outline">
            <Syringe className="h-4 w-4 mr-2" />
            Traitements
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, race..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm whitespace-nowrap">Filtrer par:</span>
          </div>
          
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as AnimalStatus | 'all')}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="quarantine">En quarantaine</SelectItem>
              <SelectItem value="treatment">Sous traitement</SelectItem>
              <SelectItem value="transferred">Transféré</SelectItem>
              <SelectItem value="deceased">Décédé</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filterSpecies}
            onValueChange={(value) => setFilterSpecies(value as 'all' | 'chien' | 'chat' | 'autre')}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Espèce" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les espèces</SelectItem>
              <SelectItem value="chien">Chien</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredAnimals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAnimals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Aucun animal trouvé</h3>
          <p className="mt-2 text-gray-500">
            Essayez d'ajuster vos filtres ou votre recherche.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnimalDashboard;
