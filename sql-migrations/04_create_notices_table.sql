CREATE TABLE notices (
  id SERIAL PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ne TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_ne TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  priority VARCHAR(20) DEFAULT 'normal',
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  attachment_url TEXT,
  attachment_name TEXT,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notices_published_date ON notices(published_date DESC);
CREATE INDEX idx_notices_category ON notices(category);
CREATE INDEX idx_notices_priority ON notices(priority);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to published notices
CREATE POLICY "Anyone can view published notices" ON notices
  FOR SELECT USING (is_published = true);

-- Policy for authenticated admin full access
CREATE POLICY "Authenticated users can manage notices" ON notices
  FOR ALL USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO notices (title_en, title_ne, content_en, content_ne, category, priority, is_featured) VALUES
('Welcome to New Academic Year 2025', 'नयाँ शैक्षिक वर्ष २०२५ मा स्वागत', 
 'We are excited to welcome all students and parents to the new academic year 2025. Classes will begin from February 1st, 2025.', 
 'हामी सबै विद्यार्थी र अभिभावकहरूलाई नयाँ शैक्षिक वर्ष २०२५ मा स्वागत गर्दछौं। कक्षाहरू २०२५ फेब्रुअरी १ देखि सुरु हुनेछन्।',
 'academic', 'high', true),

('Parent-Teacher Meeting Schedule', 'अभिभावक-शिक्षक बैठक तालिका',
 'Parent-Teacher meetings will be held on every first Saturday of the month from 10 AM to 4 PM.',
 'अभिभावक-शिक्षक बैठक हरेक महिनाको पहिलो शनिबार बिहान १० बजेदेखि दिउँसो ४ बजेसम्म आयोजना गरिनेछ।',
 'administrative', 'normal', false),

('Annual Sports Day 2025', 'वार्षिक खेलकुद दिवस २०२५',
 'Annual Sports Day will be celebrated on March 15th, 2025. All students are encouraged to participate.',
 'वार्षिक खेलकुद दिवस २०२५ मार्च १५ मा मनाइनेछ। सबै विद्यार्थीहरूलाई सहभागिता लिन प्रोत्साहन गरिन्छ।',
 'events', 'normal', true);
