import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AnimalFormData } from '@/pages/AddAnimal';

interface PersonalInfoStepProps {
  formData: AnimalFormData;
  handleInputChange: (fieldName: keyof AnimalFormData, value: any) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Informations personnelles</h2>
      
      {/* Nom */}
      <div className="space-y-2">
        <Label htmlFor="nom">Nom*</Label>
        <Input
          id="nom"
          type="text"
          value={formData.nom}
          onChange={(e) => handleInputChange('nom', e.target.value)}
          placeholder="Nom de l'animal"
          required
        />
      </div>
      
      {/* Identification */}
      <div className="space-y-2">
        <Label htmlFor="identification">Identification (puce, tatouage)</Label>
        <Input
          id="identification"
          type="text"
          value={formData.identification}
          onChange={(e) => handleInputChange('identification', e.target.value)}
          placeholder="Numéro d'identification"
        />
      </div>
      
      {/* Date de naissance */}
      <div className="space-y-2">
        <Label htmlFor="date_naissance">Date de naissance</Label>
        <Input
          id="date_naissance"
          type="date"
          value={formData.date_naissance}
          onChange={(e) => handleInputChange('date_naissance', e.target.value)}
        />
        <p className="text-xs text-gray-500">Si la date exacte est inconnue, vous pouvez estimer.</p>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">* Champs obligatoires</p>
    </div>
  );
};

export default PersonalInfoStep; 