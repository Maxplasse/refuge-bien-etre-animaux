import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import BasicInfoStep from '@/components/animal-form/BasicInfoStep';
import CharacteristicsStep from '@/components/animal-form/CharacteristicsStep';
import PersonalInfoStep from '@/components/animal-form/PersonalInfoStep';
import AdditionalInfoStep from '@/components/animal-form/AdditionalInfoStep';
import ReviewStep from '@/components/animal-form/ReviewStep';
import { Navbar } from '@/components/Navbar';

// Type pour le formulaire
export interface AnimalFormData {
  photo: File | null;
  photo_preview: string | null;
  photo_url: string | null; // Stocke l'URL de la photo après upload
  date_entree: string;
  espece: string;
  race: string;
  couleurs: string; // Attention: utilisé comme 'couleurs' dans la base de données
  propriete: string; // Conservé pour l'interface utilisateur mais envoyé comme 'proprietaire' dans la base
  nom: string;
  identification: string;
  date_naissance: string;
  sexe: string;
  sterilise: boolean;
  particularites: string;
  provenance: string;
}

const initialFormData: AnimalFormData = {
  photo: null,
  photo_preview: null,
  photo_url: null,
  date_entree: new Date().toISOString().slice(0, 10), // Aujourd'hui au format YYYY-MM-DD
  espece: '',
  race: '',
  couleurs: '',
  propriete: '',
  nom: '',
  identification: '',
  date_naissance: '',
  sexe: '',
  sterilise: false,
  particularites: '',
  provenance: '',
};

const steps = [
  { title: 'Informations de base', component: BasicInfoStep },
  { title: 'Caractéristiques', component: CharacteristicsStep },
  { title: 'Informations personnelles', component: PersonalInfoStep },
  { title: 'Informations supplémentaires', component: AdditionalInfoStep },
  { title: 'Vérification', component: ReviewStep },
];

// Nom du bucket pour les photos
const PHOTOS_BUCKET = 'animalphoto';

