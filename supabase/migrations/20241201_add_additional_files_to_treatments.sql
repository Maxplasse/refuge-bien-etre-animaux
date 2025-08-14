-- Migration: Ajout de fichiers supplémentaires pour les traitements
-- Ajouter jusqu'à 3 fichiers supplémentaires en plus du fichier d'ordonnance principal

-- Ajouter les colonnes pour les fichiers supplémentaires aux traitements
ALTER TABLE public.traitements 
ADD COLUMN IF NOT EXISTS fichier_supplementaire_1_path TEXT,
ADD COLUMN IF NOT EXISTS fichier_supplementaire_1_name TEXT,
ADD COLUMN IF NOT EXISTS fichier_supplementaire_2_path TEXT,
ADD COLUMN IF NOT EXISTS fichier_supplementaire_2_name TEXT,
ADD COLUMN IF NOT EXISTS fichier_supplementaire_3_path TEXT,
ADD COLUMN IF NOT EXISTS fichier_supplementaire_3_name TEXT;
