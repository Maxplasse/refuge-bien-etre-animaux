-- Enable RLS on the deces table
ALTER TABLE deces ENABLE ROW LEVEL SECURITY;

-- Policy for inserting death records (allow authenticated users to insert)
CREATE POLICY "Enable insert for authenticated users only"
ON deces FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Policy for viewing death records (allow authenticated users to view all records)
CREATE POLICY "Enable read access for authenticated users"
ON deces FOR SELECT 
TO authenticated
USING (true);

-- Policy for updating death records (allow authenticated users to update)
CREATE POLICY "Enable update for authenticated users"
ON deces FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true); 