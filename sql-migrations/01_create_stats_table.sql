CREATE TABLE stats (
  id SERIAL PRIMARY KEY,
  label_en VARCHAR(255) NOT NULL,
  label_ne VARCHAR(255) NOT NULL,
  value INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO stats (label_en, label_ne, value, display_order) VALUES 
('Total Students', 'कुल विद्यार्थी', 1250, 1),
('Teaching Staff', 'शिक्षक कर्मचारी', 45, 2),
('Years of Excellence', 'उत्कृष्टताका वर्ष', 25, 3),
('Graduation Rate', 'स्नातक दर (%)', 98, 4);

ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on stats" ON stats FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on stats" ON stats FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on stats" ON stats FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on stats" ON stats FOR DELETE USING (auth.role() = 'authenticated');
