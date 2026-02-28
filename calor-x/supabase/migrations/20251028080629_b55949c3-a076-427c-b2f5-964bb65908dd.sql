-- Drop existing policies
DROP POLICY IF EXISTS "Allow public upload of food images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read of food images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own food images" ON storage.objects;

-- Create truly public policies for food-images bucket
CREATE POLICY "Public upload to food-images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'food-images');

CREATE POLICY "Public read from food-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'food-images');

CREATE POLICY "Public delete from food-images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'food-images');