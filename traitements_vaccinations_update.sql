-- Add updated_at column to traitements
ALTER TABLE traitements 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_traitements_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_traitements_updated_at ON traitements;

-- Create the trigger
CREATE TRIGGER set_traitements_updated_at
BEFORE UPDATE ON traitements
FOR EACH ROW
EXECUTE FUNCTION update_traitements_modified_column();

-- Populate updated_at with created_at for existing records
UPDATE traitements SET updated_at = created_at WHERE updated_at IS NULL;

-- Add updated_at column to vaccinations
ALTER TABLE vaccinations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_vaccinations_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_vaccinations_updated_at ON vaccinations;

-- Create the trigger
CREATE TRIGGER set_vaccinations_updated_at
BEFORE UPDATE ON vaccinations
FOR EACH ROW
EXECUTE FUNCTION update_vaccinations_modified_column();

-- Populate updated_at with created_at for existing records
UPDATE vaccinations SET updated_at = created_at WHERE updated_at IS NULL;
