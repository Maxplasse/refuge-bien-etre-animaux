import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Edit, Save, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import QuarantineManagement from '@/components/QuarantineManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Animal = Database['public']['Tables']['animaux']['Row'];

const AnimalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Animal>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("informations");

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setLoading(false);
      }
    };

    fetchAnimal();
  }, [id]);

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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-shelter-purple" />
        </div>
      </Layout>
    );
  }

  if (error || !animal) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-500">{error || "Animal non trouvé"}</p>
          <Button onClick={goBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={goBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          {isEditing ? (
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
          ) : (
            <Button 
              onClick={toggleEdit} 
              variant="default" 
              className="bg-shelter-purple hover:bg-shelter-purple/90 text-white"
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <div className="h-64 bg-gray-200 relative">
                <div className="absolute bottom-2 right-2">
                  <Badge variant={animal.sterilise ? "default" : "secondary"}>
                    {animal.sterilise ? "Stérilisé" : "Non stérilisé"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  {isEditing ? (
                    <div className="w-full">
                      <Label htmlFor="nom">Nom</Label>
                      <Input 
                        id="nom"
                        name="nom"
                        value={formData.nom || ''}
                        onChange={handleInputChange}
                        className="font-bold text-lg mt-1"
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
                    <>
                      <h2 className="text-2xl font-bold">{animal.nom}</h2>
                      <Badge variant="outline" className="capitalize">
                        {animal.espece}
                      </Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="informations" className="flex-1">Informations générales</TabsTrigger>
                <TabsTrigger value="quarantine" className="flex-1">Quarantaine</TabsTrigger>
              </TabsList>
              
              <TabsContent value="informations">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold border-b pb-2">Informations générales</h3>
                    
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div className="md:col-span-2">
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

                        <div className="md:col-span-2">
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

                        <div className="md:col-span-2">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm text-gray-500">Race</h4>
                            <p>{animal.race || "Non spécifiée"}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm text-gray-500">Sexe</h4>
                            <p>{animal.sexe || "Non spécifié"}</p>
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
                        </div>

                        {animal.particularites && (
                          <div>
                            <h3 className="text-xl font-semibold border-b pb-2 mt-6">Particularités</h3>
                            <p className="mt-2">{animal.particularites}</p>
                          </div>
                        )}
                        
                        {animal.provenance && (
                          <div>
                            <h3 className="text-xl font-semibold border-b pb-2 mt-6">Provenance</h3>
                            <p className="mt-2">{animal.provenance}</p>
                          </div>
                        )}
                        
                        {animal.proprietaire && (
                          <div>
                            <h3 className="text-xl font-semibold border-b pb-2 mt-6">Propriétaire</h3>
                            <p className="mt-2">{animal.proprietaire}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quarantine">
                <Card>
                  <CardContent className="p-6">
                    {animal && animal.id && (
                      <QuarantineManagement animalId={animal.id} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnimalDetailPage; 