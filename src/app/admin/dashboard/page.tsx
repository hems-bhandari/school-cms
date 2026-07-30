'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3, BookOpen, ChevronDown, ClipboardList, Database, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { createClient } from '@/lib/supabase-client'
import { reportDefinitions, type ReportField } from '@/lib/monthly-report-forms'

type Row = Record<string, unknown>
type DashboardData = {
  metrics: Record<string, Row[]>
  subjectReports: Row[]
  classReports: Row[]
  inchargeReports: Row[]
  teachers: Row[]
  classes: Row[]
  subjects: Row[]
  assignments: Row[]
  accessCodes: Row[]
}

const initialData: DashboardData = { metrics: {}, subjectReports: [], classReports: [], inchargeReports: [], teachers: [], classes: [], subjects: [], assignments: [], accessCodes: [] }

const metricDefinitions = [
  { key: 'attendance', source: 'kpi_attendance_by_class_gender', title: 'उपस्थिति दर', description: 'कक्षा र लिङ्ग अनुसार', columns: [['month_code', 'महिना'], ['class_name', 'कक्षा'], ['boys_pct', 'छात्र %'], ['girls_pct', 'छात्रा %']] },
  { key: 'periods', source: 'kpi_period_delivery_by_teacher', title: 'घण्टी डेलिभरी दर', description: 'शिक्षक अनुसार', columns: [['month_code', 'महिना'], ['teacher_name', 'शिक्षक'], ['taught_periods', 'पढाइएको'], ['scheduled_periods', 'हुनुपर्ने'], ['delivery_pct', 'दर %']] },
  { key: 'course', source: 'kpi_course_progress_by_subject', title: 'कोर्ष प्रगति vs योजना', description: 'विषय अनुसार', columns: [['month_code', 'महिना'], ['subject_name', 'विषय'], ['completed_pct', 'प्रगति %'], ['planned_pct', 'योजना %'], ['variance_pct', 'अन्तर']] },
  { key: 'homework', source: 'kpi_homework_feedback_by_teacher', title: 'गृहकार्य पृष्ठपोषण', description: 'शिक्षक अनुसार', columns: [['month_code', 'महिना'], ['teacher_name', 'शिक्षक'], ['returned_count', 'फिर्ता'], ['assigned_count', 'दिइएको'], ['feedback_pct', 'दर %']] },
  { key: 'assessment', source: 'kpi_assessment_by_class_subject', title: 'औसत र उत्तीर्ण दर', description: 'कक्षा × विषय', columns: [['month_code', 'महिना'], ['class_name', 'कक्षा'], ['subject_name', 'विषय'], ['average_pct', 'औसत %'], ['pass_pct', 'उत्तीर्ण %'], ['at_risk_pct', 'जोखिम %']] },
  { key: 'target', source: 'kpi_target_vs_actual', title: 'लक्ष्य vs वास्तविक', description: 'परीक्षा नतिजा अन्तर', columns: [['month_code', 'महिना'], ['class_name', 'कक्षा'], ['subject_name', 'विषय'], ['target_pct', 'लक्ष्य %'], ['actual_pct', 'वास्तविक %'], ['variance_pct', 'अन्तर']] },
  { key: 'observations', source: 'kpi_observations_by_coordinator', title: 'कक्षा अवलोकन', description: 'सयोजक अनुसार', columns: [['month_code', 'महिना'], ['coordinator_name', 'सयोजक'], ['level', 'तह'], ['observation_count', 'अवलोकन']] },
  { key: 'followup', source: 'kpi_student_followup', title: 'Dropout र अनुपस्थिति follow-up', description: 'कक्षा अनुसार closure', columns: [['month_code', 'महिना'], ['class_name', 'कक्षा'], ['dropout_count', 'Dropout'], ['chronic_absentee_count', 'नियमित अनुपस्थित'], ['followup_closure_pct', 'Closure %']] },
] as const

function collectLabels(fields: ReportField[], target: Record<string, string>) {
  for (const field of fields) {
    target[field.key] = field.label
    if (field.fields) collectLabels(field.fields, target)
  }
}

const fieldLabels: Record<string, string> = {}
Object.values(reportDefinitions).forEach((definition) => definition.sections.forEach((section) => collectLabels(section.fields, fieldLabels)))

