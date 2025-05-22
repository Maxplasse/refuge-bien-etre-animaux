export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      animaux: {
        Row: {
          id: number
          nom: string | null
          espece: string | null
          race: string | null
          couleurs: string | null
          proprietaire: string | null
          identification: string | null
          date_naissance: string | null
          sexe: string | null
          sterilise: boolean | null
          particularites: string | null
          provenance: string | null
          date_entree: string | null
          amenant_id: number | null
          created_at: string
          photo_url: string | null
        }
        Insert: {
          id?: number
          nom?: string | null
          espece?: string | null
          race?: string | null
          couleurs?: string | null
          proprietaire?: string | null
          identification?: string | null
          date_naissance?: string | null
          sexe?: string | null
          sterilise?: boolean | null
          particularites?: string | null
          provenance?: string | null
          date_entree?: string | null
          amenant_id?: number | null
          created_at?: string
          photo_url?: string | null
        }
        Update: {
          id?: number
          nom?: string | null
          espece?: string | null
          race?: string | null
          couleurs?: string | null
          proprietaire?: string | null
          identification?: string | null
          date_naissance?: string | null
          sexe?: string | null
          sterilise?: boolean | null
          particularites?: string | null
          provenance?: string | null
          date_entree?: string | null
          amenant_id?: number | null
          created_at?: string
          photo_url?: string | null
        }
      }
      transferts: {
        Row: {
          id: number
          animal_id: number
          date: string
          nom_adoptant: string
          adresse: string | null
          telephone: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          animal_id: number
          date: string
          nom_adoptant: string
          adresse?: string | null
          telephone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          animal_id?: number
          date?: string
          nom_adoptant?: string
          adresse?: string | null
          telephone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quarantines: {
        Row: {
          id: number
          animal_id: number
          date_debut: string
          date_fin: string | null
          raison: string | null
          observations: string | null
          created_at: string
        }
        Insert: {
          id?: number
          animal_id: number
          date_debut?: string
          date_fin?: string | null
          raison?: string | null
          observations?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          animal_id?: number
          date_debut?: string
          date_fin?: string | null
          raison?: string | null
          observations?: string | null
          created_at?: string
        }
      }
      observations: {
        Row: {
          id: number
          quarantine_id: number
          date: string
          description: string
          resultat_test: string | null
          created_at: string
        }
        Insert: {
          id?: number
          quarantine_id: number
          date?: string
          description: string
          resultat_test?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          quarantine_id?: number
          date?: string
          description?: string
          resultat_test?: string | null
          created_at?: string
        }
      }
      traitements: {
        Row: {
          id: number
          animal_id: number
          designation: string
          date: string | null
          ordonnance: string | null
          created_at: string
        }
        Insert: {
          id?: number
          animal_id: number
          designation: string
          date?: string | null
          ordonnance?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          animal_id?: number
          designation?: string
          date?: string | null
          ordonnance?: string | null
          created_at?: string
        }
      }
      vaccinations: {
        Row: {
          id: number
          animal_id: number
          designation: string
          date: string | null
          ordonnance: string | null
          created_at: string
        }
        Insert: {
          id?: number
          animal_id: number
          designation: string
          date?: string | null
          ordonnance?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          animal_id?: number
          designation?: string
          date?: string | null
          ordonnance?: string | null
          created_at?: string
        }
      }
      deces: {
        Row: {
          id: number
          animal_id: number
          date: string
          cause: string | null
          observations: string | null
          created_at: string
        }
        Insert: {
          id?: number
          animal_id: number
          date: string
          cause?: string | null
          observations?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          animal_id?: number
          date?: string
          cause?: string | null
          observations?: string | null
          created_at?: string
        }
      }
      amenants: {
        Row: {
          id: number
          nom_prenom: string
          entreprise: string | null
          telephone: string | null
          email: string | null
          adresse: string | null
          created_at: string
        }
        Insert: {
          id?: number
          nom_prenom: string
          entreprise?: string | null
          telephone?: string | null
          email?: string | null
          adresse?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          nom_prenom?: string
          entreprise?: string | null
          telephone?: string | null
          email?: string | null
          adresse?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 