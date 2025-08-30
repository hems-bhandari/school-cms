ALTER TABLE committee ADD COLUMN committee_type VARCHAR(50) DEFAULT 'SMC';

CREATE TABLE committee_content (
  id SERIAL PRIMARY KEY,
  committee_type VARCHAR(50) NOT NULL UNIQUE,
  title_en VARCHAR(255) NOT NULL,
  title_ne VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_ne TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO committee_content (committee_type, title_en, title_ne, description_en, description_ne) VALUES
('SMC', 'School Management Committee', 'विद्यालय व्यवस्थापन समिति', 
 'Our School Management Committee (SMC) is responsible for the overall governance and strategic direction of the school. The committee works closely with the school administration to ensure quality education and proper management of school resources.',
 'हाम्रो विद्यालय व्यवस्थापन समिति (एसएमसी) विद्यालयको समग्र शासन र रणनीतिक दिशाको लागि जिम्मेवार छ। समितिले गुणस्तरीय शिक्षा र विद्यालयको स्रोतहरूको उचित व्यवस्थापन सुनिश्चित गर्न विद्यालय प्रशासनसँग नजिकै काम गर्छ।'),

('PTA', 'Parents Teachers Association', 'अभिभावक शिक्षक संघ', 
 'The Parents Teachers Association (PTA) serves as a bridge between parents and teachers, fostering collaboration to enhance the educational experience of our students. The PTA organizes various activities and provides valuable feedback to improve school programs.',
 'अभिभावक शिक्षक संघ (पीटीए) अभिभावक र शिक्षकहरूबीचको सेतुको रूपमा काम गर्छ, हाम्रा विद्यार्थीहरूको शैक्षिक अनुभव बढाउन सहयोगलाई बढावा दिन्छ। पीटीएले विभिन्न गतिविधिहरू आयोजना गर्छ र विद्यालय कार्यक्रमहरू सुधार गर्न मूल्यवान प्रतिक्रिया प्रदान गर्छ।');

CREATE INDEX idx_committee_type ON committee(committee_type);
CREATE INDEX idx_committee_content_type ON committee_content(committee_type);

ALTER TABLE committee_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active committee content" ON committee_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage committee content" ON committee_content
  FOR ALL USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION update_committee_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_committee_content_updated_at BEFORE UPDATE ON committee_content
    FOR EACH ROW EXECUTE FUNCTION update_committee_content_updated_at();

-- Update existing committee members to be SMC by default
UPDATE committee SET committee_type = 'SMC' WHERE committee_type IS NULL;

INSERT INTO committee (name_en, name_ne, role_en, role_ne, bio_en, bio_ne, display_order, is_active, committee_type) VALUES
('Mrs. Laxmi Devi Karki', 'श्रीमती लक्ष्मी देवी कार्की', 'PTA President', 'पीटीए अध्यक्ष', 
 'Mrs. Karki leads the PTA with dedication, ensuring strong parent-teacher collaboration for student success.',
 'श्रीमती कार्कीले विद्यार्थीहरूको सफलताको लागि मजबूत अभिभावक-शिक्षक सहयोग सुनिश्चित गर्दै समर्पणका साथ पीटीएको नेतृत्व गर्छिन्।',
 1, true, 'PTA'),

('Mr. Hari Prasad Adhikari', 'श्री हरि प्रसाद अधिकारी', 'PTA Vice President', 'पीटीए उपाध्यक्ष',
 'Mr. Adhikari supports the PTA president and coordinates various parent engagement activities.',
 'श्री अधिकारीले पीटीए अध्यक्षलाई समर्थन गर्छन् र विभिन्न अभिभावक सहभागिता गतिविधिहरू समन्वय गर्छन्।',
 2, true, 'PTA'),

('Mrs. Sita Thapa', 'श्रीमती सीता थापा', 'PTA Secretary', 'पीटीए सचिव',
 'Mrs. Thapa manages PTA communications and maintains records of all PTA activities and meetings.',
 'श्रीमती थापाले पीटीए संचार व्यवस्थापन गर्छिन् र सबै पीटीए गतिविधिहरू र बैठकहरूको अभिलेख राख्छिन्।',
 3, true, 'PTA');