function displayValue(value: unknown, key: string, lookups: { teachers: Map<string, string>; classes: Map<string, string>; subjects: Map<string, string> }): string {
  if (value === null || value === undefined || value === '') return '—'
  if (key.includes('teacher_id')) return lookups.teachers.get(String(value)) || String(value)
  if (key === 'class_id') return lookups.classes.get(String(value)) || String(value)
  if (key === 'subject_id') return lookups.subjects.get(String(value)) || String(value)
  if (Array.isArray(value)) return value.map((item) => typeof item === 'object' ? Object.entries(item as Row).map(([childKey, childValue]) => `${fieldLabels[childKey] || childKey}: ${displayValue(childValue, childKey, lookups)}`).join(' · ') : String(item)).join('\n') || '—'
  if (typeof value === 'boolean') return value ? 'हो' : 'होइन'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function ResponseList({ rows, lookups }: { rows: Row[]; lookups: { teachers: Map<string, string>; classes: Map<string, string>; subjects: Map<string, string> } }) {
  if (!rows.length) return <p className="report-dashboard__empty">यस छनोटमा प्रतिवेदन छैन।</p>
  return <div className="response-list">{rows.map((row) => {
    const payload = (row.payload || {}) as Row
    const teacher = lookups.teachers.get(String(row.teacher_id)) || `Teacher #${row.teacher_id}`
    return <details className="response-item" key={String(row.id)}><summary><span><strong>{teacher}</strong><small>{String(row.month_code)} · {new Date(String(row.submitted_at)).toLocaleDateString()}</small></span><ChevronDown aria-hidden="true" /></summary><dl>{Object.entries(payload).filter(([key]) => key !== 'teacher_code').map(([key, value]) => <div key={key}><dt>{fieldLabels[key] || key}</dt><dd>{displayValue(value, key, lookups)}</dd></div>)}</dl></details>
  })}</div>
}

function MasterSetup({ data, reload }: { data: DashboardData; reload: () => Promise<void> }) {
  const [newClass, setNewClass] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newTeacher, setNewTeacher] = useState('')
  const [message, setMessage] = useState('')

  const updateClassTeacher = async (classId: unknown, teacherId: string) => {
    const { error } = await createClient().from('school_classes').update({ class_teacher_id: teacherId ? Number(teacherId) : null }).eq('id', classId)
    setMessage(error ? error.message : 'कक्षा शिक्षक अद्यावधिक भयो।')
    if (!error) await reload()
  }

  const updateTeacherLevel = async (teacherId: unknown, level: string) => {
    const { error } = await createClient().from('teachers').update({ report_level: level || null }).eq('id', teacherId)
    setMessage(error ? error.message : 'शिक्षक तह अद्यावधिक भयो।')
    if (!error) await reload()
  }

  const updateTeacherCode = async (teacherId: unknown, teacherCode: string) => {
    const current = data.accessCodes.find((item) => item.teacher_id === teacherId)
    if (!teacherCode.trim() || teacherCode.trim() === current?.teacher_code) return
    const { error } = await createClient().from('teacher_report_access').update({ teacher_code: teacherCode.trim().toUpperCase() }).eq('teacher_id', teacherId)
    setMessage(error ? error.message : 'शिक्षक ID अद्यावधिक भयो।')
    if (!error) await reload()
  }

  const addAssignment = async () => {
    if (!newClass || !newSubject || !newTeacher) { setMessage('कक्षा, विषय र शिक्षक तीनै छान्नुहोस्।'); return }
    const { error } = await createClient().from('class_subject').insert({ class_id: Number(newClass), subject_id: Number(newSubject), teacher_id: Number(newTeacher) })
    setMessage(error ? error.message : 'class_subject assignment थपियो।')
    if (!error) { setNewClass(''); setNewSubject(''); setNewTeacher(''); await reload() }
  }

  const removeAssignment = async (id: unknown) => {
    const { error } = await createClient().from('class_subject').delete().eq('id', id)
    setMessage(error ? error.message : 'Assignment हटाइयो।')
    if (!error) await reload()
  }

  const teacherName = (id: unknown) => String(data.teachers.find((item) => item.id === id)?.name_ne || '—')
  const className = (id: unknown) => String(data.classes.find((item) => item.id === id)?.name_ne || '—')
  const subjectName = (id: unknown) => String(data.subjects.find((item) => item.id === id)?.name_ne || '—')

  return <div className="master-setup">
    {message && <p className="master-setup__message">{message}</p>}
    <div className="master-table"><h3>शिक्षक master list र report ID</h3><p>तह छान्नुहोस् र official शिक्षक ID चाहियो भने generated ID बदल्नुहोस्। ID field बाट बाहिर निस्कँदा सुरक्षित हुन्छ।</p><table><thead><tr><th>शिक्षक</th><th>पद</th><th>तह</th><th>शिक्षक ID</th></tr></thead><tbody>{data.teachers.map((teacher) => { const access = data.accessCodes.find((item) => item.teacher_id === teacher.id); return <tr key={String(teacher.id)}><td>{String(teacher.name_ne)}</td><td>{String(teacher.position_ne)}</td><td><select value={String(teacher.report_level || '')} onChange={(event) => updateTeacherLevel(teacher.id, event.target.value)}><option value="">छान्नुहोस्</option><option value="आधारभूत">आधारभूत</option><option value="माध्यमिक">माध्यमिक</option></select></td><td><input aria-label={`${teacher.name_ne} शिक्षक ID`} defaultValue={String(access?.teacher_code || '')} onBlur={(event) => updateTeacherCode(teacher.id, event.target.value)} /></td></tr> })}</tbody></table></div>
    <div className="master-table"><h3>कक्षा शिक्षक assignment</h3><p>Form 2 मा कक्षा शिक्षकले आफ्नो कक्षा मात्र देख्ने आधार यही हो।</p><table><thead><tr><th>कक्षा</th><th>तह</th><th>कक्षा शिक्षक</th></tr></thead><tbody>{data.classes.map((schoolClass) => <tr key={String(schoolClass.id)}><td>{String(schoolClass.name_ne)}</td><td>{String(schoolClass.level)}</td><td><select value={String(schoolClass.class_teacher_id || '')} onChange={(event) => updateClassTeacher(schoolClass.id, event.target.value)}><option value="">छान्नुहोस्</option>{data.teachers.map((teacher) => <option key={String(teacher.id)} value={String(teacher.id)}>{String(teacher.name_ne)}</option>)}</select></td></tr>)}</tbody></table></div>
    <div className="master-table"><h3>कक्षा × विषय × शिक्षक assignment</h3><p>Form 1 का dropdown र expected submission count यही सूचीले चलाउँछ।</p><div className="master-assignment-add"><select aria-label="कक्षा" value={newClass} onChange={(event) => setNewClass(event.target.value)}><option value="">कक्षा</option>{data.classes.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name_ne)}</option>)}</select><select aria-label="विषय" value={newSubject} onChange={(event) => setNewSubject(event.target.value)}><option value="">विषय</option>{data.subjects.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name_ne)}</option>)}</select><select aria-label="शिक्षक" value={newTeacher} onChange={(event) => setNewTeacher(event.target.value)}><option value="">शिक्षक</option>{data.teachers.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name_ne)}</option>)}</select><button type="button" onClick={addAssignment}><Plus /> थप्नुहोस्</button></div><table><thead><tr><th>कक्षा</th><th>विषय</th><th>शिक्षक</th><th /></tr></thead><tbody>{data.assignments.length ? data.assignments.map((assignment) => <tr key={String(assignment.id)}><td>{className(assignment.class_id)}</td><td>{subjectName(assignment.subject_id)}</td><td>{teacherName(assignment.teacher_id)}</td><td><button className="master-delete" type="button" aria-label="Assignment हटाउनुहोस्" onClick={() => removeAssignment(assignment.id)}><Trash2 /></button></td></tr>) : <tr><td colSpan={4}>Assignment थपिएको छैन।</td></tr>}</tbody></table></div>
  </div>
}

