import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AnimalCard from './AnimalCard';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { Loader2 } from 'lucide-react';

type Animal = Database['public']['Tables']['animaux']['Row'];

const AnimalDashboard = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const { data, error } = await supabase
          .from('animaux')
          .select('*');

        if (error) throw error;
        setAnimals(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setLoading(false);
      }
    };

    // Initial fetch
    fetchAnimals();

    // Set up real-time subscription
    const subscription = supabase
      .channel('animaux_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'animaux' 
        }, 
        () => {
          fetchAnimals();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = (animal.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (animal.race?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (animal.particularites?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesSpecies = !selectedSpecies || animal.espece === selectedSpecies;
    
    return matchesSearch && matchesSpecies;
  });

  const uniqueSpecies = Array.from(new Set(animals.map(animal => animal.espece).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-shelter-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder="Rechercher un animal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedSpecies === '' ? 'default' : 'outline'}
            onClick={() => setSelectedSpecies('')}
          >
            Tous
          </Button>
          {uniqueSpecies.map((species) => (
            <Button
              key={species}
              variant={selectedSpecies === species ? 'default' : 'outline'}
              onClick={() => setSelectedSpecies(species || '')}
            >
              {species}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAnimals.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} />
        ))}
      </div>

      {filteredAnimals.length === 0 && (
        <p className="text-center text-gray-500">
          Aucun animal ne correspond à votre recherche
        </p>
      )}
    </div>
  );
};

export default AnimalDashboard;
