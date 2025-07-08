CREATE TABLE IF NOT EXISTS footer (
    id SERIAL PRIMARY KEY,
    school_name_en TEXT NOT NULL,
    school_name_ne TEXT NOT NULL,
    address_en TEXT NOT NULL,
    address_ne TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    office_hours_en TEXT,
    office_hours_ne TEXT,
    
    facebook_url TEXT,
    twitter_url TEXT,
    instagram_url TEXT,
    youtube_url TEXT,
    linkedin_url TEXT,
    
    quick_links JSONB DEFAULT '[]'::jsonb,
    
    logo_url TEXT,
    copyright_text_en TEXT,
    copyright_text_ne TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_footer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER footer_updated_at
    BEFORE UPDATE ON footer
    FOR EACH ROW
    EXECUTE FUNCTION update_footer_updated_at();

ALTER TABLE footer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to footer" ON footer
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users full access to footer" ON footer
    FOR ALL USING (auth.uid() IS NOT NULL);

INSERT INTO footer (
    school_name_en,
    school_name_ne,
    address_en,
    address_ne,
    phone,
    email,
    office_hours_en,
    office_hours_ne,
    copyright_text_en,
    copyright_text_ne,
    quick_links
) VALUES (
    'Your School Name',
    'तपाईंको विद्यालयको नाम',
    '123 School Street, City, State 12345',
    '१२३ विद्यालय मार्ग, शहर, प्रदेश १२३४५',
    '+1 (555) 123-4567',
    'info@yourschool.edu',
    'Monday - Friday: 8:00 AM - 4:00 PM',
    'सोमबार - शुक्रबार: बिहान ८:०० - बेलुका ४:००',
    '© 2025 Your School Name. All rights reserved.',
    '© २०२५ तपाईंको विद्यालयको नाम। सबै अधिकार सुरक्षित।',
    '[
        {"label_en": "About Us", "label_ne": "हाम्रो बारेमा", "url": "/about"},
        {"label_en": "Teachers", "label_ne": "शिक्षकहरू", "url": "/teachers"},
        {"label_en": "Notices", "label_ne": "सूचनाहरू", "url": "/notices"},
        {"label_en": "Activities", "label_ne": "गतिविधिहरू", "url": "/activities"}
    ]'::jsonb
);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('footer-assets', 'footer-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access to footer assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'footer-assets');

CREATE POLICY "Allow authenticated users to upload footer assets" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'footer-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update footer assets" ON storage.objects
    FOR UPDATE USING (bucket_id = 'footer-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete footer assets" ON storage.objects
    FOR DELETE USING (bucket_id = 'footer-assets' AND auth.uid() IS NOT NULL);
