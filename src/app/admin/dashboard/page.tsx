'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3, BookOpen, ChevronDown, ClipboardList, Database, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
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
  const [message, setMessage] = useState('')
  const [assignmentTeacher, setAssignmentTeacher] = useState('')
  const [gradeToAdd, setGradeToAdd] = useState('')
  const [assignmentDraft, setAssignmentDraft] = useState<Record<string, string[]>>({})
  const [assignmentDirty, setAssignmentDirty] = useState(false)
  const [savingAssignments, setSavingAssignments] = useState(false)

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

  const draftForTeacher = (teacherId: string) => {
    const draft: Record<string, string[]> = {}
    data.assignments.filter((item) => String(item.teacher_id) === teacherId).forEach((item) => {
      const classId = String(item.class_id)
      draft[classId] = [...(draft[classId] || []), String(item.subject_id)]
    })
    return draft
  }

  const selectAssignmentTeacher = (teacherId: string) => {
    if (assignmentDirty && !window.confirm('सुरक्षित नगरेका assignment परिवर्तन हटाउने?')) return
    setAssignmentTeacher(teacherId)
    setAssignmentDraft(teacherId ? draftForTeacher(teacherId) : {})
    setGradeToAdd('')
    setAssignmentDirty(false)
    setMessage('')
  }

  const addGrade = () => {
    if (!gradeToAdd) return
    setAssignmentDraft((current) => ({ ...current, [gradeToAdd]: [] }))
    setGradeToAdd('')
    setAssignmentDirty(true)
  }

  const removeGrade = (classId: string) => {
    setAssignmentDraft((current) => {
      const next = { ...current }
      delete next[classId]
      return next
    })
    setAssignmentDirty(true)
  }

  const toggleSubject = (classId: string, subjectId: string) => {
    setAssignmentDraft((current) => {
      const selected = current[classId] || []
      return { ...current, [classId]: selected.includes(subjectId) ? selected.filter((item) => item !== subjectId) : [...selected, subjectId] }
    })
    setAssignmentDirty(true)
  }

  const saveAssignments = async () => {
    const incomplete = Object.values(assignmentDraft).some((subjects) => subjects.length === 0)
    if (!assignmentTeacher || incomplete) {
      setMessage(incomplete ? 'प्रत्येक थपिएको कक्षामा कम्तीमा एउटा विषय छान्नुहोस् वा कक्षा हटाउनुहोस्।' : 'पहिले शिक्षक छान्नुहोस्।')
      return
    }
    const assignments = Object.entries(assignmentDraft).flatMap(([classId, subjectIds]) => subjectIds.map((subjectId) => ({ class_id: Number(classId), subject_id: Number(subjectId) })))
    setSavingAssignments(true)
    const { error } = await createClient().rpc('save_teacher_assignments', { p_teacher_id: Number(assignmentTeacher), p_assignments: assignments })
    setSavingAssignments(false)
    if (error) {
      setMessage(error.message)
      return
    }
    setAssignmentDirty(false)
    setMessage('शिक्षकको कक्षा र विषय assignment सुरक्षित भयो।')
    await reload()
  }

  const assignedClassIds = Object.keys(assignmentDraft)
  const availableClasses = data.classes.filter((item) => !assignedClassIds.includes(String(item.id)))
  const selectedTeacher = data.teachers.find((item) => String(item.id) === assignmentTeacher)
  const selectedSubjectCount = Object.values(assignmentDraft).reduce((total, subjects) => total + subjects.length, 0)
  const hasIncompleteGrade = Object.values(assignmentDraft).some((subjects) => subjects.length === 0)

  return <div className="master-setup">
    {message && <p className="master-setup__message">{message}</p>}
    <div className="master-table"><h3>शिक्षक master list र report ID</h3><p>तह छान्नुहोस् र official शिक्षक ID चाहियो भने generated ID बदल्नुहोस्। ID field बाट बाहिर निस्कँदा सुरक्षित हुन्छ।</p><table><thead><tr><th>शिक्षक</th><th>पद</th><th>तह</th><th>शिक्षक ID</th></tr></thead><tbody>{data.teachers.map((teacher) => { const access = data.accessCodes.find((item) => item.teacher_id === teacher.id); return <tr key={String(teacher.id)}><td>{String(teacher.name_ne)}</td><td>{String(teacher.position_ne)}</td><td><select value={String(teacher.report_level || '')} onChange={(event) => updateTeacherLevel(teacher.id, event.target.value)}><option value="">छान्नुहोस्</option><option value="आधारभूत">आधारभूत</option><option value="माध्यमिक">माध्यमिक</option></select></td><td><input aria-label={`${teacher.name_ne} शिक्षक ID`} defaultValue={String(access?.teacher_code || '')} onBlur={(event) => updateTeacherCode(teacher.id, event.target.value)} /></td></tr> })}</tbody></table></div>
    <div className="master-table"><h3>कक्षा शिक्षक assignment</h3><p>Form 2 मा कक्षा शिक्षकले आफ्नो कक्षा मात्र देख्ने आधार यही हो।</p><table><thead><tr><th>कक्षा</th><th>तह</th><th>कक्षा शिक्षक</th></tr></thead><tbody>{data.classes.map((schoolClass) => <tr key={String(schoolClass.id)}><td>{String(schoolClass.name_ne)}</td><td>{String(schoolClass.level)}</td><td><select value={String(schoolClass.class_teacher_id || '')} onChange={(event) => updateClassTeacher(schoolClass.id, event.target.value)}><option value="">छान्नुहोस्</option>{data.teachers.map((teacher) => <option key={String(teacher.id)} value={String(teacher.id)}>{String(teacher.name_ne)}</option>)}</select></td></tr>)}</tbody></table></div>
    <div className="master-table assignment-editor"><h3>विषय शिक्षक assignment</h3><p>शिक्षक छान्नुहोस्, त्यस शिक्षकले पढाउने कक्षा थप्नुहोस्, र प्रत्येक कक्षाका विषयहरू छान्नुहोस्। एउटै शिक्षकका सबै परिवर्तन एकैपटक सुरक्षित हुन्छन्।</p>
      <div className="assignment-editor__teacher">
        <label htmlFor="assignment-teacher">१. शिक्षक छान्नुहोस्</label>
        <select id="assignment-teacher" value={assignmentTeacher} onChange={(event) => selectAssignmentTeacher(event.target.value)}><option value="">शिक्षक छान्नुहोस्</option>{data.teachers.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name_ne)} — {String(item.position_ne)}</option>)}</select>
        {selectedTeacher && <div className="assignment-editor__summary"><strong>{String(selectedTeacher.name_ne)}</strong><span>{assignedClassIds.length} कक्षा · {selectedSubjectCount} विषय assignment</span>{assignmentDirty && <em>सुरक्षित गरिएको छैन</em>}</div>}
      </div>
      {assignmentTeacher && <>
        <div className="assignment-editor__add-grade"><div><label htmlFor="assignment-grade">२. अर्को कक्षा थप्नुहोस्</label><span>शिक्षकले पढाउने प्रत्येक कक्षा एकपटक थप्नुहोस्।</span></div><select id="assignment-grade" value={gradeToAdd} onChange={(event) => setGradeToAdd(event.target.value)}><option value="">कक्षा छान्नुहोस्</option>{availableClasses.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name_ne)} · {String(item.level)}</option>)}</select><button type="button" onClick={addGrade} disabled={!gradeToAdd}><Plus /> कक्षा थप्नुहोस्</button></div>
        {assignedClassIds.length ? <div className="assignment-grade-grid">{assignedClassIds.map((classId) => { const schoolClass = data.classes.find((item) => String(item.id) === classId); const selectedSubjects = assignmentDraft[classId] || []; return <article className="assignment-grade-card" key={classId}><header><div><small>{String(schoolClass?.level || '')}</small><h4>{String(schoolClass?.name_ne || classId)}</h4><span>{selectedSubjects.length} विषय छानिएको</span></div><button type="button" onClick={() => removeGrade(classId)} aria-label={`${schoolClass?.name_ne || 'कक्षा'} हटाउनुहोस्`}><Trash2 /></button></header><div className="assignment-subjects"><p>३. यो कक्षाका विषय छान्नुहोस्</p>{data.subjects.map((subject) => { const subjectId = String(subject.id); const checked = selectedSubjects.includes(subjectId); return <label className={checked ? 'is-selected' : ''} key={subjectId}><input type="checkbox" checked={checked} onChange={() => toggleSubject(classId, subjectId)} /><span>{String(subject.name_ne)}</span></label> })}</div></article> })}</div> : <div className="assignment-editor__empty"><BookOpen /><strong>यस शिक्षकका लागि कक्षा थपिएको छैन</strong><span>माथिको dropdown बाट पहिलो कक्षा छान्नुहोस्।</span></div>}
        <div className="assignment-editor__save"><div>{hasIncompleteGrade ? <span className="is-warning">विषय नछानिएको कक्षा छ।</span> : <span>{assignedClassIds.length} कक्षामा {selectedSubjectCount} assignment सुरक्षित हुनेछ।</span>}</div><button type="button" onClick={saveAssignments} disabled={!assignmentDirty || savingAssignments || hasIncompleteGrade}><Save />{savingAssignments ? 'सुरक्षित हुँदैछ…' : 'सबै परिवर्तन सुरक्षित गर्नुहोस्'}</button></div>
      </>}
    </div>
  </div>
}

