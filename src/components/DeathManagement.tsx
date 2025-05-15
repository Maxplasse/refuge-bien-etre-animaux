import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Plus, X, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface DeathRecord {
  id: number;
  animal_id: number;
  date: string;
  cause: string;
  autopsie: boolean;
}

interface DeathManagementProps {
  animalId: number;
}

const DeathManagement: React.FC<DeathManagementProps> = ({ animalId }) => {
  const [deathRecord, setDeathRecord] = useState<DeathRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [newDeathRecord, setNewDeathRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    cause: '',
    autopsie: false,
  });

  useEffect(() => {
    fetchDeathRecord();
  }, [animalId]);

  const fetchDeathRecord = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deces')
        .select('*')
        .eq('animal_id', animalId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setDeathRecord(data);
    } catch (err) {
      console.error('Error fetching death record:', err);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les informations de décès",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDeathRecord = async () => {
    try {
      if (!newDeathRecord.cause.trim()) {
        toast({
          title: "Champ requis",
          description: "Veuillez indiquer la cause du décès",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('deces')
        .insert([
          {
            animal_id: animalId,
            date: newDeathRecord.date,
            cause: newDeathRecord.cause,
            autopsie: newDeathRecord.autopsie,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Décès enregistré",
        description: "Les informations de décès ont été enregistrées",
      });

      setNewDeathRecord({
        date: new Date().toISOString().split('T')[0],
        cause: '',
        autopsie: false,
      });
      setIsDialogOpen(false);
      fetchDeathRecord();
    } catch (err) {
      console.error('Error adding death record:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les informations de décès",
        variant: "destructive",
      });
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

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-shelter-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">État de l'animal</h3>
        
        {!deathRecord ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-red-500 text-red-700 hover:bg-red-50"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Déclarer un décès
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Déclarer le décès de l'animal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="deathDate">Date du décès</Label>
                  <Input
                    id="deathDate"
                    type="date"
                    value={newDeathRecord.date}
                    onChange={(e) => setNewDeathRecord({
                      ...newDeathRecord,
                      date: e.target.value,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cause">Cause du décès</Label>
                  <Textarea
                    id="cause"
                    value={newDeathRecord.cause}
                    onChange={(e) => setNewDeathRecord({
                      ...newDeathRecord,
                      cause: e.target.value,
                    })}
                    placeholder="Cause du décès"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autopsie"
                    checked={newDeathRecord.autopsie}
                    onCheckedChange={(checked) => setNewDeathRecord({
                      ...newDeathRecord,
                      autopsie: checked,
                    })}
                  />
                  <Label htmlFor="autopsie">Autopsie effectuée</Label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <DialogClose asChild>
                    <Button variant="outline">
                      <X className="mr-2 h-4 w-4" />
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button 
                    onClick={addDeathRecord}
                    variant="destructive"
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {deathRecord ? (
        <Card className="border-red-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-700">
              Animal décédé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Date du décès</h4>
              <p className="text-gray-700">{formatDate(deathRecord.date)}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Cause</h4>
              <p className="text-gray-700">{deathRecord.cause}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Autopsie</h4>
              <p className="text-gray-700">{deathRecord.autopsie ? 'Oui' : 'Non'}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              Animal vivant
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeathManagement; 