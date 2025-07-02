import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2, MoreVertical, PlusCircle, Trash, UserPlus, ShieldAlert, Edit, Eye, FileDown, Cat, User, Download } from 'lucide-react';
import Header from '@/components/Header';
import { Database } from '@/types/supabase';
import * as XLSX from 'xlsx';

interface User {
  id: string;
  role: string;
  created_at: string;
  access: string;
  last_name?: string;
  first_name?: string;
  phone_number?: string;
  email?: string;
}

// Ajouter une interface pour le nouvel utilisateur
interface NewUser {
  email: string;
  password: string;
  role: string;
  access: string;
  last_name?: string;
  first_name?: string;
  phone_number?: string;
}

// Interface pour les animaux
interface Animal {
  id: number;
  nom: string;
  espece: string;
  sexe: string | null;
  race: string | null;
  date_naissance: string | null;
  date_entree: string | null;
  sterilise: boolean;
  photo_url: string | null;
  created_at: string;
  isInQuarantine?: boolean;
  isDeceased?: boolean;
}

const AdminPortal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [accessLevel, setAccessLevel] = useState('viewer');
  const [isSending, setIsSending] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState('');

  // --- ETATS POUR CATEGORIES ET CREATION ANIMAL ---
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categories, setCategories] = useState<{ id: number, nom: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [isAnimalDialogOpen, setIsAnimalDialogOpen] = useState(false);
  const [animalName, setAnimalName] = useState('');
  const [animalSex, setAnimalSex] = useState('');
  const [animalSterilise, setAnimalSterilise] = useState(false);
  const [animalDateEntree, setAnimalDateEntree] = useState('');
  const [animalCategoryId, setAnimalCategoryId] = useState<number | null>(null);
  const [isCreatingAnimal, setIsCreatingAnimal] = useState(false);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Accès autorisé pour tous les utilisateurs connectés
      // Commenté pour permettre l'accès à tous
      /*
      if (user?.user_metadata?.role !== 'admin') {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'accès à cette page.",
          variant: "destructive"
        });
        navigate('/');
      }
      */
    };

    checkAdmin();
  }, [user, navigate]);

  // Charger la liste des utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        // Récupérer les données de la table user personnalisée
        const { data, error } = await supabase.from('user').select('*');
        
        if (error) throw error;
        
        setUsers(data.map(user => ({
          id: user.id,
          role: user.role || 'viewer',
          created_at: user.created_at,
          access: user.access || 'viewer',
          last_name: user.last_name,
          first_name: user.first_name,
          phone_number: user.phone_number,
          email: user.email
        })));
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des utilisateurs.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Charger la liste des animaux
  useEffect(() => {
    const loadAnimals = async () => {
      if (activeTab !== "animals") return;
      
      setLoadingAnimals(true);
      try {
        // Fetch animals
        const { data: animalsData, error: animalsError } = await supabase
          .from('animaux')
          .select('*');

        if (animalsError) throw animalsError;

        // Fetch active quarantines
        const { data: quarantineData, error: quarantineError } = await supabase
          .from('quarantines')
          .select('*')
          .or('date_fin.is.null,date_fin.gt.now()');

        if (quarantineError) throw quarantineError;

        // Fetch deceased animals
        const { data: deceasedData, error: deceasedError } = await supabase
          .from('deces')
          .select('*');

        if (deceasedError) throw deceasedError;

        // Combine animal and status data
        const animalsWithStatus = animalsData.map(animal => {
          const activeQuarantine = quarantineData.find(q => q.animal_id === animal.id);
          const deathRecord = deceasedData.find(d => d.animal_id === animal.id);
          
          return {
            ...animal,
            isInQuarantine: !!activeQuarantine,
            isDeceased: !!deathRecord,
          };
        });

        setAnimals(animalsWithStatus);
      } catch (error) {
        console.error('Erreur lors du chargement des animaux:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des animaux.",
          variant: "destructive"
        });
      } finally {
        setLoadingAnimals(false);
      }
    };

    loadAnimals();
  }, [activeTab]);

  // Charger la liste des catégories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const { data, error } = await supabase
          .from('categories_animaux')
          .select('id, nom')
          .order('nom', { ascending: true });
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories.",
          variant: "destructive"
        });
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const refreshCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories_animaux')
        .select('id, nom')
        .order('nom', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories.",
        variant: "destructive"
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fonction pour envoyer une invitation
  const sendInvite = async () => {
    if (!inviteEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une adresse email.",
        variant: "destructive"
      });
      return;
    }

    if (!password) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un mot de passe temporaire.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // 1. Créer un nouvel utilisateur dans l'authentification Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteEmail,
        password: password,
        options: {
          data: {
            role: accessLevel
          }
        }
      });

      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Impossible de créer l'utilisateur");
      }

      // 2. Extraire l'UUID de l'utilisateur créé
      const userId = authData.user.id;

      // 3. Créer un enregistrement dans la table user personnalisée avec l'UUID comme identifiant
      const { error: userError } = await supabase
        .from('user')
        .insert({
          id: userId, // Utiliser l'UUID de l'utilisateur créé
          role: inviteRole,
          access: accessLevel,
          last_name: lastName || null,
          first_name: firstName || null,
          phone_number: phoneNumber || null,
          email: inviteEmail
        });

      if (userError) {
        // En cas d'erreur, on ne peut pas supprimer l'utilisateur créé car nous n'avons pas les droits d'admin
        // Il faudrait implémenter une fonction serveur pour gérer ce cas
        console.error("Erreur lors de la création de l'utilisateur dans la table user:", userError);
        throw new Error(`L'utilisateur a été créé dans le système d'authentification mais pas dans la table user: ${userError.message}`);
      }
      
      // 4. Envoyer un email de bienvenue directement via Supabase Auth API
      try {
        // L'email sera envoyé automatiquement par Supabase lorsque l'utilisateur est créé
        // Supabase utilise les paramètres SMTP configurés dans la console
        console.log("Email de bienvenue envoyé automatiquement par Supabase");
        
        // Si vous avez besoin d'envoyer un email personnalisé plus tard, vous pouvez
        // utiliser cette approche (mais elle nécessite des droits d'admin)
        /*
        const { error: resetError } = await supabase.auth.admin.updateUserById(
          userId,
          { email: inviteEmail }
        );
        
        if (resetError) {
          console.error("Erreur lors de l'envoi de l'email:", resetError);
        }
        */
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email de bienvenue:", emailError);
        // Ne pas bloquer le processus si l'envoi d'email échoue
      }
      
      // 5. Ajouter le nouvel utilisateur à la liste des utilisateurs affichés
      setUsers([...users, {
        id: userId,
        role: inviteRole,
        created_at: new Date().toISOString(),
        access: accessLevel,
        last_name: lastName,
        first_name: firstName,
        phone_number: phoneNumber
      }]);
      
      toast({
        title: "Utilisateur créé",
        description: `Un nouvel utilisateur a été créé avec l'email ${inviteEmail} et le rôle ${inviteRole}.`,
      });
      
      // Réinitialiser les champs du formulaire
      setInviteEmail('');
      setPassword('');
      setLastName('');
      setFirstName('');
      setPhoneNumber('');
      setInviteRole('viewer');
      setAccessLevel('viewer');
      setIsUserDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      toast({
        title: "Erreur",
        description: `Impossible de créer l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Fonction pour changer le rôle d'un utilisateur
  const updateUserRole = async (userId: string, newRole: string, field: 'role' | 'access') => {
    try {
      const { error } = await supabase
        .from('user')
        .update({ [field]: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Mettre à jour l'interface utilisateur
      setUsers(users.map(u => 
        u.id === userId ? { ...u, [field]: newRole } : u
      ));
      
      toast({
        title: field === 'role' ? "Rôle professionnel mis à jour" : "Droit d'accès mis à jour",
        description: field === 'role' 
          ? "Le rôle professionnel de l'utilisateur a été modifié avec succès."
          : "Le droit d'accès de l'utilisateur a été modifié avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations de l'utilisateur.",
        variant: "destructive"
      });
    }
  };

  // Fonction pour supprimer un utilisateur
  const deleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }
    
    try {
      // Supprimer de la table user personnalisée
      const { error } = await supabase
        .from('user')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Note: La suppression de l'utilisateur du système d'authentification
      // nécessite des droits d'administrateur ou une fonction serveur
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé de la base de données.",
      });
      
      // Mettre à jour l'interface utilisateur
      setUsers(users.filter(u => u.id !== userId));
      
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('user')
        .update({
          last_name: lastName,
          first_name: firstName,
          phone_number: phoneNumber,
          role: inviteRole,
          access: accessLevel,
          email: editEmail,
        })
        .eq('id', selectedUser.id);

      if (selectedUser && selectedUser.email !== editEmail) {
        try {
          const response = await fetch('https://tonsdvqvvuvmshkuxty.functions.supabase.co/update-user-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: selectedUser.id,
              newEmail: editEmail,
            }),
          });

          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || "Erreur lors de la mise à jour de l'email dans Auth");
          }
        } catch (err) {
          toast({
            title: "Erreur",
            description: "Impossible de modifier l'email de connexion (Auth).",
            variant: "destructive"
          });
        }
      }

      if (error) throw error;

      // Mettre à jour l'interface utilisateur
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { 
              ...u, 
              last_name: lastName,
              first_name: firstName,
              phone_number: phoneNumber,
              role: inviteRole,
              access: accessLevel,
            } 
          : u
      ));

      toast({
        title: "Utilisateur modifié",
        description: "Les informations de l'utilisateur ont été mises à jour avec succès.",
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la modification de l\'utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier les informations de l'utilisateur.",
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setLastName(user.last_name || '');
    setFirstName(user.first_name || '');
    setPhoneNumber(user.phone_number || '');
    setInviteRole(user.role);
    setAccessLevel(user.access);
    setEditEmail(user.email || '');
    setIsEditDialogOpen(true);
  };

  // Fonction pour exporter les animaux au format Excel
  const exportToExcel = () => {
    try {
      // Créer un tableau pour l'export avec les données formatées
      const exportData = animals.map(animal => ({
        'ID': animal.id,
        'Nom': animal.nom,
        'Espèce': animal.espece,
        'Race': animal.race || 'Non spécifiée',
        'Sexe': animal.sexe === 'M' ? 'Mâle' : animal.sexe === 'F' ? 'Femelle' : 'Non spécifié',
        'Date de naissance': animal.date_naissance ? new Date(animal.date_naissance).toLocaleDateString('fr-FR') : 'Non spécifiée',
        'Date d\'entrée': animal.date_entree ? new Date(animal.date_entree).toLocaleDateString('fr-FR') : 'Non spécifiée',
        'Stérilisé': animal.sterilise ? 'Oui' : 'Non',
        'En quarantaine': animal.isInQuarantine ? 'Oui' : 'Non',
        'Décédé': animal.isDeceased ? 'Oui' : 'Non',
      }));

      // Créer un workbook et ajouter une feuille
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Ajouter la feuille au workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Animaux');

      // Générer un fichier Excel et le télécharger
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `liste-animaux-${date}.xlsx`);

      toast({
        title: "Export réussi",
        description: "La liste des animaux a été exportée avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données au format Excel.",
        variant: "destructive"
      });
    }
  };

  // --- MODAL AJOUT CATEGORIE ---
  const renderCategoryDialog = () => (
    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une catégorie d'animal</DialogTitle>
          <DialogDescription>
            Saisissez le nom de la nouvelle catégorie d'animal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Nom de la catégorie"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={async () => {
              if (!newCategory.trim()) return;
              setIsAddingCategory(true);
              try {
                const { error } = await supabase
                  .from('categories_animaux')
                  .insert({ nom: newCategory.trim() });
                if (error) throw error;
                toast({
                  title: "Catégorie ajoutée",
                  description: `La catégorie "${newCategory}" a été ajoutée.`,
                });
                setNewCategory('');
                setIsCategoryDialogOpen(false);
                await refreshCategories();
              } catch (error) {
                toast({
                  title: "Erreur",
                  description: "Impossible d'ajouter la catégorie.",
                  variant: "destructive"
                });
              } finally {
                setIsAddingCategory(false);
              }
            }}
            disabled={isAddingCategory || !newCategory.trim()}
          >
            {isAddingCategory ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ajout...
              </>
            ) : (
              'Ajouter'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // --- MODAL CREATION ANIMAL ---
  const renderAnimalDialog = () => (
    <Dialog open={isAnimalDialogOpen} onOpenChange={setIsAnimalDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un animal</DialogTitle>
          <DialogDescription>
            Remplissez les informations de l'animal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="animalName">Nom *</Label>
            <Input
              id="animalName"
              placeholder="Nom de l'animal"
              value={animalName}
              onChange={e => setAnimalName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="animalSex">Sexe *</Label>
            <Select value={animalSex} onValueChange={setAnimalSex}>
              <SelectTrigger id="animalSex">
                <SelectValue placeholder="Sélectionner le sexe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Mâle</SelectItem>
                <SelectItem value="F">Femelle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="animalSterilise">Stérilisé</Label>
            <Select value={animalSterilise ? "oui" : "non"} onValueChange={v => setAnimalSterilise(v === "oui")}> 
              <SelectTrigger id="animalSterilise">
                <SelectValue placeholder="Stérilisé ?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oui">Oui</SelectItem>
                <SelectItem value="non">Non</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="animalDateEntree">Date d'entrée *</Label>
            <Input
              id="animalDateEntree"
              type="date"
              value={animalDateEntree}
              onChange={e => setAnimalDateEntree(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="animalCategory">Catégorie *</Label>
            <div className="flex gap-2 items-center">
              <Select
                value={animalCategoryId ? String(animalCategoryId) : ''}
                onValueChange={val => setAnimalCategoryId(Number(val))}
                disabled={loadingCategories}
              >
                <SelectTrigger id="animalCategory">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="icon" onClick={() => setIsCategoryDialogOpen(true)} title="Ajouter une catégorie">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAnimalDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={async () => {
              if (!animalName || !animalSex || !animalDateEntree || !animalCategoryId) {
                toast({
                  title: "Erreur",
                  description: "Veuillez remplir tous les champs obligatoires.",
                  variant: "destructive"
                });
                return;
              }
              setIsCreatingAnimal(true);
              try {
                const { error } = await supabase
                  .from('animaux')
                  .insert({
                    nom: animalName,
                    sexe: animalSex,
                    sterilise: animalSterilise,
                    date_entree: animalDateEntree,
                    categorie_id: animalCategoryId
                  });
                if (error) throw error;
                toast({
                  title: "Animal ajouté",
                  description: `L'animal "${animalName}" a été ajouté.`,
                });
                setAnimalName('');
                setAnimalSex('');
                setAnimalSterilise(false);
                setAnimalDateEntree('');
                setAnimalCategoryId(null);
                setIsAnimalDialogOpen(false);
                await refreshCategories();
                // Optionnel : recharge la liste des animaux ici
              } catch (error) {
                toast({
                  title: "Erreur",
                  description: "Impossible d'ajouter l'animal.",
                  variant: "destructive"
                });
              } finally {
                setIsCreatingAnimal(false);
              }
            }}
            disabled={isCreatingAnimal}
          >
            {isCreatingAnimal ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ajout...
              </>
            ) : (
              'Ajouter'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Rendu du composant de gestion des utilisateurs
  const renderUserManagement = () => (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion des utilisateurs</CardTitle>
          <CardDescription>Gérer les accès et les permissions des utilisateurs</CardDescription>
        </div>
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Inviter un utilisateur</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Créez un compte pour un nouvel utilisateur avec les permissions appropriées.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email *</Label>
                <Input
                  id="email"
                  placeholder="nom@exemple.fr"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe temporaire *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mot de passe temporaire"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle professionnel *</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Vétérinaire</SelectItem>
                    <SelectItem value="modifier">Soigneur</SelectItem>
                    <SelectItem value="viewer">Bénévole</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="access">Droit d'accès *</Label>
                <Select value={accessLevel} onValueChange={setAccessLevel}>
                  <SelectTrigger id="access">
                    <SelectValue placeholder="Sélectionner un niveau d'accès" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="modifier">Modificateur</SelectItem>
                    <SelectItem value="viewer">Lecteur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Nom de famille"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Téléphone</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Numéro de téléphone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={sendInvite} disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer l\'utilisateur'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-shelter-purple" />
          </div>
        ) : (
          <>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier l'utilisateur</DialogTitle>
                  <DialogDescription>
                    Modifiez les informations de l'utilisateur.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editEmail">Email *</Label>
                    <Input
                      id="editEmail"
                      type="email"
                      placeholder="Email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle professionnel *</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Vétérinaire</SelectItem>
                        <SelectItem value="modifier">Soigneur</SelectItem>
                        <SelectItem value="viewer">Bénévole</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="access">Droit d'accès *</Label>
                    <Select value={accessLevel} onValueChange={setAccessLevel}>
                      <SelectTrigger id="access">
                        <SelectValue placeholder="Sélectionner un niveau d'accès" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="modifier">Modificateur</SelectItem>
                        <SelectItem value="viewer">Lecteur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Nom de famille"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Téléphone</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="Numéro de téléphone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleEditUser} disabled={isEditing}>
                    {isEditing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Modification en cours...
                      </>
                    ) : (
                      'Enregistrer les modifications'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Rôle professionnel</TableHead>
                  <TableHead>Droit d'accès</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.first_name || ''} {user.last_name || ''}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' ? (
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                          ) : user.role === 'modifier' ? (
                            <Edit className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="capitalize">
                            {user.role === 'admin' ? 'Vétérinaire' : 
                             user.role === 'modifier' ? 'Soigneur' : 
                             'Bénévole'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.access === 'admin' ? (
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                          ) : user.access === 'modifier' ? (
                            <Edit className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="capitalize">
                            {user.access === 'admin' ? 'Administrateur' : 
                             user.access === 'modifier' ? 'Modificateur' : 
                             'Lecteur'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier les informations
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );

  // Rendu du composant de gestion des animaux
  const renderAnimalManagement = () => (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion des animaux</CardTitle>
          <CardDescription>Gérer les informations des animaux du refuge</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button className="flex items-center gap-2" onClick={exportToExcel}>
            <Download className="h-4 w-4" />
            <span>Exporter en Excel</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 border rounded-lg bg-white text-black font-medium shadow-sm hover:bg-gray-100"
            onClick={() => setIsCategoryDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Ajouter une catégorie</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderCategoryDialog()}
        {renderAnimalDialog()}
        {loadingAnimals ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-shelter-purple" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Espèce</TableHead>
                <TableHead>Sexe</TableHead>
                <TableHead>Stérilisé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'entrée</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {animals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                    Aucun animal trouvé
                  </TableCell>
                </TableRow>
              ) : (
                animals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell>{animal.id}</TableCell>
                    <TableCell>
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                        {animal.photo_url ? (
                          <img 
                            src={animal.photo_url} 
                            alt={animal.nom || 'Photo de l\'animal'} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Cat className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{animal.nom}</TableCell>
                    <TableCell>{animal.espece}</TableCell>
                    <TableCell>{animal.sexe === 'M' ? 'Mâle' : animal.sexe === 'F' ? 'Femelle' : '-'}</TableCell>
                    <TableCell>{animal.sterilise ? 'Oui' : 'Non'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {animal.isInQuarantine && (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-800">
                            Quarantaine
                          </span>
                        )}
                        {animal.isDeceased && (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                            Décédé
                          </span>
                        )}
                        {!animal.isInQuarantine && !animal.isDeceased && (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                            Normal
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {animal.date_entree ? new Date(animal.date_entree).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/animal/${animal.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAnimal(animal.id)}
                        className="text-red-500 ml-2"
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  // Ajoute la fonction handleDeleteAnimal dans le composant AdminPortal
  const handleDeleteAnimal = async (animalId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet animal ? Cette action est irréversible.")) return;
    try {
      const { error } = await supabase
        .from('animaux')
        .delete()
        .eq('id', animalId);

      if (error) throw error;

      setAnimals(animals => animals.filter(a => a.id !== animalId));
      toast({
        title: "Animal supprimé",
        description: "L'animal a bien été supprimé.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'animal.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Portail d'administration</h1>
        </div>

        <Tabs 
          defaultValue="users" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="animals" className="flex items-center gap-2">
              <Cat className="h-4 w-4" />
              Animaux
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            {renderUserManagement()}
          </TabsContent>
          
          <TabsContent value="animals">
            {renderAnimalManagement()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPortal; 