BEGIN;

-- Distinguish teaching staff from non-academic staff. Reporting dropdowns,
-- teacher IDs and public faculty counts use this flag.
ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS is_academic boolean NOT NULL DEFAULT true;

UPDATE public.teachers
SET is_academic = false,
    report_level = NULL,
    updated_at = now()
WHERE name_ne IN (
  'रमा यादव',
  'सावित्री अधिकारी',
  'रमेश यादव',
  'श्यामबहादुर यादव',
  'देवी चौधरी थारु'
);

-- Non-academic staff neither submit academic reports nor own academic
-- class/subject assignments.
DELETE FROM public.teacher_report_access access
USING public.teachers teacher
WHERE access.teacher_id = teacher.id
  AND teacher.is_academic = false;

UPDATE public.class_subject assignment
SET is_active = false
FROM public.teachers teacher
WHERE assignment.teacher_id = teacher.id
  AND teacher.is_academic = false;

UPDATE public.school_classes class
SET class_teacher_id = NULL
FROM public.teachers teacher
WHERE class.class_teacher_id = teacher.id
  AND teacher.is_academic = false;

-- Only teaching staff receive a report ID when a new profile is created.
CREATE OR REPLACE FUNCTION public.create_teacher_report_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_academic THEN
    INSERT INTO public.teacher_report_access (teacher_id, teacher_code)
    VALUES (NEW.id, 'T-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)))
    ON CONFLICT (teacher_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Correct the subject master list. नैतिक शिक्षा is retained as inactive so
-- historical reports remain valid, while it disappears from every dropdown.
UPDATE public.school_subjects
SET is_active = false
WHERE subject_code = 'MORAL' OR name_ne = 'नैतिक शिक्षा';

UPDATE public.class_subject assignment
SET is_active = false
FROM public.school_subjects subject
WHERE assignment.subject_id = subject.id
  AND subject.is_active = false;

INSERT INTO public.school_subjects (subject_code, name_ne, is_active)
VALUES
  ('AGRI', 'कृषि शिक्षा', true),
  ('SERO', 'सेरोफेरो', true),
  ('POP', 'जनसङ्ख्या शिक्षा', true),
  ('ECON', 'अर्थशास्त्र', true),
  ('OMATH', 'ऐच्छिक गणित', true)
ON CONFLICT (subject_code) DO UPDATE
SET name_ne = EXCLUDED.name_ne,
    is_active = true;

-- Academic sessions 2082–2085. Month boundaries use the corresponding AD
-- start date; each end date is the day before the following BS month starts.
INSERT INTO public.academic_months
  (code, session_year, month_number, name_ne, ad_start_date, ad_end_date)
VALUES
  ('2083-01', 2083, 1, 'बैशाख २०८३', '2026-04-14', '2026-05-14'),
  ('2083-02', 2083, 2, 'जेठ २०८३', '2026-05-15', '2026-06-14'),
  ('2083-03', 2083, 3, 'असार २०८३', '2026-06-15', '2026-07-16'),
  ('2083-04', 2083, 4, 'साउन २०८३', '2026-07-17', '2026-08-16'),
  ('2083-05', 2083, 5, 'भदौ २०८३', '2026-08-17', '2026-09-16'),
  ('2083-06', 2083, 6, 'असोज २०८३', '2026-09-17', '2026-10-17'),
  ('2083-07', 2083, 7, 'कार्तिक २०८३', '2026-10-18', '2026-11-16'),
  ('2083-08', 2083, 8, 'मंसिर २०८३', '2026-11-17', '2026-12-15'),
  ('2083-09', 2083, 9, 'पुष २०८३', '2026-12-16', '2027-01-14'),
  ('2083-10', 2083, 10, 'माघ २०८३', '2027-01-15', '2027-02-12'),
  ('2083-11', 2083, 11, 'फागुन २०८३', '2027-02-13', '2027-03-14'),
  ('2083-12', 2083, 12, 'चैत २०८३', '2027-03-15', '2027-04-13'),

  ('2084-01', 2084, 1, 'बैशाख २०८४', '2027-04-14', '2027-05-14'),
  ('2084-02', 2084, 2, 'जेठ २०८४', '2027-05-15', '2027-06-14'),
  ('2084-03', 2084, 3, 'असार २०८४', '2027-06-15', '2027-07-16'),
  ('2084-04', 2084, 4, 'साउन २०८४', '2027-07-17', '2027-08-16'),
  ('2084-05', 2084, 5, 'भदौ २०८४', '2027-08-17', '2027-09-16'),
  ('2084-06', 2084, 6, 'असोज २०८४', '2027-09-17', '2027-10-16'),
  ('2084-07', 2084, 7, 'कार्तिक २०८४', '2027-10-17', '2027-11-15'),
  ('2084-08', 2084, 8, 'मंसिर २०८४', '2027-11-16', '2027-12-15'),
  ('2084-09', 2084, 9, 'पुष २०८४', '2027-12-16', '2028-01-13'),
  ('2084-10', 2084, 10, 'माघ २०८४', '2028-01-14', '2028-02-12'),
  ('2084-11', 2084, 11, 'फागुन २०८४', '2028-02-13', '2028-03-13'),
  ('2084-12', 2084, 12, 'चैत २०८४', '2028-03-14', '2028-04-12'),

  ('2085-01', 2085, 1, 'बैशाख २०८५', '2028-04-13', '2028-05-13'),
  ('2085-02', 2085, 2, 'जेठ २०८५', '2028-05-14', '2028-06-14'),
  ('2085-03', 2085, 3, 'असार २०८५', '2028-06-15', '2028-07-15'),
  ('2085-04', 2085, 4, 'साउन २०८५', '2028-07-16', '2028-08-16'),
  ('2085-05', 2085, 5, 'भदौ २०८५', '2028-08-17', '2028-09-15'),
  ('2085-06', 2085, 6, 'असोज २०८५', '2028-09-16', '2028-10-16'),
  ('2085-07', 2085, 7, 'कार्तिक २०८५', '2028-10-17', '2028-11-15'),
  ('2085-08', 2085, 8, 'मंसिर २०८५', '2028-11-16', '2028-12-15'),
  ('2085-09', 2085, 9, 'पुष २०८५', '2028-12-16', '2029-01-13'),
  ('2085-10', 2085, 10, 'माघ २०८५', '2029-01-14', '2029-02-12'),
  ('2085-11', 2085, 11, 'फागुन २०८५', '2029-02-13', '2029-03-14'),
  ('2085-12', 2085, 12, 'चैत २०८५', '2029-03-15', '2029-04-13')
ON CONFLICT (code) DO UPDATE
SET session_year = EXCLUDED.session_year,
    month_number = EXCLUDED.month_number,
    name_ne = EXCLUDED.name_ne,
    ad_start_date = EXCLUDED.ad_start_date,
    ad_end_date = EXCLUDED.ad_end_date;

COMMIT;
