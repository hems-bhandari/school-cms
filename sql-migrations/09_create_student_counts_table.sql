CREATE TABLE IF NOT EXISTS student_counts (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL,
  boys INTEGER NOT NULL DEFAULT 0,
  girls INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE student_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on student_counts" ON student_counts
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on student_counts" ON student_counts
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on student_counts" ON student_counts
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on student_counts" ON student_counts
FOR DELETE USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION set_student_counts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_counts_updated_at ON student_counts;
CREATE TRIGGER trg_student_counts_updated_at
BEFORE UPDATE ON student_counts
FOR EACH ROW EXECUTE FUNCTION set_student_counts_updated_at();


