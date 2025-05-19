import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Edit, Save, X, Camera, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import QuarantineManagement from '@/components/QuarantineManagement';
import HealthManagement from '@/components/HealthManagement';
import DeathManagement from '@/components/DeathManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { Navbar } from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMediaQuery } from '../hooks/useMediaQuery';

type Animal = Database['public']['Tables']['animaux']['Row'];

interface Amenant {
  id: number;
  nom_prenom: string;
  entreprise: string;
  telephone: string;
  email: string;
  adresse: string;
}

// Nom du bucket pour les photos
const PHOTOS_BUCKET = 'animalphoto';

const AnimalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [amenantError, setAmenantError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Animal>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("quarantine");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // États pour la gestion des amenants
  const [amenants, setAmenants] = useState<Amenant[]>([]);
  const [loadingAmenants, setLoadingAmenants] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAmenant, setNewAmenant] = useState({
    nom_prenom: '',
    entreprise: '',
    telephone: '',
    email: '',
    adresse: '',
  });
  const [isSubmittingAmenant, setIsSubmittingAmenant] = useState(false);
  const [selectedAmenant, setSelectedAmenant] = useState<Amenant | null>(null);

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        if (!id) throw new Error('ID de l\'animal non spécifié');
        
        const { data, error } = await supabase
          .from('animaux')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setAnimal(data);
        setFormData(data);
        setLoading(false);

        // Si l'animal a un amenant_id, on charge ses informations
        if (data.amenant_id) {
          const { data: amenantData, error: amenantError } = await supabase
            .from('amenants')
            .select('*')
            .eq('id', data.amenant_id)
            .single();

          if (!amenantError && amenantData) {
            setSelectedAmenant(amenantData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setLoading(false);
      }
    };

    fetchAnimal();
    fetchAmenants();
  }, [id]);

  const fetchAmenants = async () => {
    try {
      const { data, error } = await supabase
        .from('amenants')
        .select('*')
        .order('nom_prenom');

      if (error) throw error;
      setAmenants(data || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des amenants:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des amenants",
        variant: "destructive"
      });
    } finally {
      setLoadingAmenants(false);
    }
  };

  const handleNewAmenantSubmit = async () => {
    setIsSubmittingAmenant(true);
    
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

      if (error) throw error;

      // Mettre à jour la liste des amenants
      setAmenants([...amenants, data]);
      
      // Mettre à jour l'amenant de l'animal
      setFormData(prev => ({ ...prev, amenant_id: data.id }));
      setSelectedAmenant(data);
      
      setIsDialogOpen(false);
      setNewAmenant({ nom_prenom: '', telephone: '', email: '', entreprise: '', adresse: '' });
      
      toast({
        title: "Succès",
        description: "L'amenant a été créé et associé à l'animal"
      });
    } catch (err) {
      console.error('Erreur lors de la création de l\'amenant:', err);
      setAmenantError(err instanceof Error ? err.message : "Erreur lors de la création de l'amenant");
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur lors de la création de l'amenant",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingAmenant(false);
    }
  };

  const handleAmenantChange = (amenantId: string) => {
    const selectedAmenantData = amenants.find(a => a.id === parseInt(amenantId));
    setSelectedAmenant(selectedAmenantData || null);
    setFormData(prev => ({ ...prev, amenant_id: parseInt(amenantId) }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const goBack = () => {
    navigate(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      sterilise: checked
    });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload photo
      setIsUploadingPhoto(true);
      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from(PHOTOS_BUCKET)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type
          });
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = await supabase
          .storage
          .from(PHOTOS_BUCKET)
          .getPublicUrl(fileName);
        
        const photoUrl = publicUrlData.publicUrl;
        
        // Update animal record with new photo URL
        const { error: updateError } = await supabase
          .from('animaux')
          .update({ photo_url: photoUrl })
          .eq('id', id);
        
        if (updateError) throw updateError;
        
        // Update local state
        setAnimal(prev => prev ? { ...prev, photo_url: photoUrl } : null);
        setFormData(prev => ({ ...prev, photo_url: photoUrl }));
        
        toast({
          title: "Photo mise à jour",
          description: "La photo de l'animal a été mise à jour avec succès."
        });
      } catch (err) {
        console.error('Erreur lors de la mise à jour de la photo:', err);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la photo de l'animal.",
          variant: "destructive"
        });
      } finally {
        setIsUploadingPhoto(false);
        setPhotoPreview(null);
      }
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Cancel edit
      setFormData(animal || {});
    }
    setIsEditing(!isEditing);
  };

  const saveChanges = async () => {
    if (!id || !formData) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('animaux')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setAnimal({
        ...animal,
        ...formData
      } as Animal);
      
      setIsEditing(false);
      toast({
        title: "Modifications enregistrées",
        description: "Les informations de l'animal ont été mises à jour."
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur lors de l'enregistrement des modifications",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle opening the dialog and reset error
  const handleOpenDialog = (open: boolean) => {
    if (open) {
      setAmenantError(null);
    }
    setIsDialogOpen(open);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 lg:bg-white">
        <Header className="hidden lg:flex" />
        <div className="flex justify-center items-center h-64 mt-10">
          <Loader2 className="h-8 w-8 animate-spin text-shelter-purple" />
        </div>
        <Navbar />
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gray-50 lg:bg-white">
        <Header className="hidden lg:flex" />
        <div className="flex flex-col items-center gap-4 mt-10">
          <p className="text-red-500">{error || "Animal non trouvé"}</p>
          <Button onClick={goBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
        <Navbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-white">
      <Header className="hidden lg:flex" />
      <div className="px-4 lg:px-8 py-6 pb-24 lg:pb-6">
        <div className="flex items-center mb-6">
          <Button onClick={goBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column - Sticky on desktop, top on mobile */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-4 lg:self-start order-1 lg:order-1">
            <Card className="w-full h-full">
              <div className="h-64 sm:h-80 bg-gray-200 relative">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Prévisualisation" 
                    className="w-full h-full object-cover"
                  />
                ) : animal.photo_url ? (
                  <img 
                    src={animal.photo_url} 
                    alt={animal.nom || 'Photo de l\'animal'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Pas de photo
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Badge variant={animal.sterilise ? "default" : "secondary"}>
                    {animal.sterilise ? "Stérilisé" : "Non stérilisé"}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                      disabled={isUploadingPhoto}
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full bg-white/80 hover:bg-white"
                      asChild
                      disabled={isUploadingPhoto}
                    >
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        {isUploadingPhoto ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  {isEditing ? (
                    <div className="w-full">
                      <div className="flex justify-between items-start mb-4">
                        <Label htmlFor="nom" className="text-lg">Nom</Label>
                        <div className="flex gap-2">
                          <Button 
                            onClick={toggleEdit} 
                            variant="outline"
                            className="text-red-500"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Annuler
                          </Button>
                          <Button 
                            onClick={saveChanges} 
                            variant="default"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Enregistrer
                          </Button>
                        </div>
                      </div>
                      <Input 
                        id="nom"
                        name="nom"
                        value={formData.nom || ''}
                        onChange={handleInputChange}
                        className="font-bold text-lg mb-4"
                      />
                      <div className="mt-4">
                        <Label htmlFor="espece">Espèce</Label>
                        <Select 
                          value={formData.espece || ''} 
                          onValueChange={(value) => handleSelectChange(value, 'espece')}
                        >
                          <SelectTrigger id="espece">
                            <SelectValue placeholder="Sélectionner une espèce" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Poule">Poule</SelectItem>
                            <SelectItem value="Canard">Canard</SelectItem>
                            <SelectItem value="Cochon">Cochon</SelectItem>
                            <SelectItem value="Chinchilla">Chinchilla</SelectItem>
                            <SelectItem value="Chat">Chat</SelectItem>
                            <SelectItem value="Chien">Chien</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-4 flex items-center space-x-2">
                        <Checkbox 
                          id="sterilise" 
                          checked={formData.sterilise || false}
                          onCheckedChange={handleCheckboxChange}
                        />
                        <Label htmlFor="sterilise">Stérilisé</Label>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex justify-between items-start">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{animal.nom}</h2>
                        <Badge variant="outline" className="capitalize text-base">
                          {animal.espece}
                        </Badge>
                      </div>
                      
                      <Button 
                        onClick={toggleEdit} 
                        variant="default" 
                        className="bg-shelter-purple hover:bg-shelter-purple/90 text-white"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold border-b pb-2">Informations générales</h3>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="race">Race</Label>
                        <Input 
                          id="race"
                          name="race"
                          value={formData.race || ''}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="sexe">Sexe</Label>
                        <Select 
                          value={formData.sexe || ''} 
                          onValueChange={(value) => handleSelectChange(value, 'sexe')}
                        >
                          <SelectTrigger id="sexe">
                            <SelectValue placeholder="Sélectionner un sexe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Mâle</SelectItem>
                            <SelectItem value="F">Femelle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="couleurs">Couleurs</Label>
                        <Input 
                          id="couleurs"
                          name="couleurs"
                          value={formData.couleurs || ''}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="date_naissance">Date de naissance</Label>
                        <Input 
                          id="date_naissance"
                          name="date_naissance"
                          type="date"
                          value={formatDateForInput(formData.date_naissance)}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="date_entree">Date d'entrée</Label>
                        <Input 
                          id="date_entree"
                          name="date_entree"
                          type="date"
                          value={formatDateForInput(formData.date_entree)}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="identification">Identification</Label>
                        <Input 
                          id="identification"
                          name="identification"
                          value={formData.identification || ''}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="amenant">Amenant</Label>
                        <div className={cn(
                          "flex gap-2", 
                          isSmallScreen ? "flex-col" : "items-center"
                        )}>
                          <div className="flex-grow">
                            <Select 
                              value={formData.amenant_id?.toString() || ''} 
                              onValueChange={handleAmenantChange}
                            >
                              <SelectTrigger id="amenant">
                                <SelectValue placeholder="Sélectionner un amenant" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {amenants.map((amenant) => (
                                    <SelectItem
                                      key={amenant.id}
                                      value={amenant.id.toString()}
                                    >
                                      {amenant.nom_prenom} {amenant.entreprise ? `(${amenant.entreprise})` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "flex items-center gap-2 whitespace-nowrap",
                                  isSmallScreen && "w-full justify-center mt-2"
                                )}
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
                                {amenantError && (
                                  <Alert variant="destructive">
                                    <AlertDescription>{amenantError}</AlertDescription>
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
                                  disabled={isSubmittingAmenant || !newAmenant.nom_prenom.trim()}
                                >
                                  {isSubmittingAmenant ? (
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
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="particularites">Particularités</Label>
                        <Textarea 
                          id="particularites"
                          name="particularites"
                          value={formData.particularites || ''}
                          onChange={handleInputChange}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="provenance">Provenance</Label>
                        <Textarea 
                          id="provenance"
                          name="provenance"
                          value={formData.provenance || ''}
                          onChange={handleInputChange}
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="proprietaire">Propriétaire</Label>
                        <Input 
                          id="proprietaire"
                          name="proprietaire"
                          value={formData.proprietaire || ''}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm text-gray-500">Race</h4>
                          <p>{animal.race || "Non spécifiée"}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm text-gray-500">Sexe</h4>
                          <p>{animal.sexe === 'M' ? 'Mâle' : animal.sexe === 'F' ? 'Femelle' : "Non spécifié"}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm text-gray-500">Couleurs</h4>
                          <p>{animal.couleurs || "Non spécifiées"}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm text-gray-500">Date de naissance</h4>
                          <p>{formatDate(animal.date_naissance)}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm text-gray-500">Date d'entrée</h4>
                          <p>{formatDate(animal.date_entree)}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm text-gray-500">Identification</h4>
                          <p>{animal.identification || "Non spécifiée"}</p>
                        </div>

                        <div className="sm:col-span-2">
                          <h4 className="text-sm text-gray-500">Amenant</h4>
                          {selectedAmenant ? (
                            <div className="mt-1">
                              <p className="font-medium">{selectedAmenant.nom_prenom}</p>
                              {selectedAmenant.entreprise && (
                                <p className="text-sm text-gray-600">{selectedAmenant.entreprise}</p>
                              )}
                              {(selectedAmenant.telephone || selectedAmenant.email) && (
                                <p className="text-sm text-gray-600">
                                  {selectedAmenant.telephone}
                                  {selectedAmenant.telephone && selectedAmenant.email && " • "}
                                  {selectedAmenant.email}
                                </p>
                              )}
                              {selectedAmenant.adresse && (
                                <p className="text-sm text-gray-600">{selectedAmenant.adresse}</p>
                              )}
                            </div>
                          ) : (
                            <p>Non spécifié</p>
                          )}
                        </div>
                      </div>

                      {animal.particularites && (
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-2 mt-6">Particularités</h3>
                          <p className="mt-2">{animal.particularites}</p>
                        </div>
                      )}
                      
                      {animal.provenance && (
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-2 mt-6">Provenance</h3>
                          <p className="mt-2">{animal.provenance}</p>
                        </div>
                      )}
                      
                      {animal.proprietaire && (
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-2 mt-6">Propriétaire</h3>
                          <p className="mt-2">{animal.proprietaire}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column with tabs */}
          <div className="w-full lg:w-3/5 order-2 lg:order-2">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="quarantine" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="quarantine" className="text-sm">Quarantaine</TabsTrigger>
                    <TabsTrigger value="health" className="text-sm">Santé</TabsTrigger>
                    <TabsTrigger value="death" className="text-sm">État</TabsTrigger>
                  </TabsList>

                  <TabsContent value="quarantine" className="overflow-x-auto">
                    {animal && animal.id && (
                      <QuarantineManagement animalId={animal.id} />
                    )}
                  </TabsContent>

                  <TabsContent value="health" className="overflow-x-auto">
                    {animal && animal.id && (
                      <HealthManagement animalId={animal.id} />
                    )}
                  </TabsContent>

                  <TabsContent value="death" className="overflow-x-auto">
                    {animal && animal.id && (
                      <DeathManagement animalId={animal.id} />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default AnimalDetailPage; 