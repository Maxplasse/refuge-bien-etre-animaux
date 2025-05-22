import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AnimalCard from './AnimalCard';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { Loader2, Search, AlertTriangle } from 'lucide-react';
import { Navbar } from './Navbar';
import Header from './Header';

type Animal = Database['public']['Tables']['animaux']['Row'];
type Quarantine = Database['public']['Tables']['quarantines']['Row'];

interface AnimalWithQuarantine extends Animal {
  quarantine?: Quarantine;
  isInQuarantine?: boolean;
  isDeceased?: boolean;
  deathDate?: string | null;
}

const AnimalDashboard = () => {
  const [animals, setAnimals] = useState<AnimalWithQuarantine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [showQuarantineOnly, setShowQuarantineOnly] = useState(false);
  const [showDeceasedOnly, setShowDeceasedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnimalsAndStatus = async () => {
      try {
        setLoading(true);
        // Fetch animals
        const { data: animalsData, error: animalsError } = await supabase
          .from('animaux')
          .select('*')
          .order('nom', { ascending: true });

        if (animalsError) throw animalsError;

        // Fetch active quarantines (where date_fin is null or date_fin is in the future)
        const { data: quarantineData, error: quarantineError } = await supabase
          .from('quarantines')
          .select('*')
          .or('date_fin.is.null,date_fin.gt.now()');

        if (quarantineError) throw quarantineError;

        // Fetch deceased animals
        const { data: deceasedData, error: deceasedError } = await supabase
          .from('deces')
          .select('*');

        if (deceasedError) throw deceasedError;

        // Combine animal and status data
        const animalsWithStatus = animalsData.map(animal => {
          const activeQuarantine = quarantineData.find(q => q.animal_id === animal.id);
          const deathRecord = deceasedData.find(d => d.animal_id === animal.id);
          
          return {
            ...animal,
            quarantine: activeQuarantine || undefined,
            isInQuarantine: !!activeQuarantine,
            isDeceased: !!deathRecord,
            deathDate: deathRecord?.date || null
          };
        });

        setAnimals(animalsWithStatus);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setLoading(false);
      }
    };

    fetchAnimalsAndStatus();

    const subscription = supabase
      .channel('animaux_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'animaux' 
        }, 
        () => {
          fetchAnimalsAndStatus();
        }
      )
      .subscribe();

    // Also subscribe to quarantine changes
    const quarantineSubscription = supabase
      .channel('quarantines_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'quarantines' 
        }, 
        () => {
          fetchAnimalsAndStatus();
        }
      )
      .subscribe();
      
    // Also subscribe to death records changes
    const decesSubscription = supabase
      .channel('deces_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'deces' 
        }, 
        () => {
          fetchAnimalsAndStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      quarantineSubscription.unsubscribe();
      decesSubscription.unsubscribe();
    };
  }, []);

  const filteredAnimals = animals.filter(animal => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (animal.nom?.toLowerCase().includes(searchTermLower) || false) ||
      (animal.race?.toLowerCase().includes(searchTermLower) || false) ||
      (animal.espece?.toLowerCase().includes(searchTermLower) || false);
    
    const matchesSpecies = !selectedSpecies || animal.espece === selectedSpecies;
    const matchesQuarantine = !showQuarantineOnly || animal.isInQuarantine;
    const matchesDeceased = !showDeceasedOnly || animal.isDeceased;
    
    return matchesSearch && matchesSpecies && matchesQuarantine && matchesDeceased;
  });

  const uniqueSpecies = Array.from(new Set(animals.map(animal => animal.espece).filter(Boolean)));
  const quarantineCount = animals.filter(animal => animal.isInQuarantine).length;
  const deceasedCount = animals.filter(animal => animal.isDeceased).length;

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
      <Header className="hidden lg:flex" />
      <div className="px-4 lg:px-8 py-6 space-y-6 pb-24 lg:pb-6">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Rechercher par nom, race ou espèce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-shelter-purple border-[1.5px] lg:bg-white"
          />
        </div>

        {/* Catégories et Filtres */}
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
            
            {/* Bouton quarantaine */}
            <Button
              variant={showQuarantineOnly ? 'destructive' : 'outline'}
              onClick={() => setShowQuarantineOnly(!showQuarantineOnly)}
              className="rounded-full whitespace-nowrap ml-auto"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Quarantaine {quarantineCount > 0 && `(${quarantineCount})`}
            </Button>
            
            {/* Bouton décès */}
            <Button
              variant={showDeceasedOnly ? 'destructive' : 'outline'}
              onClick={() => setShowDeceasedOnly(!showDeceasedOnly)}
              className="rounded-full whitespace-nowrap"
            >
              Décédés {deceasedCount > 0 && `(${deceasedCount})`}
            </Button>
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
