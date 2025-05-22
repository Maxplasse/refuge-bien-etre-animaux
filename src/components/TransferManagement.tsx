import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TransferRecord {
  id: number;
  animal_id: number;
  date: string;
  nom_adoptant: string;
  adresse: string | null;
  telephone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface TransferManagementProps {
  animalId: number;
}

const TransferManagement: React.FC<TransferManagementProps> = ({ animalId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    nom_adoptant: '',
    adresse: '',
    telephone: '',
    notes: '',
  });

  useEffect(() => {
    fetchTransfers();
  }, [animalId]);

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transferts')
        .select('*')
        .eq('animal_id', animalId)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransfers(data || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des transferts:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.nom_adoptant) {
        throw new Error('Le nom de l\'adoptant est obligatoire');
      }

      if (!formData.date) {
        throw new Error('La date du transfert est obligatoire');
      }

      const { data, error } = await supabase
        .from('transferts')
        .insert([
          {
            animal_id: animalId,
            date: formData.date,
            nom_adoptant: formData.nom_adoptant,
            adresse: formData.adresse || null,
            telephone: formData.telephone || null,
            notes: formData.notes || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTransfers([data, ...transfers]);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        nom_adoptant: '',
        adresse: '',
        telephone: '',
        notes: '',
      });
      setIsDialogOpen(false);

      toast({
        title: 'Transfert enregistré',
        description: 'Le transfert de l\'animal a été enregistré avec succès.',
      });
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du transfert:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement du transfert',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transfert / Adoption</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau transfert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer un transfert</DialogTitle>
              <DialogDescription>
                Saisissez les informations du transfert ou de l'adoption de l'animal.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive" className="my-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="date">Date du transfert*</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="nom_adoptant">Nom de l'adoptant*</Label>
                <Input
                  id="nom_adoptant"
                  name="nom_adoptant"
                  value={formData.nom_adoptant}
                  onChange={handleInputChange}
                  placeholder="Prénom et Nom"
                  required
                />
              </div>
              <div>
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="Adresse complète"
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  placeholder="Numéro de téléphone"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Informations supplémentaires"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.nom_adoptant || !formData.date}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-shelter-purple" />
        </div>
      ) : transfers.length > 0 ? (
        <Table>
          <TableCaption>Historique des transferts de l'animal</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Adoptant</TableHead>
              <TableHead className="hidden md:table-cell">Téléphone</TableHead>
              <TableHead className="hidden md:table-cell">Adresse</TableHead>
              <TableHead className="hidden lg:table-cell">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="font-medium">{formatDate(transfer.date)}</TableCell>
                <TableCell>{transfer.nom_adoptant}</TableCell>
                <TableCell className="hidden md:table-cell">{transfer.telephone || '-'}</TableCell>
                <TableCell className="hidden md:table-cell">{transfer.adresse || '-'}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {transfer.notes || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">Aucun transfert enregistré pour cet animal</p>
          <p className="text-sm text-gray-400 mt-1">
            Utilisez le bouton "Nouveau transfert" pour enregistrer un transfert
          </p>
        </div>
      )}
    </div>
  );
};

export default TransferManagement; 