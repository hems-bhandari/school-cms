CREATE TABLE committee (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_ne VARCHAR(255) NOT NULL,
  role_en VARCHAR(255) NOT NULL,
  role_ne VARCHAR(255) NOT NULL,
  photo_url TEXT,
  bio_en TEXT,
  bio_ne TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_committee_display_order ON committee(display_order);
CREATE INDEX idx_committee_is_active ON committee(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE committee ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to active committee members
CREATE POLICY "Anyone can view active committee members" ON committee
  FOR SELECT USING (is_active = true);

-- Policy for authenticated admin full access
CREATE POLICY "Authenticated users can manage committee" ON committee
  FOR ALL USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION update_committee_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_committee_updated_at BEFORE UPDATE ON committee
    FOR EACH ROW EXECUTE FUNCTION update_committee_updated_at();

INSERT INTO storage.buckets (id, name, public) VALUES ('committee-photos', 'committee-photos', true);

-- Storage policies for committee photos
CREATE POLICY "Anyone can view committee photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'committee-photos');

CREATE POLICY "Authenticated users can upload committee photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'committee-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update committee photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'committee-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete committee photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'committee-photos' AND auth.role() = 'authenticated');

INSERT INTO committee (name_en, name_ne, role_en, role_ne, bio_en, bio_ne, display_order, is_active) VALUES
('Dr. Ram Prasad Sharma', 'डा. राम प्रसाद शर्मा', 'Chairman', 'अध्यक्ष', 
 'Dr. Sharma has been leading our school with dedication for over 15 years.', 
 'डा. शर्माले १५ वर्षभन्दा बढी समयदेखि हाम्रो विद्यालयको नेतृत्व गर्दै आउनुभएको छ।', 
 1, true),

('Mrs. Sita Devi Paudel', 'श्रीमती सीता देवी पौडेल', 'Vice Chairman', 'उपाध्यक्ष',
 'Mrs. Paudel brings extensive experience in education management and community development.',
 'श्रीमती पौडेलसँग शिक्षा व्यवस्थापन र सामुदायिक विकासमा व्यापक अनुभव छ।',
 2, true),

('Mr. Krishna Bahadur Thapa', 'श्री कृष्ण बहादुर थापा', 'Secretary', 'सचिव',
 'Mr. Thapa manages administrative affairs and maintains excellent records.',
 'श्री थापाले प्रशासनिक कार्यहरू व्यवस्थापन गर्छन् र उत्कृष्ट अभिलेख राख्छन्।',
 3, true),

('Mrs. Kamala Sharma', 'श्रीमती कमला शर्मा', 'Treasurer', 'कोषाध्यक्ष',
 'Mrs. Sharma oversees financial management with transparency and accountability.',
 'श्रीमती शर्माले पारदर्शिता र जवाफदेहिताका साथ वित्तीय व्यवस्थापनको निरीक्षण गर्छिन्।',
 4, true);
