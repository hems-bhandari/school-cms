BEGIN;

-- Atomically replace one teacher's active class/subject assignment set. This
-- powers the teacher-first editor in the reporting dashboard while preserving
-- inactive rows for historical reports and allowing them to be reactivated.
CREATE OR REPLACE FUNCTION public.save_teacher_assignments(
  p_teacher_id integer,
  p_assignments jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_saved integer;
BEGIN
  IF NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  IF jsonb_typeof(p_assignments) <> 'array' THEN
    RAISE EXCEPTION 'Assignments must be a JSON array';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.teachers
    WHERE id = p_teacher_id AND is_active AND is_academic
  ) THEN
    RAISE EXCEPTION 'Select an active academic teacher';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_assignments) AS requested(class_id smallint, subject_id smallint)
    LEFT JOIN public.school_classes c
      ON c.id = requested.class_id AND c.is_active
    LEFT JOIN public.school_subjects s
      ON s.id = requested.subject_id AND s.is_active
    WHERE c.id IS NULL OR s.id IS NULL
  ) THEN
    RAISE EXCEPTION 'An assignment contains an inactive or unknown class/subject';
  END IF;

  UPDATE public.class_subject
  SET is_active = false
  WHERE teacher_id = p_teacher_id AND is_active;

  INSERT INTO public.class_subject (class_id, subject_id, teacher_id, is_active)
  SELECT DISTINCT requested.class_id, requested.subject_id, p_teacher_id, true
  FROM jsonb_to_recordset(p_assignments) AS requested(class_id smallint, subject_id smallint)
  ON CONFLICT (class_id, subject_id, teacher_id)
  DO UPDATE SET is_active = true;

  GET DIAGNOSTICS v_saved = ROW_COUNT;
  RETURN v_saved;
END;
$$;

REVOKE ALL ON FUNCTION public.save_teacher_assignments(integer, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_teacher_assignments(integer, jsonb) TO authenticated;

COMMIT;