export default function ReportingDashboard() {
  const [data, setData] = useState<DashboardData>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [month, setMonth] = useState('all')
  const [responseType, setResponseType] = useState<'subject' | 'class' | 'incharge'>('subject')

  async function loadDashboard() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const metricResults = await Promise.all(metricDefinitions.map((metric) => supabase.from(metric.source).select('*').order('month_code', { ascending: false })))
    const [subjectReports, classReports, inchargeReports, teachers, classes, subjects, assignments, accessCodes] = await Promise.all([
      supabase.from('subject_monthly_reports').select('*').order('submitted_at', { ascending: false }),
      supabase.from('class_monthly_reports').select('*').order('submitted_at', { ascending: false }),
      supabase.from('incharge_monthly_reports').select('*').order('submitted_at', { ascending: false }),
      supabase.from('teachers').select('id, name_ne, position_ne, report_level').order('display_order'),
      supabase.from('school_classes').select('id, name_ne, level, class_teacher_id').order('grade_number'),
      supabase.from('school_subjects').select('id, subject_code, name_ne').order('id'),
      supabase.from('class_subject').select('id, class_id, subject_id, teacher_id').eq('is_active', true),
      supabase.from('teacher_report_access').select('teacher_id, teacher_code').order('teacher_id'),
    ])
    const allResults = [...metricResults, subjectReports, classReports, inchargeReports, teachers, classes, subjects, assignments, accessCodes]
    const firstError = allResults.find((result) => result.error)?.error
    if (firstError) setError(`Dashboard data लोड भएन: ${firstError.message}`)
    else setData({
      metrics: Object.fromEntries(metricDefinitions.map((metric, index) => [metric.key, (metricResults[index].data || []) as Row[]])),
      subjectReports: (subjectReports.data || []) as Row[], classReports: (classReports.data || []) as Row[], inchargeReports: (inchargeReports.data || []) as Row[],
      teachers: (teachers.data || []) as Row[], classes: (classes.data || []) as Row[], subjects: (subjects.data || []) as Row[], assignments: (assignments.data || []) as Row[], accessCodes: (accessCodes.data || []) as Row[],
    })
    setLoading(false)
  }

  useEffect(() => { loadDashboard() }, [])

  const months = useMemo(() => [...new Set([...data.subjectReports, ...data.classReports, ...data.inchargeReports].map((row) => String(row.month_code)))].sort().reverse(), [data])
  const filterRows = (rows: Row[]) => month === 'all' ? rows : rows.filter((row) => row.month_code === month)
  const lookups = useMemo(() => ({
    teachers: new Map(data.teachers.map((row) => [String(row.id), String(row.name_ne)])),
    classes: new Map(data.classes.map((row) => [String(row.id), String(row.name_ne)])),
    subjects: new Map(data.subjects.map((row) => [String(row.id), String(row.name_ne)])),
  }), [data])
  const reportRows = responseType === 'subject' ? data.subjectReports : responseType === 'class' ? data.classReports : data.inchargeReports

  return <div className="admin-dashboard report-dashboard"><Navigation /><header className="admin-dashboard__header"><div className="admin-dashboard__shell report-dashboard__header"><div><Link href="/admin"><ArrowLeft /> प्रशासन</Link><p><BarChart3 /> शैक्षिक अनुगमन</p><h1>मासिक प्रतिवेदन Dashboard</h1><span>आठ मुख्य KPI, मूल प्रतिवेदन र master data एउटै ठाउँमा।</span></div><div className="report-dashboard__filter"><label htmlFor="dashboard-month">महिना</label><select id="dashboard-month" value={month} onChange={(event) => setMonth(event.target.value)}><option value="all">सबै महिना</option>{months.map((item) => <option value={item} key={item}>{item}</option>)}</select><button type="button" onClick={loadDashboard}><RefreshCw /> ताजा गर्नुहोस्</button></div></div></header><main className="admin-dashboard__shell report-dashboard__content">
    {loading && <div className="admin-dashboard__loading"><span className="admin-dashboard__spinner" /><p>Dashboard लोड हुँदैछ…</p></div>}
    {error && <div className="report-notice report-notice--error"><div><strong>डेटा उपलब्ध भएन</strong><span>{error}</span><span>Supabase मा migration 13 लागू भएको जाँच गर्नुहोस्।</span></div></div>}
    {!loading && !error && <>
      <section><div className="admin-section-heading"><div><p>KPI views</p><h2>मुख्य मासिक सूचकहरू</h2></div><span className="report-dashboard__count">८ views</span></div><div className="metric-grid">{metricDefinitions.map((metric) => { const rows = filterRows(data.metrics[metric.key] || []); return <article className="metric-card" key={metric.key}><header><div><h3>{metric.title}</h3><p>{metric.description}</p></div><strong>{rows.length}</strong></header><div className="metric-table-wrap"><table><thead><tr>{metric.columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.length ? rows.slice(0, 12).map((row, index) => <tr key={index}>{metric.columns.map(([key]) => <td key={key}>{row[key] === null ? '—' : String(row[key] ?? '—')}</td>)}</tr>) : <tr><td colSpan={metric.columns.length}>डेटा छैन</td></tr>}</tbody></table></div></article> })}</div></section>
      <section className="report-dashboard__section"><div className="admin-section-heading"><div><p>Responses</p><h2>बुझाइएका प्रतिवेदन</h2></div></div><div className="response-tabs">{([['subject', 'विषय शिक्षक', data.subjectReports.length], ['class', 'कक्षा शिक्षक', data.classReports.length], ['incharge', 'तह सयोजक', data.inchargeReports.length]] as const).map(([key, label, count]) => <button type="button" className={responseType === key ? 'is-active' : ''} onClick={() => setResponseType(key)} key={key}>{label}<span>{count}</span></button>)}</div><ResponseList rows={filterRows(reportRows)} lookups={lookups} /></section>
      <section className="report-dashboard__section"><div className="admin-section-heading"><div><p>Master data</p><h2>Fixed list तयारी</h2></div></div><div className="master-summary"><article><BookOpen /><span><strong>{data.teachers.length}</strong> शिक्षक</span></article><article><ClipboardList /><span><strong>{data.classes.length}</strong> कक्षा</span></article><article><Database /><span><strong>{data.subjects.length}</strong> विषय</span></article><article><Database /><span><strong>{data.assignments.length}</strong> class_subject assignment</span></article></div><MasterSetup data={data} reload={loadDashboard} /></section>
    </>}
  </main></div>
}
