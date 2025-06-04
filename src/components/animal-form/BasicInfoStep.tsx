import React, { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AnimalFormData } from '@/pages/AddAnimal';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BasicInfoStepProps {
  formData: AnimalFormData;
  handleInputChange: (fieldName: keyof AnimalFormData, value: any) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const especes = [
  { value: 'canard', label: 'Canard' },
  { value: 'chat', label: 'Chat' },
  { value: 'chevre', label: 'Chèvre' },
  { value: 'chien', label: 'Chien' },
  { value: 'chinchilla', label: 'Chinchilla' },
  { value: 'cochon', label: 'Cochon' },
  { value: 'gerbille', label: 'Gerbille' },
  { value: 'hamster', label: 'Hamster' },
  { value: 'lapin', label: 'Lapin' },
  { value: 'pigeon', label: 'Pigeon' },
  { value: 'poule', label: 'Poule et coq' },
  { value: 'rat', label: 'Rat' },
  { value: 'tortue', label: 'Tortue' },
  { value: 'tourterelle', label: 'Tourterelle' },
  { value: 'autre', label: 'Autre' },
];

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  handleInputChange,
  handleFileChange,
}) => {
  // Gérer la recherche directe dans le champ
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // S'assurer que espece est toujours une chaîne de caractères
  const especeValue = formData.espece || '';
  
  // Filtrer les espèces en fonction de la recherche
  const filteredEspeces = especes.filter(espece => 
    espece.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir le label à afficher dans le champ
  const selectedLabel = especeValue 
    ? especes.find(espece => espece.value === especeValue)?.label 
    : '';
    
  // Effet pour gérer les clics en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialiser la recherche avec la valeur sélectionnée quand elle change
  useEffect(() => {
    if (selectedLabel && !searchTerm) {
      setSearchTerm(selectedLabel);
    }
  }, [selectedLabel]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Informations de base</h2>
      
      {/* Photo de l'animal */}
      <div className="space-y-2">
        <Label htmlFor="photo">Photo de l'animal</Label>
        <div className="flex flex-col items-center space-y-3">
          {formData.photo_preview ? (
            <div className="relative w-32 h-32 mb-2">
              <img
                src={formData.photo_preview}
                alt="Aperçu"
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleInputChange('photo_preview', null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-500">Aucune photo</span>
            </div>
          )}
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="max-w-xs"
          />
        </div>
      </div>
      
      {/* Date d'entrée */}
      <div className="space-y-2">
        <Label htmlFor="date_entree">Date d'entrée*</Label>
        <Input
          id="date_entree"
          type="date"
          value={formData.date_entree}
          onChange={(e) => handleInputChange('date_entree', e.target.value)}
          required
        />
      </div>
      
      {/* Espèce avec recherche directe */}
      <div className="space-y-2">
        <Label htmlFor="espece-search">Espèce*</Label>
        <div className="relative" ref={dropdownRef}>
          <Input
            id="espece-search"
            type="text"
            placeholder="Rechercher une espèce..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="w-full"
            aria-haspopup="listbox"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
          
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto border">
              {filteredEspeces.length > 0 ? (
                <ul className="py-1">
                  {filteredEspeces.map(espece => (
                    <li
                      key={espece.value}
                      className={cn(
                        "flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100",
                        especeValue === espece.value ? "bg-gray-100" : ""
                      )}
                      onClick={() => {
                        handleInputChange('espece', espece.value);
                        setSearchTerm(espece.label);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          especeValue === espece.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {espece.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-2 text-gray-500">Aucune espèce trouvée</div>
              )}
            </div>
          )}
        </div>
        {/* Afficher la valeur sélectionnée si elle diffère de la recherche */}
        {especeValue && searchTerm !== selectedLabel && (
          <p className="text-sm text-gray-600">Sélectionné: {selectedLabel}</p>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-4">* Champs obligatoires</p>
    </div>
  );
};

export default BasicInfoStep; 