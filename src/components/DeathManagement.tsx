import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Plus, X, Calendar, Download } from 'lucide-react';
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
  autopsie_file_name: string | null;
  autopsie_file_url: string | null;
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

  // File state
  const [autopsieFile, setAutopsieFile] = useState<File | null>(null);

  useEffect(() => {
    checkAuth();
    fetchDeathRecord();
  }, [animalId]);

  const checkAuth = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Session actuelle:', session);
    if (error) {
      console.error('Erreur de vérification de session:', error);
    }
    if (!session) {
      console.error('Pas de session active!');
    }
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAutopsieFile(e.target.files[0]);
    }
  };

  const addDeathRecord = async () => {
    try {
      // Vérifier l'authentification avant de procéder
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour effectuer cette action",
          variant: "destructive",
        });
        return;
      }

      console.log('Session utilisateur:', session);

      if (!newDeathRecord.cause.trim()) {
        toast({
          title: "Champ requis",
          description: "Veuillez indiquer la cause du décès",
          variant: "destructive",
        });
        return;
      }

      let filePath = null;
      let fileName = null;

      // Upload file if exists and autopsie is true
      if (newDeathRecord.autopsie && autopsieFile) {
        try {
          console.log('Début de l\'upload du fichier d\'autopsie');
          console.log('Fichier à uploader:', autopsieFile);
          
          // Garder le nom original du fichier pour la base de données
          const originalFileName = autopsieFile.name;
          
          // Créer un nom unique pour le stockage
          const fileExt = autopsieFile.name.split('.').pop();
          const storageFileName = `${Date.now()}.${fileExt}`;
          filePath = `${animalId}/${storageFileName}`;
          
          console.log('Nom original du fichier:', originalFileName);
          console.log('Chemin du fichier dans le storage:', filePath);
          
          // Vérifier si le fichier existe déjà
          const { data: existingFile } = await supabase.storage
            .from('deces')
            .list(animalId.toString());

          if (existingFile?.some(file => file.name === storageFileName)) {
            console.log('Le fichier existe déjà, tentative de suppression');
            await supabase.storage
              .from('deces')
              .remove([`${animalId}/${storageFileName}`]);
          }

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('deces')
            .upload(filePath, autopsieFile, {
              cacheControl: '3600',
              upsert: true,
              contentType: autopsieFile.type
            });

          if (uploadError) {
            console.error('Erreur d\'upload:', uploadError);
            throw uploadError;
          }

          console.log('Upload réussi:', uploadData);

          // Mettre à jour fileName avec le nom original
          fileName = originalFileName;

          // Get public URL
          const { data: publicUrlData } = await supabase.storage
            .from('deces')
            .getPublicUrl(filePath);

          console.log('URL publique:', publicUrlData);
          filePath = publicUrlData.publicUrl;
        } catch (err) {
          console.error('Erreur détaillée lors de l\'upload:', err);
          toast({
            title: "Erreur d'upload",
            description: "Impossible d'uploader le fichier d'autopsie. Veuillez réessayer.",
            variant: "destructive",
          });
          return;
        }
      }

      const deathRecord = {
        animal_id: animalId,
        date: newDeathRecord.date,
        cause: newDeathRecord.cause,
        autopsie: newDeathRecord.autopsie,
        autopsie_file_name: fileName,
        autopsie_file_url: filePath
      };

      console.log('Tentative d\'insertion avec les données:', deathRecord);

      const { data, error } = await supabase
        .from('deces')
        .insert([deathRecord])
        .select();

      if (error) {
        console.error('Erreur d\'insertion dans la table deces:', error);
        console.error('Détails complets de l\'erreur:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Insertion réussie, données retournées:', data);

      toast({
        title: "Décès enregistré",
        description: "Les informations de décès ont été enregistrées",
      });

      setNewDeathRecord({
        date: new Date().toISOString().split('T')[0],
        cause: '',
        autopsie: false,
      });
      setAutopsieFile(null);
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

  const downloadAutopsieFile = async (fileUrl: string, fileName: string) => {
    try {
      console.log('Tentative de téléchargement du fichier:', fileUrl);
      
      // Extraire le chemin relatif de l'URL complète
      const pathMatch = fileUrl.match(/\/deces\/(.+)$/);
      if (!pathMatch) {
        throw new Error('Format d\'URL invalide');
      }
      const filePath = pathMatch[1];
      
      console.log('Chemin du fichier pour le téléchargement:', filePath);
      
      const { data, error } = await supabase.storage
        .from('deces')
        .download(filePath);

      if (error) {
        console.error('Erreur lors du téléchargement:', error);
        throw error;
      }

      // Créer un blob et télécharger le fichier
      const blob = new Blob([data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'autopsie.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      console.error('Erreur détaillée lors du téléchargement:', err);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le fichier d'autopsie. Veuillez réessayer.",
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

                {newDeathRecord.autopsie && (
                  <div className="space-y-2">
                    <Label htmlFor="autopsie-file">Rapport d'autopsie</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="autopsie-file"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="flex-1"
                      />
                      {autopsieFile && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setAutopsieFile(null)}
                          className="flex-none"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {autopsieFile && (
                      <p className="text-sm text-muted-foreground">{autopsieFile.name}</p>
                    )}
                  </div>
                )}

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
              <div className="flex items-center gap-2">
                <p className="text-gray-700">{deathRecord.autopsie ? 'Oui' : 'Non'}</p>
                {deathRecord.autopsie && deathRecord.autopsie_file_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAutopsieFile(deathRecord.autopsie_file_url, deathRecord.autopsie_file_name || 'autopsie.pdf')}
                    className="ml-2"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le rapport
                  </Button>
                )}
              </div>
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