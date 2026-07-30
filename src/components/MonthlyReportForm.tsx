'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, CheckCircle2, Plus, Save, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { reportDefinitions, type FieldSource, type ReportField, type ReportKind } from '@/lib/monthly-report-forms'

type Teacher = { id: number; name_ne: string; position_ne: string; report_level: string | null; is_academic: boolean }
type SchoolClass = { id: number; grade_number: number; name_ne: string; level: string; class_teacher_id: number | null }
type Subject = { id: number; subject_code: string; name_ne: string }
type Assignment = { class_id: number; subject_id: number; teacher_id: number }
type AcademicMonth = { code: string; session_year: number; month_number: number; name_ne: string }
type MasterData = { teachers: Teacher[]; classes: SchoolClass[]; subjects: Subject[]; assignments: Assignment[]; months: AcademicMonth[] }

const emptyMasters: MasterData = { teachers: [], classes: [], subjects: [], assignments: [], months: [] }

function numeric(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return '—'
  return `${(numerator * 100 / denominator).toFixed(1)}%`
}

function AutoMetrics({ kind, values, assignments, classes }: { kind: ReportKind; values: Record<string, unknown>; assignments: Assignment[]; classes: SchoolClass[] }) {
  let metrics: Array<[string, string]> = []

  if (kind === 'subject') {
    const appeared = numeric(values.exam_boys) + numeric(values.exam_girls)
    const passed = numeric(values.passed_boys) + numeric(values.passed_girls)
    metrics = [
      ['कोर्ष अन्तर', `${(numeric(values.course_completed) - numeric(values.course_planned)).toFixed(1)} प्रतिशत बिन्दु`],
      ['घण्टी डेलिभरी दर', percent(numeric(values.taught_periods), numeric(values.scheduled_periods))],
      ['गृहकार्य पृष्ठपोषण दर', percent(numeric(values.homework_returned), numeric(values.homework_assigned))],
    ]
    if (values.exam_held === 'भयो') {
      metrics.push(
        ['सम्मिलित', String(appeared)],
        ['उत्तीर्ण दर', percent(passed, appeared)],
        ['औसत प्राप्तांक', percent(numeric(values.total_marks_sum), appeared * numeric(values.full_marks))],
        ['जोखिममा', percent(numeric(values.below_pass_count), appeared)],
      )
    }
  } else if (kind === 'class') {
    const endBoys = numeric(values.start_boys) + numeric(values.new_boys) - numeric(values.left_boys)
    const endGirls = numeric(values.start_girls) + numeric(values.new_girls) - numeric(values.left_girls)
    const days = numeric(values.school_days)
    metrics = [
      ['महिनाको अन्त्य — छात्र', String(endBoys)],
      ['महिनाको अन्त्य — छात्रा', String(endGirls)],
      ['उपस्थिति दर — छात्र', percent(numeric(values.present_boys), endBoys * days)],
      ['उपस्थिति दर — छात्रा', percent(numeric(values.present_girls), endGirls * days)],
    ]
  } else {
    const levelClassIds = new Set(classes.filter((item) => item.level === values.level).map((item) => item.id))
    const expected = assignments.filter((item) => levelClassIds.has(item.class_id)).length
    metrics = [
      ['प्राप्त हुनुपर्ने प्रतिवेदन', String(expected)],
      ['समयमै बुझाएको दर', percent(numeric(values.on_time_reports), expected)],
      ['वैकल्पिक व्यवस्था दर', percent(numeric(values.substituted_periods), numeric(values.vacant_periods))],
      ['कक्षा अवलोकन', `${numeric(values.observation_count)} / न्यूनतम ८`],
    ]
  }

  return (
    <aside className="report-auto-panel" aria-label="स्वतः गणना">
      <div><span>AUTO</span><strong>स्वतः गणना</strong></div>
      <dl>{metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </aside>
  )
}

export function MonthlyReportForm({ kind }: { kind: ReportKind }) {
  const definition = reportDefinitions[kind]
  const [masters, setMasters] = useState<MasterData>(emptyMasters)
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function loadMasters() {
      const supabase = createClient()
      const [teachers, classes, subjects, assignments, months] = await Promise.all([
        supabase.from('teachers').select('id, name_ne, position_ne, report_level, is_academic').eq('is_active', true).eq('is_academic', true).order('display_order'),
        supabase.from('school_classes').select('id, grade_number, name_ne, level, class_teacher_id').eq('is_active', true).order('grade_number'),
        supabase.from('school_subjects').select('id, subject_code, name_ne').eq('is_active', true).order('id'),
        supabase.from('class_subject').select('class_id, subject_id, teacher_id').eq('is_active', true),
        supabase.from('academic_months').select('code, session_year, month_number, name_ne').order('code', { ascending: false }),
      ])
      const error = teachers.error || classes.error || subjects.error || assignments.error || months.error
      if (error) {
        setLoadError('प्रतिवेदनका master lists लोड भएनन्। पहिले Supabase migration 13 लागू भएको निश्चित गर्नुहोस्।')
      } else {
        setMasters({
          teachers: (teachers.data || []) as Teacher[], classes: (classes.data || []) as SchoolClass[],
          subjects: (subjects.data || []) as Subject[], assignments: (assignments.data || []) as Assignment[],
          months: (months.data || []) as AcademicMonth[],
        })
      }
      setLoading(false)
    }
    loadMasters()
  }, [])

  const selectedTeacher = Number(values.teacher_id || 0)
  const selectedClass = Number(values.class_id || 0)
  const selectedSession = Number(values.session_year || 0)

  const optionsFor = (source?: FieldSource, nested = false) => {
    if (!source) return []
    if (source === 'sessions') {
      return [2082, 2083, 2084, 2085].map((year) => ({ value: String(year), label: String(year) }))
    }
    if (source === 'months') {
      return masters.months.filter((month) => month.session_year >= 2082 && month.session_year <= 2085 && (!selectedSession || month.session_year === selectedSession)).map((month) => ({ value: month.code, label: `${month.name_ne} · ${month.code}` }))
    }
    if (source === 'teachers') return masters.teachers.map((teacher) => ({ value: String(teacher.id), label: `${teacher.name_ne} — ${teacher.position_ne}` }))
    if (source === 'classes') {
      let available = masters.classes
      if (!nested && kind === 'subject' && selectedTeacher) {
        const allowed = new Set(masters.assignments.filter((item) => item.teacher_id === selectedTeacher).map((item) => item.class_id))
        available = available.filter((item) => allowed.has(item.id))
      }
      if (!nested && kind === 'class' && selectedTeacher) available = available.filter((item) => item.class_teacher_id === selectedTeacher)
      if (kind === 'incharge' && values.level) available = available.filter((item) => item.level === values.level)
      return available.map((item) => ({ value: String(item.id), label: item.name_ne }))
    }
    if (source === 'subjects') {
      let available = masters.subjects
      if (!nested && kind === 'subject' && selectedTeacher && selectedClass) {
        const allowed = new Set(masters.assignments.filter((item) => item.teacher_id === selectedTeacher && item.class_id === selectedClass).map((item) => item.subject_id))
        available = available.filter((item) => allowed.has(item.id))
      }
      return available.map((item) => ({ value: String(item.id), label: item.name_ne }))
    }
    return []
  }

  const firstMonth = useMemo(() => {
    const selected = masters.months.find((month) => month.code === values.month_code)
    return selected?.month_number === 1
  }, [masters.months, values.month_code])

  const isVisible = (field: ReportField, row?: Record<string, unknown>) => {
    if (!field.condition) return true
    const sourceValues = row || values
    const current = sourceValues[field.condition.key]
    if (field.condition.includes) return Array.isArray(current) && current.includes(field.condition.includes)
    return current === field.condition.value
  }

  const setValue = (key: string, value: unknown) => {
    setSubmitted(false)
    setValues((current) => {
      const next = { ...current, [key]: value }
      if (key === 'session_year') next.month_code = ''
      if (key === 'teacher_id' && (kind === 'subject' || kind === 'class')) {
        next.class_id = ''
        if (kind === 'subject') next.subject_id = ''
      }
      if (key === 'class_id' && kind === 'subject') next.subject_id = ''
      return next
    })
  }

  const setRepeatValue = (groupKey: string, index: number, fieldKey: string, value: unknown) => {
    setValues((current) => {
      const rows = [...((current[groupKey] as Array<Record<string, unknown>>) || [])]
      rows[index] = { ...rows[index], [fieldKey]: value }
      return { ...current, [groupKey]: rows }
    })
  }

  const renderChoices = (field: ReportField, rowValue: Record<string, unknown> | undefined, onChange: (value: unknown) => void, nested = false) => {
    const value = rowValue ? rowValue[field.key] : values[field.key]
    const options = field.source ? optionsFor(field.source, nested) : (field.options || []).map((option) => ({ value: option, label: option }))

    if (field.type === 'select') {
      return (
        <select value={String(value || '')} required={field.required} onChange={(event) => onChange(event.target.value)}>
          <option value="">छान्नुहोस्</option>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      )
    }

    const selected = Array.isArray(value) ? value.map(String) : []
    return (
      <div className="report-checkbox-grid">
        {options.map((option) => (
          <label key={option.value} className="report-check">
            <input type="checkbox" checked={selected.includes(option.value)} onChange={(event) => {
              onChange(event.target.checked ? [...selected, option.value] : selected.filter((item) => item !== option.value))
            }} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    )
  }

  const renderInput = (field: ReportField, row?: Record<string, unknown>, onRowChange?: (key: string, value: unknown) => void, nested = false, inputName = field.key) => {
    const value = row ? row[field.key] : values[field.key]
    const onChange = (next: unknown) => onRowChange ? onRowChange(field.key, next) : setValue(field.key, next)
    if (field.type === 'select' || field.type === 'multiselect') return renderChoices(field, row, onChange, nested)
    if (field.type === 'textarea') return <textarea rows={4} value={String(value || '')} required={field.required} onChange={(event) => onChange(event.target.value)} />
    if (field.type === 'rating') {
      return <div className="report-rating">{[1, 2, 3, 4, 5].map((rating) => <label key={rating} className={Number(value) === rating ? 'is-selected' : ''}><input type="radio" name={inputName} value={rating} checked={Number(value) === rating} required={field.required} onChange={() => onChange(rating)} /><span>{rating}</span></label>)}</div>
    }
    return <input type={field.type === 'number' ? 'number' : field.type} value={String(value || '')} required={field.required} min={field.min} max={field.max} step={field.step || (field.type === 'number' ? 1 : undefined)} onChange={(event) => onChange(event.target.value)} />
  }

  const renderField = (field: ReportField) => {
    if (!isVisible(field)) return null
    if (field.type === 'repeat') {
      const rows = (values[field.key] as Array<Record<string, unknown>>) || []
      return (
        <div className="report-field report-field--wide report-repeat" key={field.key}>
          <div className="report-label-row"><label>{field.label}</label><span>{rows.length}{field.maxRows ? ` / ${field.maxRows}` : ''}</span></div>
          {rows.map((row, index) => (
            <div className="report-repeat-row" key={`${field.key}-${index}`}>
              <div className="report-repeat-row__heading"><strong>{field.label} #{index + 1}</strong><button type="button" onClick={() => setValue(field.key, rows.filter((_, rowIndex) => rowIndex !== index))}><Trash2 aria-hidden="true" /> हटाउनुहोस्</button></div>
              <div className="report-fields-grid">
                {field.fields?.map((subfield) => isVisible(subfield, row) && <div className={`report-field${subfield.type === 'multiselect' || subfield.type === 'textarea' ? ' report-field--wide' : ''}`} key={subfield.key}><label>{subfield.label}{subfield.required && <em>*</em>}</label>{renderInput(subfield, row, (key, next) => setRepeatValue(field.key, index, key, next), true, `${field.key}-${index}-${subfield.key}`)}</div>)}
              </div>
            </div>
          ))}
          {(!field.maxRows || rows.length < field.maxRows) && <button className="report-add-row" type="button" onClick={() => setValue(field.key, [...rows, {}])}><Plus aria-hidden="true" /> अर्को पङ्क्ति थप्नुहोस्</button>}
        </div>
      )
    }
    return <div className={`report-field${field.type === 'multiselect' || field.type === 'textarea' ? ' report-field--wide' : ''}`} key={field.key}><label htmlFor={field.key}>{field.label}{field.required && <em>*</em>}</label>{field.help && <p>{field.help}</p>}{renderInput(field)}</div>
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    const { teacher_code, ...payload } = values
    const supabase = createClient()
    const { error } = await supabase.rpc('submit_monthly_report', {
      p_report_type: kind, p_teacher_code: String(teacher_code || '').trim(), p_payload: payload,
    })
    if (error) {
      const duplicate = error.message.includes('duplicate key')
      setSubmitError(duplicate ? 'यो महिना र छनोटका लागि प्रतिवेदन पहिले नै बुझाइएको छ।' : error.message)
    } else {
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setSubmitting(false)
  }

  if (loading) return <div className="report-state"><span className="admin-dashboard__spinner" /><p>फारम लोड हुँदैछ…</p></div>
  if (loadError) return <div className="report-state report-state--error"><AlertCircle /><p>{loadError}</p><Link href="/forms">फारम सूचीमा फर्कनुहोस्</Link></div>

  return (
    <main className="report-page">
      <div className="report-shell">
        <Link href="/forms" className="report-back"><ArrowLeft aria-hidden="true" /> सबै फारम</Link>
        <header className="report-header">
          <p>{definition.subtitle}</p><h1>{definition.title}</h1><span>{definition.grain}</span>
        </header>
        {submitted && <div className="report-notice report-notice--success"><CheckCircle2 /><div><strong>प्रतिवेदन सुरक्षित भयो।</strong><span>अर्को प्रतिवेदन भर्न चाहनुहुन्छ भने फारम सूचीमा फर्कनुहोस्।</span></div></div>}
        {submitError && <div className="report-notice report-notice--error"><AlertCircle /><div><strong>प्रतिवेदन सुरक्षित भएन।</strong><span>{submitError}</span></div></div>}
        <AutoMetrics kind={kind} values={values} assignments={masters.assignments} classes={masters.classes} />
        <form className="monthly-report-form" onSubmit={handleSubmit}>
          {definition.sections.map((section) => {
            if (section.oncePerSession && values.month_code && !firstMonth) return null
            return <section className="report-section" key={section.title}><div className="report-section__heading"><h2>{section.title}</h2>{section.description && <p>{section.description}</p>}</div><div className="report-fields-grid">{section.fields.map(renderField)}</div></section>
          })}
          <div className="report-submit"><p><strong>*</strong> चिन्ह भएका प्रश्न अनिवार्य छन्। सुरक्षित गरेपछि उही महिना/कक्षा प्रतिवेदन फेरि पठाउन मिल्दैन।</p><button type="submit" disabled={submitting || submitted}><Save aria-hidden="true" />{submitting ? 'सुरक्षित हुँदैछ…' : submitted ? 'प्रतिवेदन सुरक्षित भयो' : 'प्रतिवेदन सुरक्षित गर्नुहोस्'}</button></div>
        </form>
      </div>
    </main>
  )
}
