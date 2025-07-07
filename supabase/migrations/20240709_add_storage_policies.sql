-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Enable upload for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable download for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable upload for authenticated users with animal ID" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for authenticated users with animal ID" ON storage.objects;
DROP POLICY IF EXISTS "Enable download for authenticated users with access" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users with access" ON storage.objects;

-- S'assurer que le bucket est configuré correctement
UPDATE storage.buckets
SET public = true
WHERE id = 'deces';

-- Créer une seule policy qui permet toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Enable all operations for authenticated users"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'deces' )
WITH CHECK ( bucket_id = 'deces' ); 