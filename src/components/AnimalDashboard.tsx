import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AnimalCard from './AnimalCard';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { Loader2, Search } from 'lucide-react';
import { Navbar } from './Navbar';

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

    fetchAnimals();

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
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (animal.nom?.toLowerCase().includes(searchTermLower) || false) ||
      (animal.race?.toLowerCase().includes(searchTermLower) || false) ||
      (animal.espece?.toLowerCase().includes(searchTermLower) || false);
    
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
    <div className="min-h-screen bg-gray-50 lg:bg-white">
      <div className="px-4 lg:px-8 py-6 space-y-6 pb-24 lg:pb-6">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Rechercher par nom, race ou espèce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-none lg:bg-white lg:border"
          />
        </div>

        {/* Catégories */}
        <div>
          <h3 className="font-semibold mb-3 lg:hidden">Catégories</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 lg:flex-wrap scrollbar-hide">
            <Button
              variant={selectedSpecies === '' ? 'default' : 'outline'}
              onClick={() => setSelectedSpecies('')}
              className="rounded-full whitespace-nowrap"
            >
              Tous
            </Button>
            {uniqueSpecies.map((species) => (
              <Button
                key={species}
                variant={selectedSpecies === species ? 'default' : 'outline'}
                onClick={() => setSelectedSpecies(species || '')}
                className="rounded-full whitespace-nowrap"
              >
                {species}
              </Button>
            ))}
          </div>
        </div>

        {/* Grille d'animaux */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredAnimals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>

        {filteredAnimals.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            Aucun animal ne correspond à votre recherche
          </p>
        )}
      </div>

      {/* Navigation mobile */}
      <Navbar />
    </div>
  );
};

export default AnimalDashboard;
