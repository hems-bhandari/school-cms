CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_ne VARCHAR(255) NOT NULL,
  position_en VARCHAR(255) NOT NULL,
  position_ne VARCHAR(255) NOT NULL,
  bio_en TEXT,
  bio_ne TEXT,
  photo_url VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(50),
  qualifications_en TEXT,
  qualifications_ne TEXT,
  experience_years INTEGER DEFAULT 0,
  specialization_en VARCHAR(255),
  specialization_ne VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO teachers (
  name_en, name_ne, position_en, position_ne, 
  bio_en, bio_ne, email, phone, 
  qualifications_en, qualifications_ne, 
  experience_years, specialization_en, specialization_ne, 
  display_order
) VALUES 
(
  'Ram Kumar Sharma', 'राम कुमार शर्मा',
  'Principal', 'प्रधानाध्यापक',
  'Dedicated educator with over 20 years of experience in educational leadership and administration.',
  'शिक्षा क्षेत्रमा २० वर्ष भन्दा बढी अनुभव भएका समर्पित शिक्षक।',
  'principal@school.edu.np', '+977-1-4567890',
  'M.Ed in Educational Administration, B.Ed', 'शिक्षा प्रशासनमा स्नातकोत्तर, शिक्षाशास्त्रमा स्नातक',
  20, 'Educational Leadership', 'शैक्षिक नेतृत्व',
  1
),
(
  'Sita Devi Poudel', 'सीता देवी पौडेल',
  'Mathematics Teacher', 'गणित शिक्षक',
  'Passionate mathematics teacher who makes complex concepts simple and engaging for students.',
  'जटिल गणितीय अवधारणाहरूलाई सरल र रोचक बनाउने दक्ष गणित शिक्षक।',
  'sita.math@school.edu.np', '+977-1-4567891',
  'M.Sc Mathematics, B.Ed', 'गणितमा स्नातकोत्तर, शिक्षाशास्त्रमा स्नातक',
  15, 'Advanced Mathematics', 'उच्च गणित',
  2
),
(
  'Hari Bahadur Thapa', 'हरि बहादुर थापा',
  'Science Teacher', 'विज्ञान शिक्षक',
  'Innovative science educator with expertise in practical learning and laboratory management.',
  'प्रयोगशाला व्यवस्थापन र व्यावहारिक शिक्षामा दक्ष विज्ञान शिक्षक।',
  'hari.science@school.edu.np', '+977-1-4567892',
  'M.Sc Physics, B.Ed', 'भौतिकशास्त्रमा स्नातकोत्तर, शिक्षाशास्त्रमा स्नातक',
  12, 'Physics & Chemistry', 'भौतिक र रसायन विज्ञान',
  3
);

-- Enable RLS (Row Level Security)
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active teachers
CREATE POLICY "Allow public read access on active teachers" ON teachers 
FOR SELECT USING (is_active = true);

-- Allow authenticated users to modify (for admin)
CREATE POLICY "Allow authenticated insert on teachers" ON teachers 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on teachers" ON teachers 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on teachers" ON teachers 
FOR DELETE USING (auth.role() = 'authenticated');