const AddAnimal: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AnimalFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (fieldName: keyof AnimalFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: file,
          photo_preview: reader.result as string
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour uploader la photo
  const uploadPhoto = async (): Promise<string | null> => {
    if (!formData.photo) {
      console.log('Aucune photo à uploader');
      return null;
    }

    setIsUploading(true);
    try {
      // Générer un nom de fichier unique avec l'extension d'origine
      const fileExt = formData.photo.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      console.log(`Tentative d'upload vers le bucket ${PHOTOS_BUCKET}:`, fileName);
      
      // Uploader directement le fichier sans vérifier ni créer le bucket
      // Le bucket doit être créé manuellement dans la console Supabase
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(PHOTOS_BUCKET)
        .upload(fileName, formData.photo, {
          cacheControl: '3600',
          upsert: true,
          contentType: formData.photo.type
        });
      
      if (uploadError) {
        console.error('Erreur upload détaillée:', JSON.stringify(uploadError));
        throw new Error(`Erreur lors de l'upload de la photo: ${uploadError.message}`);
      }
      
      console.log('Fichier uploadé avec succès:', uploadData);
      
      // Récupérer l'URL publique
      const { data: publicUrlData } = await supabase
        .storage
        .from(PHOTOS_BUCKET)
        .getPublicUrl(fileName);
      
      const photoUrl = publicUrlData.publicUrl;
      console.log('URL de photo obtenue:', photoUrl);
      
      // Mettre à jour le formData avec l'URL
      setFormData(prev => ({
        ...prev,
        photo_url: photoUrl
      }));
      
      return photoUrl;
    } catch (err) {
      console.error('Erreur complète lors de l\'upload:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const nextStep = async () => {
    // Si on est à l'étape 1 et qu'il y a une photo, on l'uploade avant de passer à l'étape suivante
    if (currentStep === 0 && formData.photo && !formData.photo_url) {
      setIsUploading(true);
      try {
        const photoUrl = await uploadPhoto();
        console.log('Photo uploadée avec succès, URL:', photoUrl);
      } catch (err) {
        console.error('Erreur lors de l\'upload de la photo:', err);
        setError('Erreur lors de l\'upload de la photo. Vous pouvez continuer, mais l\'image ne sera pas enregistrée.');
      } finally {
        setIsUploading(false);
      }
    }
    
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Vérification des champs obligatoires
      if (!formData.nom) {
        setError('Le nom de l\'animal est obligatoire');
        setIsSubmitting(false);
        return;
      }

      if (!formData.espece) {
        setError('L\'espèce de l\'animal est obligatoire');
        setIsSubmitting(false);
        return;
      }

      if (!formData.sexe) {
        setError('Le sexe de l\'animal est obligatoire');
        setIsSubmitting(false);
        return;
      }

      // Si la photo n'a pas encore été uploadée, le faire maintenant
      let photoUrl = formData.photo_url;
      
      if (formData.photo && !photoUrl) {
        try {
          console.log('Upload de la photo avant soumission...');
          photoUrl = await uploadPhoto();
          console.log('Photo uploadée avec succès avant soumission, URL:', photoUrl);
          
          // Pour être sûr, attendre un peu que l'état soit mis à jour
          if (photoUrl) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (uploadErr) {
          console.error('Erreur lors de l\'upload final de la photo:', uploadErr);
        }
      }
      
      // Récupérer la dernière valeur de photo_url au cas où
      photoUrl = formData.photo_url || photoUrl;
      
      console.log('URL finale de la photo à enregistrer:', photoUrl);

      // Données à insérer avec conversion des types si nécessaire
      const animalData = {
        nom: formData.nom.trim(),
        espece: formData.espece,
        race: formData.race || null,
        couleurs: formData.couleurs || null,
        proprietaire: formData.propriete || null,
        sexe: formData.sexe,
        date_naissance: formData.date_naissance || null,
        date_entree: formData.date_entree,
        identification: formData.identification || null,
        sterilise: formData.sterilise,
        particularites: formData.particularites || null,
        provenance: formData.provenance || null,
        photo_url: photoUrl,
      };
      
      console.log('Données à insérer dans la base de données:', animalData);

      try {
        // Création de l'animal dans la base de données
        const { data: insertData, error: insertError } = await supabase
          .from('animaux')
          .insert([animalData])
          .select();

        if (insertError) {
          console.error('Erreur d\'insertion détaillée:', JSON.stringify(insertError));
          throw new Error(`Erreur lors de l'insertion: ${insertError.message} (Code: ${insertError.code})`);
        }
        
        console.log('Animal créé avec succès:', insertData);

        // Redirection vers la page d'accueil après succès
        navigate('/');
      } catch (insertErr) {
        console.error('Erreur pendant l\'insertion:', insertErr);
        throw insertErr;
      }
    } catch (err) {
      console.error('Erreur détaillée lors de la création de l\'animal:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null) {
        try {
          setError(JSON.stringify(err));
        } catch {
          setError('Une erreur inconnue est survenue lors de la création de l\'animal');
        }
      } else {
        setError('Une erreur est survenue lors de la création de l\'animal');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendu du composant de l'étape actuelle
  const StepComponent = steps[currentStep].component;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile Header - only visible on mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          aria-label="Retour"
        >
          <X className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">Ajouter un animal</h1>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      <div className="flex-1 flex flex-col p-4 lg:p-8 pb-24 max-w-2xl mx-auto w-full">
        {/* Title only shown on desktop */}
        <h1 className="hidden lg:block text-2xl font-bold mb-6 text-center">Ajouter un animal</h1>
        
        <Card className="w-full shadow-md">
          <div className="p-4 lg:p-6">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Étape {currentStep + 1} sur {steps.length}</span>
                <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / steps.length) * 100)}% complété</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-shelter-purple rounded-full h-2 transition-all duration-300 ease-in-out" 
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={isLastStep ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              {/* Contenu de l'étape actuelle */}
              <StepComponent 
                formData={formData} 
                handleInputChange={handleInputChange}
                handleFileChange={handleFileChange}
              />

              {/* Affichage des erreurs */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Boutons de navigation */}
              <div className="mt-8 pt-4 border-t flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0 || isSubmitting || isUploading}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> 
                  <span className={isUploading ? "sr-only sm:not-sr-only" : ""}>Précédent</span>
                </Button>
                
                {isLastStep ? (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isUploading}
                    className="bg-shelter-purple hover:bg-shelter-purple/90 flex items-center gap-2"
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{isUploading ? "Upload en cours..." : "Enregistrement..."}</span>
                      </>
                    ) : (
                      "Enregistrer l'animal"
                    )}
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={isUploading}
                    className="flex items-center gap-2 bg-shelter-purple hover:bg-shelter-purple/90"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Upload en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Suivant</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </Card>
      </div>

      {/* Fixed bottom navigation for mobile */}
      <Navbar className="lg:hidden" />
    </div>
  );
};

export default AddAnimal; 