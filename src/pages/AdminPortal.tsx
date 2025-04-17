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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2, MoreVertical, PlusCircle, Trash, UserPlus, ShieldAlert, Edit, Eye } from 'lucide-react';
import Header from '@/components/Header';

interface User {
  id: string;
  role: string;
  created_at: string;
  access: string;
  last_name?: string;
  first_name?: string;
  phone_number?: string;
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

const AdminPortal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [accessLevel, setAccessLevel] = useState('viewer');
  const [isSending, setIsSending] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

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
          phone_number: user.phone_number
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
          phone_number: phoneNumber || null
        });

      if (userError) {
        // En cas d'erreur, on ne peut pas supprimer l'utilisateur créé car nous n'avons pas les droits d'admin
        // Il faudrait implémenter une fonction serveur pour gérer ce cas
        console.error("Erreur lors de la création de l'utilisateur dans la table user:", userError);
        throw new Error(`L'utilisateur a été créé dans le système d'authentification mais pas dans la table user: ${userError.message}`);
      }
      
      // 4. Ajouter le nouvel utilisateur à la liste des utilisateurs affichés
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
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin', 'role')}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Définir comme Vétérinaire
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'modifier', 'role')}>
                            <Edit className="mr-2 h-4 w-4" />
                            Définir comme Soigneur
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'viewer', 'role')}>
                            <Eye className="mr-2 h-4 w-4" />
                            Définir comme Bénévole
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin', 'access')}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Définir comme Administrateur
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'modifier', 'access')}>
                            <Edit className="mr-2 h-4 w-4" />
                            Définir comme Modificateur
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'viewer', 'access')}>
                            <Eye className="mr-2 h-4 w-4" />
                            Définir comme Lecteur
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
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Portail d'administration</h1>
        </div>

        {renderUserManagement()}
      </div>
    </div>
  );
};

export default AdminPortal; 