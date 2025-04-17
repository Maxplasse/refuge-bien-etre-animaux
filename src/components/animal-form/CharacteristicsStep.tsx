import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AnimalFormData } from '@/pages/AddAnimal';

interface CharacteristicsStepProps {
  formData: AnimalFormData;
  handleInputChange: (fieldName: keyof AnimalFormData, value: any) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CharacteristicsStep: React.FC<CharacteristicsStepProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Caractéristiques</h2>
      
      {/* Race */}
      <div className="space-y-2">
        <Label htmlFor="race">Race</Label>
        <Input
          id="race"
          type="text"
          value={formData.race}
          onChange={(e) => handleInputChange('race', e.target.value)}
          placeholder="Ex: Berger Allemand, Siamois, etc."
        />
      </div>
      
      {/* Couleurs */}
      <div className="space-y-2">
        <Label htmlFor="couleurs">Couleurs</Label>
        <Input
          id="couleurs"
          type="text"
          value={formData.couleurs}
          onChange={(e) => handleInputChange('couleurs', e.target.value)}
          placeholder="Ex: Noir et blanc, Roux, etc."
        />
      </div>
      
      {/* Propriété */}
      <div className="space-y-2">
        <Label htmlFor="propriete">Propriété</Label>
        <Input
          id="propriete"
          type="text"
          value={formData.propriete}
          onChange={(e) => handleInputChange('propriete', e.target.value)}
          placeholder="Ex: Association, Particulier, etc."
        />
      </div>
    </div>
  );
};

export default CharacteristicsStep; 