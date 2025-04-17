import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Plus, X, Calendar, Save, Edit, Trash } from 'lucide-react';
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

interface QuarantineRecord {
  id: number;
  animal_id: number;
  date_debut: string | null;
  date_fin: string | null;
  raison: string | null;
  observations: string | null;
  created_at: string;
}

interface ObservationRecord {
  id: number;
  quarantine_id: number;
  date: string | null;
  description: string | null;
  resultat_test: string | null;
  created_at: string;
}

interface QuarantineManagementProps {
  animalId: number;
}

const QuarantineManagement: React.FC<QuarantineManagementProps> = ({ animalId }) => {
  const [quarantines, setQuarantines] = useState<QuarantineRecord[]>([]);
  const [observations, setObservations] = useState<{ [key: number]: ObservationRecord[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeQuarantine, setActiveQuarantine] = useState<QuarantineRecord | null>(null);
  const [isStartingQuarantine, setIsStartingQuarantine] = useState(false);
  const [isEndingQuarantine, setIsEndingQuarantine] = useState(false);
  const [isAddingObservation, setIsAddingObservation] = useState(false);
  const [selectedQuarantineId, setSelectedQuarantineId] = useState<number | null>(null);
  
  // Form states
  const [newQuarantineReason, setNewQuarantineReason] = useState('');
  const [endQuarantineNotes, setEndQuarantineNotes] = useState('');
  const [newObservationData, setNewObservationData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    resultat_test: '',
  });
  const [isEditingQuarantine, setIsEditingQuarantine] = useState(false);
  const [editQuarantineData, setEditQuarantineData] = useState({
    id: 0,
    raison: '',
    date_debut: '',
    date_fin: null as string | null,
    observations: ''
  });

  // Add these to your component state
  const [newQuarantineStartDate, setNewQuarantineStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newQuarantineEndDate, setNewQuarantineEndDate] = useState(() => {
    // Default to one month later
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchQuarantines();
  }, [animalId]);

  const fetchQuarantines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quarantines')
        .select('*')
        .eq('animal_id', animalId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuarantines(data || []);

      // Check if there's an active quarantine (no end date)
      const active = (data || []).find(q => q.date_fin === null);
      setActiveQuarantine(active || null);

      // Fetch observations for each quarantine
      for (const quarantine of (data || [])) {
        fetchObservations(quarantine.id);
      }
    } catch (err) {
      console.error('Error fetching quarantines:', err);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données de quarantaine",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchObservations = async (quarantineId: number) => {
    try {
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .eq('quarantine_id', quarantineId)
        .order('date', { ascending: false });

      if (error) throw error;

      setObservations(prev => ({
        ...prev,
        [quarantineId]: data || [],
      }));
    } catch (err) {
      console.error('Error fetching observations:', err);
    }
  };

  const startQuarantine = async () => {
    try {
      if (!newQuarantineReason.trim()) {
        toast({
          title: "Champ requis",
          description: "Veuillez indiquer la raison de la quarantaine",
          variant: "destructive",
        });
        return;
      }

      setIsStartingQuarantine(true);
      
      const { data, error } = await supabase
        .from('quarantines')
        .insert([
          {
            animal_id: animalId,
            date_debut: newQuarantineStartDate,
            date_fin: null, // Still set to null initially as quarantine is ongoing
            raison: newQuarantineReason,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Quarantaine démarrée",
        description: "La période de quarantaine a été enregistrée avec succès",
      });

      setNewQuarantineReason('');
      setNewQuarantineStartDate(new Date().toISOString().split('T')[0]);
      const newEndDate = new Date();
      newEndDate.setMonth(newEndDate.getMonth() + 1);
      setNewQuarantineEndDate(newEndDate.toISOString().split('T')[0]);
      
      fetchQuarantines();
    } catch (err) {
      console.error('Error starting quarantine:', err);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la quarantaine",
        variant: "destructive",
      });
    } finally {
      setIsStartingQuarantine(false);
    }
  };

  // Helper function to update end date when start date changes
  const updateEndDateFromStart = (startDate: string) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + 1);
    setNewQuarantineEndDate(date.toISOString().split('T')[0]);
  };

  const endQuarantine = async () => {
    try {
      if (!activeQuarantine) return;
      
      setIsEndingQuarantine(true);
      
      const { error } = await supabase
        .from('quarantines')
        .update({
          date_fin: new Date().toISOString(),
          observations: endQuarantineNotes || activeQuarantine.observations,
        })
        .eq('id', activeQuarantine.id);

      if (error) throw error;

      toast({
        title: "Quarantaine terminée",
        description: "La période de quarantaine a été clôturée avec succès",
      });

      setEndQuarantineNotes('');
      fetchQuarantines();
    } catch (err) {
      console.error('Error ending quarantine:', err);
      toast({
        title: "Erreur",
        description: "Impossible de terminer la quarantaine",
        variant: "destructive",
      });
    } finally {
      setIsEndingQuarantine(false);
    }
  };

  const addObservation = async () => {
    try {
      if (!selectedQuarantineId) return;
      if (!newObservationData.description.trim()) {
        toast({
          title: "Champ requis",
          description: "Veuillez ajouter une description",
          variant: "destructive",
        });
        return;
      }

      setIsAddingObservation(true);
      
      const { data, error } = await supabase
        .from('observations')
        .insert([
          {
            quarantine_id: selectedQuarantineId,
            date: newObservationData.date,
            description: newObservationData.description,
            resultat_test: newObservationData.resultat_test || null,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Observation ajoutée",
        description: "L'observation a été enregistrée avec succès",
      });

      setNewObservationData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        resultat_test: '',
      });
      
      fetchObservations(selectedQuarantineId);
    } catch (err) {
      console.error('Error adding observation:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'observation",
        variant: "destructive",
      });
    } finally {
      setIsAddingObservation(false);
    }
  };

  const editQuarantine = async () => {
    try {
      if (!editQuarantineData.raison.trim()) {
        toast({
          title: "Champ requis",
          description: "Veuillez indiquer la raison de la quarantaine",
          variant: "destructive",
        });
        return;
      }

      setIsEditingQuarantine(true);
      
      const { error } = await supabase
        .from('quarantines')
        .update({
          raison: editQuarantineData.raison,
          date_debut: editQuarantineData.date_debut,
          date_fin: editQuarantineData.date_fin,
          observations: editQuarantineData.observations,
        })
        .eq('id', editQuarantineData.id);

      if (error) throw error;

      toast({
        title: "Quarantaine modifiée",
        description: "Les informations de quarantaine ont été mises à jour",
      });

      fetchQuarantines();
    } catch (err) {
      console.error('Error editing quarantine:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la quarantaine",
        variant: "destructive",
      });
    } finally {
      setIsEditingQuarantine(false);
    }
  };

  const deleteQuarantine = async (id: number) => {
    try {
      // First delete related observations
      const { error: obsError } = await supabase
        .from('observations')
        .delete()
        .eq('quarantine_id', id);
        
      if (obsError) throw obsError;
      
      // Then delete the quarantine
      const { error } = await supabase
        .from('quarantines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Quarantaine supprimée",
        description: "La période de quarantaine a été supprimée",
      });

      fetchQuarantines();
    } catch (err) {
      console.error('Error deleting quarantine:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la quarantaine",
        variant: "destructive",
      });
    }
  };

  const prepareEditQuarantine = (quarantine: QuarantineRecord) => {
    setEditQuarantineData({
      id: quarantine.id,
      raison: quarantine.raison || '',
      date_debut: quarantine.date_debut ? new Date(quarantine.date_debut).toISOString().split('T')[0] : '',
      date_fin: quarantine.date_fin ? new Date(quarantine.date_fin).toISOString().split('T')[0] : null,
      observations: quarantine.observations || ''
    });
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

  if (loading && quarantines.length === 0) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-shelter-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Gestion de la quarantaine</h3>
        
        {activeQuarantine ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-amber-500 text-amber-700 hover:bg-amber-50"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Terminer la quarantaine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Terminer la période de quarantaine</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Date de début</Label>
                  <p>{formatDate(activeQuarantine.date_debut)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Raison</Label>
                  <p>{activeQuarantine.raison}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes finales</Label>
                  <Textarea
                    id="notes"
                    value={endQuarantineNotes}
                    onChange={(e) => setEndQuarantineNotes(e.target.value)}
                    placeholder="Observations finales, résultats des tests, etc."
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <DialogClose asChild>
                    <Button variant="outline">
                      <X className="mr-2 h-4 w-4" />
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button 
                    onClick={endQuarantine} 
                    disabled={isEndingQuarantine}
                  >
                    {isEndingQuarantine ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Démarrer une quarantaine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Démarrer une nouvelle quarantaine</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Raison de la quarantaine</Label>
                  <Textarea
                    id="reason"
                    value={newQuarantineReason}
                    onChange={(e) => setNewQuarantineReason(e.target.value)}
                    placeholder="Raison de la mise en quarantaine"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newQuarantineStartDate}
                    onChange={(e) => {
                      setNewQuarantineStartDate(e.target.value);
                      updateEndDateFromStart(e.target.value);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin estimée</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newQuarantineEndDate}
                    onChange={(e) => setNewQuarantineEndDate(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Par défaut, la date de fin est fixée à un mois après la date de début.
                    La quarantaine restera active jusqu'à ce qu'elle soit explicitement terminée.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <DialogClose asChild>
                    <Button variant="outline">
                      <X className="mr-2 h-4 w-4" />
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button 
                    onClick={startQuarantine} 
                    disabled={isStartingQuarantine}
                  >
                    {isStartingQuarantine ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Démarrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {quarantines.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              Aucune période de quarantaine enregistrée
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quarantines.map((quarantine) => (
            <Card key={quarantine.id} className={quarantine.date_fin === null ? 'border-amber-400' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {quarantine.date_fin === null ? 'Quarantaine en cours' : 'Quarantaine terminée'}
                  </CardTitle>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <span>Du {formatDate(quarantine.date_debut)}</span>
                    {quarantine.date_fin && (
                      <span> au {formatDate(quarantine.date_fin)}</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Raison</h4>
                  <p className="text-gray-700">{quarantine.raison}</p>
                </div>
                
                {quarantine.observations && (
                  <div>
                    <h4 className="font-medium mb-1">Observations générales</h4>
                    <p className="text-gray-700">{quarantine.observations}</p>
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Suivi et observations</h4>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedQuarantineId(quarantine.id)}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Ajouter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter une observation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="observationDate">Date</Label>
                            <Input
                              id="observationDate"
                              type="date"
                              value={newObservationData.date}
                              onChange={(e) => setNewObservationData({
                                ...newObservationData,
                                date: e.target.value,
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="observationDesc">Description</Label>
                            <Textarea
                              id="observationDesc"
                              value={newObservationData.description}
                              onChange={(e) => setNewObservationData({
                                ...newObservationData,
                                description: e.target.value,
                              })}
                              placeholder="Comportement, symptômes, traitements administrés..."
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="testResults">Résultats de test (optionnel)</Label>
                            <Textarea
                              id="testResults"
                              value={newObservationData.resultat_test}
                              onChange={(e) => setNewObservationData({
                                ...newObservationData,
                                resultat_test: e.target.value,
                              })}
                              placeholder="Résultats des tests effectués"
                            />
                          </div>
                          <div className="flex justify-end space-x-2 pt-4">
                            <DialogClose asChild>
                              <Button variant="outline">
                                <X className="mr-2 h-4 w-4" />
                                Annuler
                              </Button>
                            </DialogClose>
                            <Button 
                              onClick={addObservation} 
                              disabled={isAddingObservation}
                            >
                              {isAddingObservation ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="mr-2 h-4 w-4" />
                              )}
                              Enregistrer
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {observations[quarantine.id]?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Observation</TableHead>
                          <TableHead>Résultat de test</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {observations[quarantine.id].map((obs) => (
                          <TableRow key={obs.id}>
                            <TableCell>{formatDate(obs.date)}</TableCell>
                            <TableCell>{obs.description}</TableCell>
                            <TableCell>{obs.resultat_test || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Aucune observation enregistrée</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuarantineManagement; 