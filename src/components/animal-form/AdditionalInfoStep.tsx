import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AnimalFormData } from '@/pages/AddAnimal';

interface AdditionalInfoStepProps {
  formData: AnimalFormData;
  handleInputChange: (fieldName: keyof AnimalFormData, value: any) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdditionalInfoStep: React.FC<AdditionalInfoStepProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Informations supplémentaires</h2>
      
      {/* Sexe */}
      <div className="space-y-2">
        <Label htmlFor="sexe">Sexe*</Label>
        <Select
          value={formData.sexe}
          onValueChange={(value) => handleInputChange('sexe', value)}
          required
        >
          <SelectTrigger id="sexe">
            <SelectValue placeholder="Sélectionnez le sexe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Mâle</SelectItem>
            <SelectItem value="femelle">Femelle</SelectItem>
            <SelectItem value="inconnu">Inconnu</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Stérilisé */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="sterilise"
          checked={formData.sterilise}
          onCheckedChange={(checked) => handleInputChange('sterilise', checked === true)}
        />
        <Label htmlFor="sterilise" className="cursor-pointer">
          Animal stérilisé
        </Label>
      </div>
      
      {/* Particularités */}
      <div className="space-y-2">
        <Label htmlFor="particularites">Particularités</Label>
        <Textarea
          id="particularites"
          value={formData.particularites}
          onChange={(e) => handleInputChange('particularites', e.target.value)}
          placeholder="Caractéristiques particulières, comportement, etc."
          rows={3}
        />
      </div>
      
      {/* Provenance */}
      <div className="space-y-2">
        <Label htmlFor="provenance">Provenance</Label>
        <Input
          id="provenance"
          type="text"
          value={formData.provenance}
          onChange={(e) => handleInputChange('provenance', e.target.value)}
          placeholder="Ex: Abandon, Trouvé, SPA, etc."
        />
      </div>
      
      <p className="text-xs text-gray-500 mt-4">* Champs obligatoires</p>
    </div>
  );
};

export default AdditionalInfoStep; 