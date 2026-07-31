BEGIN;

-- Delete exactly one monthly response through a narrow admin-only function.
-- Applying this migration does not change existing response records.
CREATE OR REPLACE FUNCTION public.delete_monthly_report(
  p_report_type text,
  p_report_id bigint
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted integer;
BEGIN
  IF NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  CASE p_report_type
    WHEN 'subject' THEN
      DELETE FROM public.subject_monthly_reports WHERE id = p_report_id;
    WHEN 'class' THEN
      DELETE FROM public.class_monthly_reports WHERE id = p_report_id;
    WHEN 'incharge' THEN
      DELETE FROM public.incharge_monthly_reports WHERE id = p_report_id;
    ELSE
      RAISE EXCEPTION 'Unknown report type';
  END CASE;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_monthly_report(text, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_monthly_report(text, bigint) TO authenticated;

COMMIT;
