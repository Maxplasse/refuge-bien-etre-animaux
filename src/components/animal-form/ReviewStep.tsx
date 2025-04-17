import React from 'react';
import { AnimalFormData } from '@/pages/AddAnimal';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReviewStepProps {
  formData: AnimalFormData;
  handleInputChange: (fieldName: keyof AnimalFormData, value: any) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non spécifiée';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Groupe les informations pour un affichage clair
  const infoGroups = [
    {
      title: 'Informations de base',
      items: [
        { label: 'Date d\'entrée', value: formatDate(formData.date_entree) },
        { label: 'Espèce', value: formData.espece },
      ],
    },
    {
      title: 'Caractéristiques',
      items: [
        { label: 'Race', value: formData.race || 'Non spécifiée' },
        { label: 'Couleurs', value: formData.couleurs || 'Non spécifiée' },
        { label: 'Propriété', value: formData.propriete || 'Non spécifiée' },
      ],
    },
    {
      title: 'Informations personnelles',
      items: [
        { label: 'Nom', value: formData.nom },
        { label: 'Identification', value: formData.identification || 'Non spécifiée' },
        { label: 'Date de naissance', value: formatDate(formData.date_naissance) },
      ],
    },
    {
      title: 'Informations supplémentaires',
      items: [
        { label: 'Sexe', value: formData.sexe || 'Non spécifié' },
        { label: 'Stérilisé', value: formData.sterilise ? 'Oui' : 'Non' },
        { label: 'Particularités', value: formData.particularites || 'Aucune particularité' },
        { label: 'Provenance', value: formData.provenance || 'Non spécifiée' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Vérification des informations</h2>
      <p className="text-gray-600">
        Veuillez vérifier les informations ci-dessous avant d'enregistrer l'animal.
      </p>

      <div className="flex justify-center mb-6">
        {formData.photo_preview ? (
          <div className="w-40 h-40 rounded-md overflow-hidden">
            <img
              src={formData.photo_preview}
              alt={formData.nom}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-500">Aucune photo</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {infoGroups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex justify-between">
                    <span className="text-gray-600">{item.label}:</span>
                    <span className="font-medium">{item.value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewStep; 