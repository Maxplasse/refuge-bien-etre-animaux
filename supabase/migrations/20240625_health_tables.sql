-- Create traitements table
CREATE TABLE IF NOT EXISTS public.traitements (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL REFERENCES public.animaux(id) ON DELETE CASCADE,
  designation TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE,
  ordonnance TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vaccinations table
CREATE TABLE IF NOT EXISTS public.vaccinations (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL REFERENCES public.animaux(id) ON DELETE CASCADE,
  designation TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE,
  ordonnance TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS traitements_animal_id_idx ON public.traitements (animal_id);
CREATE INDEX IF NOT EXISTS vaccinations_animal_id_idx ON public.vaccinations (animal_id);

-- Enable Row Level Security
ALTER TABLE public.traitements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all access to authenticated users" ON public.traitements
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all access to authenticated users" ON public.vaccinations
  FOR ALL USING (auth.role() = 'authenticated'); 