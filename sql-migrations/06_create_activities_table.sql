CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_ne VARCHAR(255) NOT NULL,
  description_en TEXT NOT NULL,
  description_ne TEXT NOT NULL,
  preview_img_url TEXT,
  gallery_urls TEXT[],
  event_date DATE NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_event_date ON activities(event_date DESC);
CREATE INDEX idx_activities_is_featured ON activities(is_featured);
CREATE INDEX idx_activities_is_published ON activities(is_published);
CREATE INDEX idx_activities_display_order ON activities(display_order);

-- Enable RLS (Row Level Security)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to published activities
CREATE POLICY "Anyone can view published activities" ON activities
  FOR SELECT USING (is_published = true);

-- Policy for authenticated admin full access
CREATE POLICY "Authenticated users can manage activities" ON activities
  FOR ALL USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_activities_updated_at();

INSERT INTO storage.buckets (id, name, public) VALUES ('activities-images', 'activities-images', true);

-- Storage policies for activities images
CREATE POLICY "Anyone can view activities images" ON storage.objects
  FOR SELECT USING (bucket_id = 'activities-images');

CREATE POLICY "Authenticated users can upload activities images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'activities-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update activities images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'activities-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete activities images" ON storage.objects
  FOR DELETE USING (bucket_id = 'activities-images' AND auth.role() = 'authenticated');

INSERT INTO activities (title_en, title_ne, description_en, description_ne, event_date, is_featured, display_order) VALUES
('Annual Sports Day 2024', 'वार्षिक खेलकुद दिवस २०२४', 
 'Our annual sports day was a grand success with students participating in various sports including football, basketball, athletics, and traditional games. The event showcased the athletic talents of our students and promoted healthy competition.', 
 'हाम्रो वार्षिक खेलकुद दिवस फुटबल, बास्केटबल, एथलेटिक्स र परम्परागत खेलहरू सहित विभिन्न खेलहरूमा विद्यार्थीहरूको सहभागितामा ठूलो सफलता थियो। यस कार्यक्रमले हाम्रा विद्यार्थीहरूको खेलकुद प्रतिभालाई प्रदर्शन गर्यो र स्वस्थ प्रतिस्पर्धालाई बढावा दियो।',
 '2024-12-15', true, 1),

('Science Exhibition 2024', 'विज्ञान प्रदर्शनी २०२४',
 'Students from grades 6-12 showcased innovative science projects covering topics from renewable energy to robotics. The exhibition demonstrated our commitment to STEM education and encouraged scientific thinking among students.',
 'कक्षा ६ देखि १२ सम्मका विद्यार्थीहरूले नवीकरणीय ऊर्जादेखि रोबोटिक्ससम्मका विषयहरू समेट्दै नवाचारपूर्ण विज्ञान परियोजनाहरू प्रदर्शन गरे। यस प्रदर्शनीले STEM शिक्षाप्रतिको हाम्रो प्रतिबद्धता देखायो र विद्यार्थीहरूमा वैज्ञानिक सोचलाई प्रोत्साहन गर्यो।',
 '2024-11-20', true, 2),

('Cultural Program 2024', 'सांस्कृतिक कार्यक्रम २०२४',
 'A vibrant cultural program featuring traditional Nepali dances, songs, and drama performances by our talented students. The event celebrated our rich cultural heritage and provided a platform for artistic expression.',
 'हाम्रा प्रतिभाशाली विद्यार्थीहरूले परम्परागत नेपाली नृत्य, गीत र नाटक प्रस्तुत गर्ने जीवन्त सांस्कृतिक कार्यक्रम। यस कार्यक्रमले हाम्रो समृद्ध सांस्कृतिक सम्पदाको उत्सव मनायो र कलात्मक अभिव्यक्तिको मञ्च प्रदान गर्यो।',
 '2024-10-10', false, 3),

('Inter-School Quiz Competition', 'अन्तर-विद्यालय क्विज प्रतियोगिता',
 'Our school hosted an inter-school quiz competition with participation from 15 schools across the district. Topics covered general knowledge, science, history, and current affairs.',
 'हाम्रो विद्यालयले जिल्लाभरका १५ विद्यालयहरूको सहभागितामा अन्तर-विद्यालय क्विज प्रतियोगिताको आयोजना गर्यो। विषयहरूमा सामान्य ज्ञान, विज्ञान, इतिहास र समसामयिक घटनाहरू समावेश थिए।',
 '2024-09-05', false, 4);
