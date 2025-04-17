import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AnimalFormData } from '@/pages/AddAnimal';

interface BasicInfoStepProps {
  formData: AnimalFormData;
  handleInputChange: (fieldName: keyof AnimalFormData, value: any) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  handleInputChange,
  handleFileChange,
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
      
      {/* Espèce */}
      <div className="space-y-2">
        <Label htmlFor="espece">Espèce*</Label>
        <Select
          value={formData.espece}
          onValueChange={(value) => handleInputChange('espece', value)}
          required
        >
          <SelectTrigger id="espece">
            <SelectValue placeholder="Sélectionnez une espèce" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chat">Chat</SelectItem>
            <SelectItem value="chien">Chien</SelectItem>
            <SelectItem value="lapin">Lapin</SelectItem>
            <SelectItem value="rongeur">Rongeur</SelectItem>
            <SelectItem value="oiseau">Oiseau</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">* Champs obligatoires</p>
    </div>
  );
};

export default BasicInfoStep; 