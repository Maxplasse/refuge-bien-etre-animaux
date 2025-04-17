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