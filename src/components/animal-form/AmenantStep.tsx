import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AnimalFormData } from '@/pages/AddAnimal';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Plus } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Amenant {
  id: number;
  nom_prenom: string;
  entreprise: string;
  telephone: string;
  email: string;
  adresse: string;
}

interface AmenantStepProps {
  formData: AnimalFormData;
  handleInputChange: (fieldName: keyof AnimalFormData, value: any) => void;
}

const AmenantStep: React.FC<AmenantStepProps> = ({
  formData,
  handleInputChange,
}) => {
  const [amenants, setAmenants] = useState<Amenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAmenant, setNewAmenant] = useState({
    nom_prenom: '',
    entreprise: '',
    telephone: '',
    email: '',
    adresse: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAmenants();
  }, []);

  const fetchAmenants = async () => {
    try {
      const { data, error } = await supabase
        .from('amenants')
        .select('*')
        .order('nom_prenom');

      if (error) {
        console.error('Erreur lors de la récupération des amenants:', error);
        throw error;
      }
      setAmenants(data || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des amenants:', err);
      setError('Erreur lors de la récupération des amenants. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAmenantSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!newAmenant.nom_prenom.trim()) {
        throw new Error('Le nom et prénom sont obligatoires');
      }

      const { data, error } = await supabase
        .from('amenants')
        .insert([{
          nom_prenom: newAmenant.nom_prenom.trim(),
          telephone: newAmenant.telephone.trim() || null,
          email: newAmenant.email.trim() || null,
          entreprise: newAmenant.entreprise.trim() || null,
          adresse: newAmenant.adresse.trim() || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur détaillée lors de la création:', error);
        throw new Error('Erreur lors de la création de l\'amenant');
      }

      setAmenants([...amenants, data]);
      handleInputChange('amenant_id', data.id);
      setIsDialogOpen(false);
      setNewAmenant({ nom_prenom: '', telephone: '', email: '', entreprise: '', adresse: '' });
    } catch (err) {
      console.error('Erreur lors de la création de l\'amenant:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'amenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour obtenir le texte à afficher pour un amenant
  const getAmenantDisplayText = (amenant: Amenant) => {
    const parts = [amenant.nom_prenom];
    if (amenant.entreprise) {
      parts.push(`(${amenant.entreprise})`);
    }
    return parts.join(' ');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Amenant</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Sélectionner un amenant</Label>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouvel amenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel amenant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="nom_prenom">Nom et prénom*</Label>
                  <Input
                    id="nom_prenom"
                    value={newAmenant.nom_prenom}
                    onChange={(e) => setNewAmenant({ ...newAmenant, nom_prenom: e.target.value })}
                    required
                    placeholder="ex: Dupont Jean"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entreprise">Entreprise</Label>
                  <Input
                    id="entreprise"
                    value={newAmenant.entreprise}
                    onChange={(e) => setNewAmenant({ ...newAmenant, entreprise: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={newAmenant.telephone}
                    onChange={(e) => setNewAmenant({ ...newAmenant, telephone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAmenant.email}
                    onChange={(e) => setNewAmenant({ ...newAmenant, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input
                    id="adresse"
                    value={newAmenant.adresse}
                    onChange={(e) => setNewAmenant({ ...newAmenant, adresse: e.target.value })}
                  />
                </div>
                <Button
                  type="button"
                  className="w-full mt-4"
                  onClick={handleNewAmenantSubmit}
                  disabled={isSubmitting || !newAmenant.nom_prenom.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    'Créer l\'amenant'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-shelter-purple" />
          </div>
        ) : (
          <Select
            value={formData.amenant_id?.toString()}
            onValueChange={(value) => handleInputChange('amenant_id', parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un amenant" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {amenants.map((amenant) => (
                  <SelectItem
                    key={amenant.id}
                    value={amenant.id.toString()}
                    className="cursor-pointer"
                  >
                    {getAmenantDisplayText(amenant)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default AmenantStep; 