export default function ReportingDashboard() {
  const [data, setData] = useState<DashboardData>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [month, setMonth] = useState('all')
  const [responseType, setResponseType] = useState<'subject' | 'class' | 'incharge'>('subject')

  async function loadDashboard(showLoader = true) {
    if (showLoader) setLoading(true)
    setError('')
    const supabase = createClient()
    const metricResults = await Promise.all(metricDefinitions.map((metric) => supabase.from(metric.source).select('*').order('month_code', { ascending: false })))
    const [subjectReports, classReports, inchargeReports, teachers, classes, subjects, assignments, accessCodes] = await Promise.all([
      supabase.from('subject_monthly_reports').select('*').order('submitted_at', { ascending: false }),
      supabase.from('class_monthly_reports').select('*').order('submitted_at', { ascending: false }),
      supabase.from('incharge_monthly_reports').select('*').order('submitted_at', { ascending: false }),
      supabase.from('teachers').select('id, name_ne, position_ne, report_level, is_academic').eq('is_active', true).eq('is_academic', true).order('display_order'),
      supabase.from('school_classes').select('id, name_ne, level, class_teacher_id').eq('is_active', true).order('grade_number'),
      supabase.from('school_subjects').select('id, subject_code, name_ne').eq('is_active', true).order('id'),
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
    if (showLoader) setLoading(false)
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

  return <div className="admin-dashboard report-dashboard"><Navigation /><header className="admin-dashboard__header"><div className="admin-dashboard__shell report-dashboard__header"><div><Link href="/admin"><ArrowLeft /> प्रशासन</Link><p><BarChart3 /> शैक्षिक अनुगमन</p><h1>मासिक प्रतिवेदन Dashboard</h1><span>आठ मुख्य KPI, मूल प्रतिवेदन र master data एउटै ठाउँमा।</span></div><div className="report-dashboard__filter"><label htmlFor="dashboard-month">महिना</label><select id="dashboard-month" value={month} onChange={(event) => setMonth(event.target.value)}><option value="all">सबै महिना</option>{months.map((item) => <option value={item} key={item}>{item}</option>)}</select><button type="button" onClick={() => loadDashboard()}><RefreshCw /> ताजा गर्नुहोस्</button></div></div></header><main className="admin-dashboard__shell report-dashboard__content">
    {loading && <div className="admin-dashboard__loading"><span className="admin-dashboard__spinner" /><p>Dashboard लोड हुँदैछ…</p></div>}
    {error && <div className="report-notice report-notice--error"><div><strong>डेटा उपलब्ध भएन</strong><span>{error}</span><span>Supabase मा migration 13 लागू भएको जाँच गर्नुहोस्।</span></div></div>}
    {!loading && !error && <>
      <section><div className="admin-section-heading"><div><p>KPI views</p><h2>मुख्य मासिक सूचकहरू</h2></div><span className="report-dashboard__count">८ views</span></div><div className="metric-grid">{metricDefinitions.map((metric) => { const rows = filterRows(data.metrics[metric.key] || []); return <article className="metric-card" key={metric.key}><header><div><h3>{metric.title}</h3><p>{metric.description}</p></div><strong>{rows.length}</strong></header><div className="metric-table-wrap"><table><thead><tr>{metric.columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.length ? rows.slice(0, 12).map((row, index) => <tr key={index}>{metric.columns.map(([key]) => <td key={key}>{row[key] === null ? '—' : String(row[key] ?? '—')}</td>)}</tr>) : <tr><td colSpan={metric.columns.length}>डेटा छैन</td></tr>}</tbody></table></div></article> })}</div></section>
      <section className="report-dashboard__section"><div className="admin-section-heading"><div><p>Responses</p><h2>बुझाइएका प्रतिवेदन</h2></div></div><div className="response-tabs">{([['subject', 'विषय शिक्षक', data.subjectReports.length], ['class', 'कक्षा शिक्षक', data.classReports.length], ['incharge', 'तह सयोजक', data.inchargeReports.length]] as const).map(([key, label, count]) => <button type="button" className={responseType === key ? 'is-active' : ''} onClick={() => setResponseType(key)} key={key}>{label}<span>{count}</span></button>)}</div><ResponseList rows={filterRows(reportRows)} lookups={lookups} /></section>
      <section className="report-dashboard__section"><div className="admin-section-heading"><div><p>Master data</p><h2>Fixed list तयारी</h2></div></div><div className="master-summary"><article><BookOpen /><span><strong>{data.teachers.length}</strong> शिक्षक</span></article><article><ClipboardList /><span><strong>{data.classes.length}</strong> कक्षा</span></article><article><Database /><span><strong>{data.subjects.length}</strong> विषय</span></article><article><Database /><span><strong>{data.assignments.length}</strong> class_subject assignment</span></article></div><MasterSetup data={data} reload={() => loadDashboard(false)} /></section>
    </>}
  </main></div>
}
