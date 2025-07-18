INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('teacher-photos', 'teacher-photos', true),
  ('documents', 'documents', true);

-- Create policy to allow public read access to teacher photos
CREATE POLICY "Public read access on teacher photos" ON storage.objects
FOR SELECT USING (bucket_id = 'teacher-photos');

-- Create policy to allow authenticated users to upload teacher photos
CREATE POLICY "Authenticated users can upload teacher photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'teacher-photos' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to update teacher photos
CREATE POLICY "Authenticated users can update teacher photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'teacher-photos' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to delete teacher photos
CREATE POLICY "Authenticated users can delete teacher photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'teacher-photos' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow public read access to documents
CREATE POLICY "Public read access on documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

-- Create policy to allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to update documents
CREATE POLICY "Authenticated users can update documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to delete documents
CREATE POLICY "Authenticated users can delete documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);
