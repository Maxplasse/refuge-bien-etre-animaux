import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AnimalCard from './AnimalCard';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { Loader2, Search, AlertTriangle, HeartHandshake, HeartPulse, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from './Navbar';
import Header from './Header';

type Animal = Database['public']['Tables']['animaux']['Row'];
type Quarantine = Database['public']['Tables']['quarantines']['Row'];

interface AnimalWithQuarantine extends Animal {
  quarantine?: Quarantine;
  isInQuarantine?: boolean;
  isDeceased?: boolean;
  deathDate?: string | null;
  isAdopted?: boolean;
  hasTraitement?: boolean;
}

const AnimalDashboard = () => {
  const [animals, setAnimals] = useState<AnimalWithQuarantine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showQuarantineOnly, setShowQuarantineOnly] = useState(false);
  const [showDeceasedOnly, setShowDeceasedOnly] = useState(false);
  const [showAdoptedOnly, setShowAdoptedOnly] = useState(false);
  const [showTraitementOnly, setShowTraitementOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: number, nom: string }[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Setters qui stockent dans le sessionStorage
  const setAndStoreSearchTerm = (value: string) => {
    setSearchTerm(value);
    sessionStorage.setItem('animalDashboardSearchTerm', value);
  };
  const setAndStoreSelectedCategoryId = (value: number | null) => {
    setSelectedCategoryId(value);
    sessionStorage.setItem('animalDashboardSelectedCategoryId', value !== null ? String(value) : '');
  };
  const setAndStoreShowQuarantineOnly = (value: boolean) => {
    setShowQuarantineOnly(value);
    sessionStorage.setItem('animalDashboardShowQuarantineOnly', JSON.stringify(value));
  };
  const setAndStoreShowDeceasedOnly = (value: boolean) => {
    setShowDeceasedOnly(value);
    sessionStorage.setItem('animalDashboardShowDeceasedOnly', JSON.stringify(value));
  };
  const setAndStoreShowAdoptedOnly = (value: boolean) => {
    setShowAdoptedOnly(value);
    sessionStorage.setItem('animalDashboardShowAdoptedOnly', JSON.stringify(value));
  };
  const setAndStoreShowTraitementOnly = (value: boolean) => {
    setShowTraitementOnly(value);
    sessionStorage.setItem('animalDashboardShowTraitementOnly', JSON.stringify(value));
  };

  useEffect(() => {
    // Initialisation depuis le sessionStorage
    const searchTerm = sessionStorage.getItem('animalDashboardSearchTerm') || '';
    const selectedCategoryId = sessionStorage.getItem('animalDashboardSelectedCategoryId');
    const showQuarantineOnly = sessionStorage.getItem('animalDashboardShowQuarantineOnly') === 'true';
    const showDeceasedOnly = sessionStorage.getItem('animalDashboardShowDeceasedOnly') === 'true';
    const showAdoptedOnly = sessionStorage.getItem('animalDashboardShowAdoptedOnly') === 'true';
    const showTraitementOnly = sessionStorage.getItem('animalDashboardShowTraitementOnly') === 'true';
    setSearchTerm(searchTerm);
    setSelectedCategoryId(selectedCategoryId ? Number(selectedCategoryId) : null);
    setShowQuarantineOnly(showQuarantineOnly);
    setShowDeceasedOnly(showDeceasedOnly);
    setShowAdoptedOnly(showAdoptedOnly);
    setShowTraitementOnly(showTraitementOnly);

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

        // Fetch adopted animals (transferts)
        const { data: adoptedData, error: adoptedError } = await supabase
          .from('transferts')
          .select('animal_id');

        if (adoptedError) throw adoptedError;

        // Fetch traitements en cours (date_fin > aujourd'hui ou NULL)
        const today = new Date().toISOString();
        const { data: traitementsData, error: traitementsError } = await supabase
          .from('traitements')
          .select('animal_id, date_fin')
          .or('date_fin.is.null,date_fin.gt.' + today);

        if (traitementsError) throw traitementsError;

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories_animaux')
          .select('id, nom')
          .order('nom', { ascending: true });

        if (categoriesError) throw categoriesError;

        // Map animal_id -> true pour les animaux ayant un traitement en cours
        const animalIdsWithTraitement = new Set((traitementsData || []).map(t => t.animal_id));

        // Combine animal and status data
        const animalsWithStatus = animalsData.map(animal => {
          const activeQuarantine = quarantineData.find(q => q.animal_id === animal.id);
          const deathRecord = deceasedData.find(d => d.animal_id === animal.id);
          const isAdopted = adoptedData.some(t => t.animal_id === animal.id);
          const hasTraitement = animalIdsWithTraitement.has(animal.id);
          return {
            ...animal,
            quarantine: activeQuarantine || undefined,
            isInQuarantine: !!activeQuarantine,
            isDeceased: !!deathRecord,
            deathDate: deathRecord?.date || null,
            isAdopted,
            hasTraitement,
          };
        });

        setAnimals(animalsWithStatus);
        setCategories(categoriesData);
        setCategoryMap(Object.fromEntries(categoriesData.map(cat => [cat.id, cat.nom])));
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

  const filteredAnimals = useMemo(() => {
    return animals.filter(animal => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        (animal.nom?.toLowerCase().includes(searchTermLower) || false) ||
        (animal.race?.toLowerCase().includes(searchTermLower) || false);
      const matchesCategory = !selectedCategoryId || animal.categorie_id === selectedCategoryId;
      const matchesQuarantine = !showQuarantineOnly || animal.isInQuarantine;
      const matchesDeceased = !showDeceasedOnly || animal.isDeceased;
      const matchesAdopted = !showAdoptedOnly || animal.isAdopted;
      const matchesTraitement = !showTraitementOnly || animal.hasTraitement;
      const shouldExclude = (!showDeceasedOnly && animal.isDeceased) || (!showAdoptedOnly && animal.isAdopted);
      return matchesSearch && matchesCategory && matchesQuarantine && matchesDeceased && matchesAdopted && matchesTraitement && !shouldExclude;
    });
  }, [animals, searchTerm, selectedCategoryId, showQuarantineOnly, showDeceasedOnly, showAdoptedOnly, showTraitementOnly]);

  // Calculer la pagination
  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoryId, showQuarantineOnly, showDeceasedOnly, showAdoptedOnly, showTraitementOnly]);

  const uniqueCategories = Array.from(new Set(animals.map(animal => animal.categorie_id).filter(Boolean)));
  const quarantineCount = animals.filter(animal => animal.isInQuarantine).length;
  const deceasedCount = animals.filter(animal => animal.isDeceased).length;
  const adoptedCount = animals.filter(animal => animal.isAdopted).length;
  const traitementCount = animals.filter(animal => animal.hasTraitement).length;

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
            onChange={(e) => setAndStoreSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-shelter-purple border-[1.5px] lg:bg-white"
          />
        </div>

        {/* Catégories et Filtres */}
        <div>
          <h3 className="font-semibold mb-3 lg:hidden">Catégories</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 lg:flex-wrap scrollbar-hide">
            <Button
              variant={selectedCategoryId === null ? 'default' : 'outline'}
              onClick={() => setAndStoreSelectedCategoryId(null)}
              className="rounded-full whitespace-nowrap"
            >
              Tous {(() => {
                const count = animals.filter(a => !a.isDeceased && !a.isAdopted).length;
                return count > 0 ? `(${count})` : '';
              })()}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategoryId === cat.id ? 'default' : 'outline'}
                onClick={() => setAndStoreSelectedCategoryId(cat.id)}
                className="rounded-full whitespace-nowrap"
              >
                {cat.nom} {(() => {
                  const count = animals.filter(a => a.categorie_id === cat.id && (!a.isDeceased && !a.isAdopted)).length;
                  return count > 0 ? `(${count})` : '';
                })()}
              </Button>
            ))}
            
            {/* Bouton quarantaine */}
            <Button
              variant={showQuarantineOnly ? 'destructive' : 'outline'}
              onClick={() => setAndStoreShowQuarantineOnly(!showQuarantineOnly)}
              className="rounded-full whitespace-nowrap"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Quarantaine {quarantineCount > 0 && `(${quarantineCount})`}
            </Button>
            
            {/* Bouton décès */}
            <Button
              variant={showDeceasedOnly ? 'destructive' : 'outline'}
              onClick={() => setAndStoreShowDeceasedOnly(!showDeceasedOnly)}
              className="rounded-full whitespace-nowrap"
            >
              Décédés {deceasedCount > 0 && `(${deceasedCount})`}
            </Button>
            
            {/* Bouton adoptés */}
            <Button
              variant={showAdoptedOnly ? 'destructive' : 'outline'}
              onClick={() => setAndStoreShowAdoptedOnly(!showAdoptedOnly)}
              className="rounded-full whitespace-nowrap"
            >
              <HeartHandshake className="w-4 h-4 mr-1" />
              Adoptés {adoptedCount > 0 && `(${adoptedCount})`}
            </Button>
            
            {/* Bouton soin */}
            <Button
              variant={showTraitementOnly ? 'destructive' : 'outline'}
              onClick={() => setAndStoreShowTraitementOnly(!showTraitementOnly)}
              className="rounded-full whitespace-nowrap"
            >
              <HeartPulse className="w-4 h-4 mr-1" />
              Soin {traitementCount > 0 && `(${traitementCount})`}
            </Button>
          </div>
        </div>

        {/* Grille d'animaux */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {paginatedAnimals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} categoryName={categoryMap[animal.categorie_id] || ''} />
          ))}
        </div>

        {filteredAnimals.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            Aucun animal ne correspond à votre recherche
          </p>
        )}

        {/* Pagination */}
        {filteredAnimals.length > itemsPerPage && (
          <div className="flex flex-col items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              
              {/* Onglets de pagination */}
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  let pageNum: number;
                  
                  if (totalPages <= 10) {
                    // Afficher toutes les pages si <= 10
                    pageNum = i + 1;
                  } else if (currentPage <= 5) {
                    // Afficher les premières pages
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 4) {
                    // Afficher les dernières pages
                    pageNum = totalPages - 9 + i;
                  } else {
                    // Afficher autour de la page courante
                    pageNum = currentPage - 5 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredAnimals.length)} sur {filteredAnimals.length} animal(s)
            </p>
          </div>
        )}
      </div>

      {/* Navigation mobile */}
      <Navbar />
    </div>
  );
};

export default AnimalDashboard;
