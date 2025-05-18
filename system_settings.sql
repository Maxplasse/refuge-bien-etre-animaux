-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial values
INSERT INTO public.system_settings (key, value)
VALUES ('lastObservationTime', CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING; 