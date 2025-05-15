-- Ajouter la colonne photo_url à la table animaux
ALTER TABLE public.animaux
ADD COLUMN IF NOT EXISTS photo_url TEXT; 