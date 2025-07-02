import React, { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AnimalFormData } from '@/pages/AddAnimal';
import { Button } from '@/components/ui/button';

interface BasicInfoStepProps {
  formData: AnimalFormData;
  handleInputChange: (fieldName: keyof AnimalFormData, value: any) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categories: { id: number, nom: string }[];
  loadingCategories: boolean;
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
  categories,
  loadingCategories,
}) => {
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
      
      {/* Sélecteur de catégorie (espèce) */}
      <div className="space-y-2">
        <Label htmlFor="categorie_id">Espèce*</Label>
        <select
          id="categorie_id"
          value={formData.categorie_id || ''}
          onChange={e => handleInputChange('categorie_id', Number(e.target.value))}
          required
          disabled={loadingCategories}
          className="input-class w-full border rounded px-3 py-2"
        >
          <option value="">Sélectionner une espèce</option>
          {categories.length > 0 ? (
            categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nom}</option>
            ))
          ) : (
            !loadingCategories && <option disabled>Aucune catégorie disponible</option>
          )}
        </select>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">* Champs obligatoires</p>
    </div>
  );
};

export default BasicInfoStep; 