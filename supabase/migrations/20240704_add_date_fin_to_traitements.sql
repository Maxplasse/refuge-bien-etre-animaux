-- Migration: Ajout de la colonne date_fin à la table traitements
ALTER TABLE public.traitements ADD COLUMN IF NOT EXISTS date_fin TIMESTAMP WITH TIME ZONE; 