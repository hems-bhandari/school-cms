CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ne TEXT NOT NULL,
  description_en TEXT,
  description_ne TEXT,
  category_en VARCHAR(100) NOT NULL,
  category_ne VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- in bytes
  file_type VARCHAR(100) NOT NULL, -- MIME type
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  uploaded_by VARCHAR(255),
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  display_order INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_documents_category ON documents(category_en);
CREATE INDEX idx_documents_upload_date ON documents(upload_date DESC);
CREATE INDEX idx_documents_is_public ON documents(is_public);
CREATE INDEX idx_documents_is_featured ON documents(is_featured);

-- RLS (Row Level Security) policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy for public access (only published documents)
CREATE POLICY "Public documents are viewable by everyone" ON documents
  FOR SELECT USING (is_public = true);

-- Policy for authenticated users (admins) - full access
CREATE POLICY "Admins have full access to documents" ON documents
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert some sample data
INSERT INTO documents (title_en, title_ne, description_en, description_ne, category_en, category_ne, file_url, file_name, file_size, file_type, is_featured) VALUES
('School Handbook 2025', 'विद्यालय पुस्तिका २०८२', 'Complete guide for students and parents', 'विद्यार्थी र अभिभावकहरूको लागि पूर्ण गाइड', 'Academic', 'शैक्षिक', 'https://example.com/handbook.pdf', 'school_handbook_2025.pdf', 2048000, 'application/pdf', true),
('Admission Form', 'भर्ना फारम', 'Application form for new admissions', 'नयाँ भर्नाको लागि आवेदन फारम', 'Forms', 'फारमहरू', 'https://example.com/admission.pdf', 'admission_form.pdf', 512000, 'application/pdf', true),
('Annual Report 2024', 'वार्षिक प्रतिवेदन २०८१', 'School annual activity and progress report', 'विद्यालयको वार्षिक गतिविधि र प्रगति प्रतिवेदन', 'Reports', 'प्रतिवेदनहरू', 'https://example.com/annual.pdf', 'annual_report_2024.pdf', 3072000, 'application/pdf', false);
