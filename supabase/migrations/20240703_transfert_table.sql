-- Create the set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table for animal transfers
CREATE TABLE IF NOT EXISTS transferts (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL REFERENCES animaux(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  nom_adoptant TEXT NOT NULL,
  adresse TEXT,
  telephone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for transferts table
ALTER TABLE transferts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view transfers
CREATE POLICY "Authenticated users can view transferts" ON transferts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert transfers
CREATE POLICY "Authenticated users can insert transferts" ON transferts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update transfers
CREATE POLICY "Authenticated users can update transferts" ON transferts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON transferts
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at(); 