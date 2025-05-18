import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Plus, Edit, Trash, FileText, Download, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface TraitementRecord {
  id: number;
  animal_id: number;
  designation: string;
  date: string | null;
  ordonnance: string | null;
  ordonnance_file_path: string | null;
  ordonnance_file_name: string | null;
  created_at: string;
  observation: string | null;
}

interface VaccinationRecord {
  id: number;
  animal_id: number;
  designation: string;
  date: string | null;
  ordonnance: string | null;
  ordonnance_file_path: string | null;
  ordonnance_file_name: string | null;
  created_at: string;
  observation: string | null;
}

interface HealthManagementProps {
  animalId: number;
}

const HealthManagement: React.FC<HealthManagementProps> = ({ animalId }) => {
  const [traitements, setTraitements] = useState<TraitementRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('traitements');
  
  // Form states for adding new records
  const [newTraitement, setNewTraitement] = useState({
    designation: '',
    date: new Date().toISOString().split('T')[0],
    ordonnance: '',
    observation: '',
  });
  
  const [newVaccination, setNewVaccination] = useState({
    designation: '',
    date: new Date().toISOString().split('T')[0],
    ordonnance: '',
    observation: '',
  });

  // File states
  const [traitementFile, setTraitementFile] = useState<File | null>(null);
  const [vaccinationFile, setVaccinationFile] = useState<File | null>(null);
  const [isUploadingTraitementFile, setIsUploadingTraitementFile] = useState(false);
  const [isUploadingVaccinationFile, setIsUploadingVaccinationFile] = useState(false);
  
  // State for editing
  const [isEditingTraitement, setIsEditingTraitement] = useState(false);
  const [editTraitementData, setEditTraitementData] = useState({
    id: 0,
    designation: '',
    date: '',
    ordonnance: '',
    observation: '',
  });
  
  const [isEditingVaccination, setIsEditingVaccination] = useState(false);
  const [editVaccinationData, setEditVaccinationData] = useState({
    id: 0,
    designation: '',
    date: '',
    ordonnance: '',
    observation: '',
  });

  // Edit file states
  const [editTraitementFile, setEditTraitementFile] = useState<File | null>(null);
  const [editVaccinationFile, setEditVaccinationFile] = useState<File | null>(null);
  
  // Loading states
  const [isAddingTraitement, setIsAddingTraitement] = useState(false);
  const [isAddingVaccination, setIsAddingVaccination] = useState(false);
  const [isSavingTraitement, setIsSavingTraitement] = useState(false);
  const [isSavingVaccination, setIsSavingVaccination] = useState(false);

  useEffect(() => {
    fetchTraitements();
    fetchVaccinations();
  }, [animalId]);

  const fetchTraitements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('traitements')
        .select('*')
        .eq('animal_id', animalId)
        .order('date', { ascending: false });

      if (error) throw error;
      setTraitements(data || []);
    } catch (err) {
      console.error('Error fetching traitements:', err);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données de traitements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('animal_id', animalId)
        .order('date', { ascending: false });

      if (error) throw error;
      setVaccinations(data || []);
    } catch (err) {
      console.error('Error fetching vaccinations:', err);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données de vaccinations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTraitement = async () => {
    try {
      if (!newTraitement.designation.trim()) {
        toast({
          title: "Champ requis",
          description: "Veuillez indiquer la désignation du traitement",
          variant: "destructive",
        });
        return;
      }

      setIsAddingTraitement(true);
      
      // Handle file upload if a file is selected
      let filePath = null;
      let fileName = null;
      
      if (traitementFile) {
        setIsUploadingTraitementFile(true);
        filePath = await uploadFile(traitementFile, 'traitementsordonnances');
        fileName = traitementFile.name;
        setIsUploadingTraitementFile(false);
        
        if (!filePath) {
          toast({
            title: "Erreur",
            description: "Impossible d'uploader le fichier d'ordonnance",
            variant: "destructive",
          });
          // Continue without file
        }
      }
      
      const { error } = await supabase
        .from('traitements')
        .insert([
          { 
            animal_id: animalId,
            designation: newTraitement.designation.trim(),
            date: new Date(newTraitement.date),
            ordonnance: newTraitement.ordonnance.trim() || null,
            ordonnance_file_path: filePath,
            ordonnance_file_name: fileName,
            observation: newTraitement.observation.trim() || null,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Traitement ajouté",
        description: "Le traitement a été ajouté avec succès",
      });

      // Reset form
      setNewTraitement({
        designation: '',
        date: new Date().toISOString().split('T')[0],
        ordonnance: '',
        observation: '',
      });
      setTraitementFile(null);
      setIsAddingTraitement(false);
      
      // Refresh data
      fetchTraitements();

    } catch (err) {
      console.error('Error adding traitement:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le traitement",
        variant: "destructive",
      });
    } finally {
      setIsAddingTraitement(false);
    }
  };

  const addVaccination = async () => {
    try {
      if (!newVaccination.designation.trim()) {
        toast({
          title: "Champ requis",
          description: "Veuillez indiquer la désignation de la vaccination",
          variant: "destructive",
        });
        return;
      }

      setIsAddingVaccination(true);
      
      // Handle file upload if a file is selected
      let filePath = null;
      let fileName = null;
      
      if (vaccinationFile) {
        setIsUploadingVaccinationFile(true);
        filePath = await uploadFile(vaccinationFile, 'vaccinationsordonnances');
        fileName = vaccinationFile.name;
        setIsUploadingVaccinationFile(false);
        
        if (!filePath) {
          toast({
            title: "Erreur",
            description: "Impossible d'uploader le fichier d'ordonnance",
            variant: "destructive",
          });
          // Continue without file
        }
      }
      
      const { error } = await supabase
        .from('vaccinations')
        .insert([
          { 
            animal_id: animalId,
            designation: newVaccination.designation.trim(),
            date: new Date(newVaccination.date),
            ordonnance: newVaccination.ordonnance.trim() || null,
            ordonnance_file_path: filePath,
            ordonnance_file_name: fileName,
            observation: newVaccination.observation.trim() || null,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Vaccination ajoutée",
        description: "La vaccination a été ajoutée avec succès",
      });

      // Reset form
      setNewVaccination({
        designation: '',
        date: new Date().toISOString().split('T')[0],
        ordonnance: '',
        observation: '',
      });
      setVaccinationFile(null);
      setIsAddingVaccination(false);
      
      // Refresh data
      fetchVaccinations();

    } catch (err) {
      console.error('Error adding vaccination:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la vaccination",
        variant: "destructive",
      });
    } finally {
      setIsAddingVaccination(false);
    }
  };

  const updateTraitement = async () => {
    try {
      if (!editTraitementData.designation.trim()) {
        toast({
          title: "Champ requis",
          description: "Veuillez indiquer la désignation du traitement",
          variant: "destructive",
        });
        return;
      }

      setIsSavingTraitement(true);
      
      // Get current traitement data to check if we need to update file
      const { data: currentData, error: fetchError } = await supabase
        .from('traitements')
        .select('ordonnance_file_path, ordonnance_file_name')
        .eq('id', editTraitementData.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Handle file upload if a new file is selected
      let filePath = currentData?.ordonnance_file_path || null;
      let fileName = currentData?.ordonnance_file_name || null;
      
      if (editTraitementFile) {
        setIsUploadingTraitementFile(true);
        
        // Delete old file if it exists
        if (filePath) {
          await supabase.storage
            .from('traitementsordonnances')
            .remove([filePath]);
        }
        
        // Upload new file
        filePath = await uploadFile(editTraitementFile, 'traitementsordonnances');
        fileName = editTraitementFile.name;
        setIsUploadingTraitementFile(false);
        
        if (!filePath) {
          toast({
            title: "Erreur",
            description: "Impossible d'uploader le fichier d'ordonnance",
            variant: "destructive",
          });
          // Continue without the file update
        }
      }
      
      const { error } = await supabase
        .from('traitements')
        .update({ 
          designation: editTraitementData.designation.trim(),
          date: new Date(editTraitementData.date),
          ordonnance: editTraitementData.ordonnance.trim() || null,
          ordonnance_file_path: filePath,
          ordonnance_file_name: fileName,
          observation: editTraitementData.observation.trim() || null,
        })
        .eq('id', editTraitementData.id);

      if (error) throw error;

      toast({
        title: "Traitement mis à jour",
        description: "Le traitement a été mis à jour avec succès",
      });

      setIsEditingTraitement(false);
      setEditTraitementFile(null);
      setIsSavingTraitement(false);
      
      // Refresh traitements
      fetchTraitements();

    } catch (err) {
      console.error('Error updating traitement:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le traitement",
        variant: "destructive",
      });
    } finally {
      setIsSavingTraitement(false);
    }
  };

  const updateVaccination = async () => {
    try {
      if (!editVaccinationData.designation.trim()) {
        toast({
          title: "Champ requis",
          description: "Veuillez indiquer la désignation de la vaccination",
          variant: "destructive",
        });
        return;
      }

      setIsSavingVaccination(true);
      
      // Get current vaccination data to check if we need to update file
      const { data: currentData, error: fetchError } = await supabase
        .from('vaccinations')
        .select('ordonnance_file_path, ordonnance_file_name')
        .eq('id', editVaccinationData.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Handle file upload if a new file is selected
      let filePath = currentData?.ordonnance_file_path || null;
      let fileName = currentData?.ordonnance_file_name || null;
      
      if (editVaccinationFile) {
        setIsUploadingVaccinationFile(true);
        
        // Delete old file if it exists
        if (filePath) {
          await supabase.storage
            .from('vaccinationsordonnances')
            .remove([filePath]);
        }
        
        // Upload new file
        filePath = await uploadFile(editVaccinationFile, 'vaccinationsordonnances');
        fileName = editVaccinationFile.name;
        setIsUploadingVaccinationFile(false);
        
        if (!filePath) {
          toast({
            title: "Erreur",
            description: "Impossible d'uploader le fichier d'ordonnance",
            variant: "destructive",
          });
          // Continue without the file update
        }
      }
      
      const { error } = await supabase
        .from('vaccinations')
        .update({ 
          designation: editVaccinationData.designation.trim(),
          date: new Date(editVaccinationData.date),
          ordonnance: editVaccinationData.ordonnance.trim() || null,
          ordonnance_file_path: filePath,
          ordonnance_file_name: fileName,
          observation: editVaccinationData.observation.trim() || null,
        })
        .eq('id', editVaccinationData.id);

      if (error) throw error;

      toast({
        title: "Vaccination mise à jour",
        description: "La vaccination a été mise à jour avec succès",
      });

      setIsEditingVaccination(false);
      setEditVaccinationFile(null);
      setIsSavingVaccination(false);
      
      // Refresh vaccinations
      fetchVaccinations();

    } catch (err) {
      console.error('Error updating vaccination:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la vaccination",
        variant: "destructive",
      });
    } finally {
      setIsSavingVaccination(false);
    }
  };

  const deleteTraitement = async (id: number) => {
    try {
      // Get file path before deleting the record
      const { data, error: fetchError } = await supabase
        .from('traitements')
        .select('ordonnance_file_path')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Delete the record
      const { error } = await supabase
        .from('traitements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Delete associated file if it exists
      if (data?.ordonnance_file_path) {
        await supabase.storage
          .from('traitementsordonnances')
          .remove([data.ordonnance_file_path]);
      }

      toast({
        title: "Traitement supprimé",
        description: "Le traitement a été supprimé avec succès",
      });

      fetchTraitements();
    } catch (err) {
      console.error('Error deleting traitement:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le traitement",
        variant: "destructive",
      });
    }
  };

  const deleteVaccination = async (id: number) => {
    try {
      // Get file path before deleting the record
      const { data, error: fetchError } = await supabase
        .from('vaccinations')
        .select('ordonnance_file_path')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Delete the record
      const { error } = await supabase
        .from('vaccinations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Delete associated file if it exists
      if (data?.ordonnance_file_path) {
        await supabase.storage
          .from('vaccinationsordonnances')
          .remove([data.ordonnance_file_path]);
      }

      toast({
        title: "Vaccination supprimée",
        description: "La vaccination a été supprimée avec succès",
      });

      fetchVaccinations();
    } catch (err) {
      console.error('Error deleting vaccination:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la vaccination",
        variant: "destructive",
      });
    }
  };

  const prepareEditTraitement = (traitement: TraitementRecord) => {
    setEditTraitementData({
      id: traitement.id,
      designation: traitement.designation || '',
      date: traitement.date ? new Date(traitement.date).toISOString().split('T')[0] : '',
      ordonnance: traitement.ordonnance || '',
      observation: traitement.observation || '',
    });
    setEditTraitementFile(null);
    setIsEditingTraitement(true);
  };

  const prepareEditVaccination = (vaccination: VaccinationRecord) => {
    setEditVaccinationData({
      id: vaccination.id,
      designation: vaccination.designation || '',
      date: vaccination.date ? new Date(vaccination.date).toISOString().split('T')[0] : '',
      ordonnance: vaccination.ordonnance || '',
      observation: vaccination.observation || '',
    });
    setEditVaccinationFile(null);
    setIsEditingVaccination(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${animalId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;
      
      return filePath;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const downloadFile = async (filePath: string, fileName: string, bucket: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);
        
      if (error) throw error;
      
      // Create a URL for the file and initiate download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive",
      });
    }
  };

  if (loading && traitements.length === 0 && vaccinations.length === 0) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-shelter-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Suivi de santé</h3>

      {/* Replace old custom tab navigation with smaller tag-like tabs */}
      <Tabs 
        defaultValue="traitements" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="traitements">Traitements</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Traitements content */}
      <div className={activeTab === 'traitements' ? 'block' : 'hidden'}>
        <div className="flex justify-end mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="bg-shelter-purple hover:bg-shelter-purple/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau traitement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un traitement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="designation">Désignation</Label>
                  <Input
                    id="designation"
                    value={newTraitement.designation}
                    onChange={(e) => setNewTraitement({...newTraitement, designation: e.target.value})}
                    placeholder="Type de traitement"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTraitement.date}
                    onChange={(e) => setNewTraitement({...newTraitement, date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ordonnance">Numéro d'ordonnance</Label>
                  <Input
                    id="ordonnance"
                    value={newTraitement.ordonnance}
                    onChange={(e) => setNewTraitement({...newTraitement, ordonnance: e.target.value})}
                    placeholder="Numéro d'ordonnance"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ordonnance-file">Fichier d'ordonnance</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="ordonnance-file"
                      type="file"
                      onChange={(e) => handleFileChange(e, setTraitementFile)}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="flex-1"
                    />
                    {traitementFile && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setTraitementFile(null)}
                        className="flex-none"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {traitementFile && (
                    <p className="text-sm text-muted-foreground">{traitementFile.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="traitement-observation">Observations</Label>
                  <Textarea
                    id="traitement-observation"
                    value={newTraitement.observation}
                    onChange={(e) => setNewTraitement({...newTraitement, observation: e.target.value})}
                    placeholder="Observations sur le traitement"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button 
                  onClick={addTraitement} 
                  disabled={isAddingTraitement || isUploadingTraitementFile}
                >
                  {isAddingTraitement || isUploadingTraitementFile ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {traitements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                Aucun traitement enregistré
              </p>
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Désignation</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Ordonnance</TableHead>
                <TableHead>Fichier</TableHead>
                <TableHead>Observations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {traitements.map((traitement) => (
                <TableRow key={traitement.id}>
                  <TableCell>{traitement.designation}</TableCell>
                  <TableCell>{formatDate(traitement.date)}</TableCell>
                  <TableCell>{traitement.ordonnance || "-"}</TableCell>
                  <TableCell>
                    {traitement.ordonnance_file_path ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadFile(
                          traitement.ordonnance_file_path!, 
                          traitement.ordonnance_file_name || 'ordonnance.pdf',
                          'traitementsordonnances'
                        )}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Télécharger</span>
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{traitement.observation || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => prepareEditTraitement(traitement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier un traitement</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-designation">Désignation</Label>
                              <Input
                                id="edit-designation"
                                value={editTraitementData.designation}
                                onChange={(e) => setEditTraitementData({...editTraitementData, designation: e.target.value})}
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-date">Date</Label>
                              <Input
                                id="edit-date"
                                type="date"
                                value={editTraitementData.date}
                                onChange={(e) => setEditTraitementData({...editTraitementData, date: e.target.value})}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-ordonnance">Numéro d'ordonnance</Label>
                              <Input
                                id="edit-ordonnance"
                                value={editTraitementData.ordonnance}
                                onChange={(e) => setEditTraitementData({...editTraitementData, ordonnance: e.target.value})}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-ordonnance-file">Fichier d'ordonnance</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id="edit-ordonnance-file"
                                  type="file"
                                  onChange={(e) => handleFileChange(e, setEditTraitementFile)}
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  className="flex-1"
                                />
                                {editTraitementFile && (
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => setEditTraitementFile(null)}
                                    className="flex-none"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              {editTraitementFile && (
                                <p className="text-sm text-muted-foreground">{editTraitementFile.name}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-traitement-observation">Observations</Label>
                              <Textarea
                                id="edit-traitement-observation"
                                value={editTraitementData.observation}
                                onChange={(e) => setEditTraitementData({...editTraitementData, observation: e.target.value})}
                                placeholder="Observations sur le traitement"
                                rows={3}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button 
                              onClick={updateTraitement} 
                              disabled={isSavingTraitement || isUploadingTraitementFile}
                            >
                              {isSavingTraitement || isUploadingTraitementFile ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Edit className="mr-2 h-4 w-4" />
                              )}
                              Enregistrer
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-500">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le traitement</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer ce traitement ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTraitement(traitement.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* Vaccinations content */}
      <div className={activeTab === 'vaccinations' ? 'block' : 'hidden'}>
        <div className="flex justify-end mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="bg-shelter-purple hover:bg-shelter-purple/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle vaccination
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une vaccination</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="vax-designation">Désignation</Label>
                  <Input
                    id="vax-designation"
                    value={newVaccination.designation}
                    onChange={(e) => setNewVaccination({...newVaccination, designation: e.target.value})}
                    placeholder="Type de vaccination"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vax-date">Date</Label>
                  <Input
                    id="vax-date"
                    type="date"
                    value={newVaccination.date}
                    onChange={(e) => setNewVaccination({...newVaccination, date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vax-ordonnance">Ordonnance</Label>
                  <Input
                    id="vax-ordonnance"
                    value={newVaccination.ordonnance}
                    onChange={(e) => setNewVaccination({...newVaccination, ordonnance: e.target.value})}
                    placeholder="Numéro d'ordonnance"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vax-ordonnance-file">Fichier d'ordonnance</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="vax-ordonnance-file"
                      type="file"
                      onChange={(e) => handleFileChange(e, setVaccinationFile)}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="flex-1"
                    />
                    {vaccinationFile && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setVaccinationFile(null)}
                        className="flex-none"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {vaccinationFile && (
                    <p className="text-sm text-muted-foreground">{vaccinationFile.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vax-observation">Observations</Label>
                  <Textarea
                    id="vax-observation"
                    value={newVaccination.observation}
                    onChange={(e) => setNewVaccination({...newVaccination, observation: e.target.value})}
                    placeholder="Observations sur la vaccination"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button 
                  onClick={addVaccination} 
                  disabled={isAddingVaccination || isUploadingVaccinationFile}
                >
                  {isAddingVaccination || isUploadingVaccinationFile ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {vaccinations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                Aucune vaccination enregistrée
              </p>
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Désignation</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Ordonnance</TableHead>
                <TableHead>Fichier</TableHead>
                <TableHead>Observations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaccinations.map((vaccination) => (
                <TableRow key={vaccination.id}>
                  <TableCell>{vaccination.designation}</TableCell>
                  <TableCell>{formatDate(vaccination.date)}</TableCell>
                  <TableCell>{vaccination.ordonnance || "-"}</TableCell>
                  <TableCell>
                    {vaccination.ordonnance_file_path ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => downloadFile(
                          vaccination.ordonnance_file_path!, 
                          vaccination.ordonnance_file_name || 'ordonnance.pdf',
                          'vaccinationsordonnances'
                        )}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Télécharger</span>
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{vaccination.observation || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => prepareEditVaccination(vaccination)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier une vaccination</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-vax-designation">Désignation</Label>
                              <Input
                                id="edit-vax-designation"
                                value={editVaccinationData.designation}
                                onChange={(e) => setEditVaccinationData({...editVaccinationData, designation: e.target.value})}
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-vax-date">Date</Label>
                              <Input
                                id="edit-vax-date"
                                type="date"
                                value={editVaccinationData.date}
                                onChange={(e) => setEditVaccinationData({...editVaccinationData, date: e.target.value})}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-vax-ordonnance">Ordonnance</Label>
                              <Input
                                id="edit-vax-ordonnance"
                                value={editVaccinationData.ordonnance}
                                onChange={(e) => setEditVaccinationData({...editVaccinationData, ordonnance: e.target.value})}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-vax-ordonnance-file">Fichier d'ordonnance</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id="edit-vax-ordonnance-file"
                                  type="file"
                                  onChange={(e) => handleFileChange(e, setEditVaccinationFile)}
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  className="flex-1"
                                />
                                {editVaccinationFile && (
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => setEditVaccinationFile(null)}
                                    className="flex-none"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              {editVaccinationFile && (
                                <p className="text-sm text-muted-foreground">{editVaccinationFile.name}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-vax-observation">Observations</Label>
                              <Textarea
                                id="edit-vax-observation"
                                value={editVaccinationData.observation}
                                onChange={(e) => setEditVaccinationData({...editVaccinationData, observation: e.target.value})}
                                placeholder="Observations sur la vaccination"
                                rows={3}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button 
                              onClick={updateVaccination} 
                              disabled={isSavingVaccination || isUploadingVaccinationFile}
                            >
                              {isSavingVaccination || isUploadingVaccinationFile ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Edit className="mr-2 h-4 w-4" />
                              )}
                              Enregistrer
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-500">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la vaccination</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer cette vaccination ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteVaccination(vaccination.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default HealthManagement; 