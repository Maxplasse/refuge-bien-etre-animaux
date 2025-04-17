-- Create quarantines table
CREATE TABLE IF NOT EXISTS public.quarantines (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL REFERENCES public.animaux(id) ON DELETE CASCADE,
  date_debut TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_fin TIMESTAMP WITH TIME ZONE,
  raison TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create observations table for quarantine follow-ups
CREATE TABLE IF NOT EXISTS public.observations (
  id SERIAL PRIMARY KEY,
  quarantine_id INTEGER NOT NULL REFERENCES public.quarantines(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  resultat_test TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS quarantines_animal_id_idx ON public.quarantines (animal_id);
CREATE INDEX IF NOT EXISTS observations_quarantine_id_idx ON public.observations (quarantine_id);

-- Enable Row Level Security
ALTER TABLE public.quarantines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all access to authenticated users" ON public.quarantines
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all access to authenticated users" ON public.observations
  FOR ALL USING (auth.role() = 'authenticated'); 