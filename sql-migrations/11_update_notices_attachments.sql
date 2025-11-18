-- Add support for multiple file attachments in notices
-- Add attachments JSONB column to store array of file objects
ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Create storage bucket for notice attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('notice-attachments', 'notice-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public read access to notice attachments
CREATE POLICY "Public read access on notice attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'notice-attachments');

-- Create policy to allow authenticated users to upload notice attachments
CREATE POLICY "Authenticated users can upload notice attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'notice-attachments' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to update notice attachments
CREATE POLICY "Authenticated users can update notice attachments" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'notice-attachments' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to delete notice attachments
CREATE POLICY "Authenticated users can delete notice attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'notice-attachments' 
  AND auth.role() = 'authenticated'
);

-- Add comment to explain the attachments structure
COMMENT ON COLUMN notices.attachments IS 'Array of file objects with structure: [{url: string, name: string, type: string, size: number}]';

