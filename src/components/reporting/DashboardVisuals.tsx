'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Download, Image as ImageIcon } from 'lucide-react'
import { init, use as registerECharts, type EChartsType } from 'echarts/core'
import type { EChartsOption } from 'echarts'
import { BarChart, FunnelChart, HeatmapChart } from 'echarts/charts'
import { GridComponent, LegendComponent, MarkLineComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

registerECharts([BarChart, FunnelChart, HeatmapChart, GridComponent, LegendComponent, MarkLineComponent, TooltipComponent, VisualMapComponent, CanvasRenderer])

type MetricRow = Record<string, unknown>
type MetricMap = Record<string, MetricRow[]>
type AssessmentMetric = 'average_pct' | 'pass_pct' | 'at_risk_pct'

const navy = '#102f4c'
const gold = '#b98d2b'
const green = '#3f815b'
const red = '#b14848'
const muted = '#6d7785'
const chartFont = "'Noto Sans Devanagari', 'Arial Unicode MS', sans-serif"

function numberValue(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function textValue(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

function classOrder(value: string) {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : 999
}

function sortClasses(values: string[]) {
  return [...new Set(values)].sort((a, b) => classOrder(a) - classOrder(b) || a.localeCompare(b))
}

function latestMonth(rows: MetricRow[]) {
  return rows.map((row) => textValue(row.month_code)).filter(Boolean).sort().reverse()[0] || ''
}

function snapshotRows(rows: MetricRow[], selectedMonth: string) {
  const effectiveMonth = selectedMonth === 'all' ? latestMonth(rows) : selectedMonth
  return { effectiveMonth, rows: rows.filter((row) => textValue(row.month_code) === effectiveMonth) }
}

function commonOption(): EChartsOption {
  return {
    animationDuration: 420,
    backgroundColor: '#ffffff',
    textStyle: { color: navy, fontFamily: chartFont },
    tooltip: { trigger: 'item', confine: true },
  }
}

async function loadImage(source: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = source
  })
}

function ExportableChart({ title, description, context, filename, option, empty, height = 340, toolbar }: { title: string; description: string; context: string; filename: string; option: EChartsOption; empty: boolean; height?: number; toolbar?: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<EChartsType | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (empty || !hostRef.current) return
    const chart = init(hostRef.current, undefined, { renderer: 'canvas' })
    chartRef.current = chart
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(hostRef.current)
    return () => {
      observer.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [empty])

  useEffect(() => {
    if (!empty) chartRef.current?.setOption(option, { notMerge: true })
  }, [empty, option])

  const downloadPng = async () => {
    const chart = chartRef.current
    if (!chart) return
    setExporting(true)
    try {
      const chartImage = await loadImage(chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' }))
      const headerHeight = 150
      const canvas = document.createElement('canvas')
      canvas.width = chartImage.naturalWidth
      canvas.height = chartImage.naturalHeight + headerHeight
      const drawing = canvas.getContext('2d')
      if (!drawing) return
      drawing.fillStyle = '#ffffff'
      drawing.fillRect(0, 0, canvas.width, canvas.height)
      drawing.fillStyle = navy
      drawing.font = `700 30px ${chartFont}`
      drawing.fillText(title, 34, 48, canvas.width - 68)
      drawing.fillStyle = muted
      drawing.font = `20px ${chartFont}`
      drawing.fillText(description, 34, 84, canvas.width - 68)
      drawing.fillStyle = '#8a6a27'
      drawing.font = `600 17px ${chartFont}`
      drawing.fillText(`Shree Jana Jagriti Secondary School · ${context} · ${new Date().toLocaleDateString('en-CA')}`, 34, 118, canvas.width - 68)
      drawing.drawImage(chartImage, 0, headerHeight)
      const link = document.createElement('a')
      link.download = filename
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setExporting(false)
    }
  }

  return <article className={`dashboard-visual${empty ? ' dashboard-visual--empty' : ''}`}>
    <header><div><span>Visual analysis</span><h3>{title}</h3><p>{description}</p></div>{!empty && <div className="dashboard-visual__actions">{toolbar}<button type="button" onClick={downloadPng} disabled={exporting}><Download aria-hidden="true" />{exporting ? 'तयार हुँदैछ…' : 'PNG'}</button></div>}</header>
    {empty ? <div className="dashboard-visual__empty"><ImageIcon aria-hidden="true" /><span>यो छनोटका लागि डेटा छैन</span></div> : <div className="dashboard-visual__canvas" ref={hostRef} style={{ height }} role="img" aria-label={`${title} — ${context}`} />}
  </article>
}

export function DashboardVisuals({ metrics, month }: { metrics: MetricMap; month: string }) {
  const [assessmentMetric, setAssessmentMetric] = useState<AssessmentMetric>('average_pct')
  const attendanceRows = useMemo(() => metrics.attendance || [], [metrics.attendance])
  const courseSnapshot = useMemo(() => snapshotRows(metrics.course || [], month), [metrics.course, month])
  const assessmentSnapshot = useMemo(() => snapshotRows(metrics.assessment || [], month), [metrics.assessment, month])
  const targetSnapshot = useMemo(() => snapshotRows(metrics.target || [], month), [metrics.target, month])
  const followupSnapshot = useMemo(() => snapshotRows(metrics.followup || [], month), [metrics.followup, month])
  const contextFor = (effectiveMonth = '') => effectiveMonth || (month === 'all' ? 'सबै उपलब्ध महिना' : month)

  const attendanceOption = useMemo<EChartsOption>(() => {
    const rows = month === 'all' ? attendanceRows : attendanceRows.filter((row) => textValue(row.month_code) === month)
    const months = [...new Set(rows.map((row) => textValue(row.month_code)))].filter(Boolean).sort()
    const classes = sortClasses(rows.map((row) => textValue(row.class_name)).filter(Boolean))
    const points = (key: 'boys_pct' | 'girls_pct') => rows.map((row) => [months.indexOf(textValue(row.month_code)), classes.indexOf(textValue(row.class_name)), numberValue(row[key])])
    return {
      ...commonOption(),
      legend: { top: 4, right: 8, selectedMode: 'single', selected: { 'छात्र': true, 'छात्रा': false }, textStyle: { fontFamily: chartFont } },
      grid: { left: 76, right: 28, top: 52, bottom: months.length > 4 ? 76 : 52 },
      xAxis: { type: 'category', data: months, axisLabel: { rotate: months.length > 4 ? 38 : 0, color: muted }, splitArea: { show: true } },
      yAxis: { type: 'category', data: classes, axisLabel: { color: muted }, splitArea: { show: true } },
      visualMap: { min: 0, max: 100, orient: 'horizontal', left: 'center', bottom: 0, calculable: true, inRange: { color: ['#b74b4b', '#e7b85f', '#e8ead9', '#4f8a65'] }, text: ['उच्च', 'न्यून'] },
      series: [
        { name: 'छात्र', type: 'heatmap', data: points('boys_pct'), label: { show: true, formatter: '{@[2]}%' }, emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.18)' } } },
        { name: 'छात्रा', type: 'heatmap', data: points('girls_pct'), label: { show: true, formatter: '{@[2]}%' }, emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.18)' } } },
      ],
    }
  }, [attendanceRows, month])

  const courseOption = useMemo<EChartsOption>(() => {
    const rows = [...courseSnapshot.rows].sort((a, b) => numberValue(a.variance_pct) - numberValue(b.variance_pct))
    return {
      ...commonOption(),
      legend: { top: 4, right: 8, data: ['योजना', 'वास्तविक'], textStyle: { fontFamily: chartFont } },
      grid: { left: 112, right: 34, top: 50, bottom: 30 },
      xAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%', color: muted }, splitLine: { lineStyle: { color: '#e8ebee' } } },
      yAxis: { type: 'category', data: rows.map((row) => textValue(row.subject_name)), axisLabel: { color: navy, width: 96, overflow: 'truncate' } },
      series: [
        { name: 'योजना', type: 'bar', data: rows.map((row) => numberValue(row.planned_pct)), barWidth: 20, itemStyle: { color: '#d9dee4', borderRadius: [0, 3, 3, 0] } },
        { name: 'वास्तविक', type: 'bar', data: rows.map((row) => numberValue(row.completed_pct)), barWidth: 10, barGap: '-75%', z: 3, itemStyle: { color: gold, borderRadius: [0, 3, 3, 0] }, label: { show: true, position: 'right', formatter: '{c}%', color: navy } },
      ],
    }
  }, [courseSnapshot])

  const assessmentOption = useMemo<EChartsOption>(() => {
    const rows = assessmentSnapshot.rows
    const subjects = [...new Set(rows.map((row) => textValue(row.subject_name)))].filter(Boolean)
    const classes = sortClasses(rows.map((row) => textValue(row.class_name)).filter(Boolean))
    const isRisk = assessmentMetric === 'at_risk_pct'
    return {
      ...commonOption(),
      grid: { left: 76, right: 26, top: 26, bottom: subjects.length > 4 ? 118 : 90 },
      xAxis: { type: 'category', data: subjects, axisLabel: { rotate: subjects.length > 4 ? 36 : 0, color: muted, width: 90, overflow: 'truncate' }, splitArea: { show: true } },
      yAxis: { type: 'category', data: classes, axisLabel: { color: muted }, splitArea: { show: true } },
      visualMap: { min: 0, max: 100, orient: 'horizontal', left: 'center', bottom: 0, calculable: true, inRange: { color: isRisk ? ['#f4f5ef', '#e8b86d', '#b14848'] : ['#b14848', '#e6bd68', '#f0eedc', '#3f815b'] }, text: ['100%', '0%'] },
      series: [{ type: 'heatmap', data: rows.map((row) => [subjects.indexOf(textValue(row.subject_name)), classes.indexOf(textValue(row.class_name)), numberValue(row[assessmentMetric])]), label: { show: true, formatter: '{@[2]}%' }, emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.18)' } } }],
    }
  }, [assessmentMetric, assessmentSnapshot])

  const targetOption = useMemo<EChartsOption>(() => {
    const rows = [...targetSnapshot.rows].sort((a, b) => numberValue(a.variance_pct) - numberValue(b.variance_pct))
    const labels = rows.map((row) => `${textValue(row.class_name)} · ${textValue(row.subject_name)}`)
    return {
      ...commonOption(),
      grid: { left: 138, right: 42, top: 24, bottom: 32 },
      xAxis: { type: 'value', axisLabel: { formatter: '{value} pp', color: muted }, splitLine: { lineStyle: { color: '#e8ebee' } } },
      yAxis: { type: 'category', data: labels, axisLabel: { color: navy, width: 126, overflow: 'truncate' } },
      series: [{ type: 'bar', data: rows.map((row) => { const value = numberValue(row.variance_pct); return { value, itemStyle: { color: value < 0 ? red : green, borderRadius: value < 0 ? [3, 0, 0, 3] : [0, 3, 3, 0] }, label: { position: value < 0 ? 'insideLeft' : 'outside', color: value < 0 ? '#ffffff' : navy } } }), barWidth: 14, label: { show: true, formatter: '{c} pp' }, markLine: { silent: true, symbol: 'none', lineStyle: { color: navy, width: 1.5 }, data: [{ xAxis: 0 }] } }],
    }
  }, [targetSnapshot])

  const followupStats = useMemo(() => {
    const chronic = followupSnapshot.rows.reduce((sum, row) => sum + numberValue(row.chronic_absentee_count), 0)
    const dropout = followupSnapshot.rows.reduce((sum, row) => sum + numberValue(row.dropout_count), 0)
    const closed = followupSnapshot.rows.reduce((sum, row) => sum + Math.round(numberValue(row.chronic_absentee_count) * numberValue(row.followup_closure_pct) / 100), 0)
    return { chronic, dropout, closed }
  }, [followupSnapshot])

  const followupOption = useMemo<EChartsOption>(() => ({
    ...commonOption(),
    legend: { bottom: 4, textStyle: { fontFamily: chartFont } },
    series: [{ name: 'Follow-up', type: 'funnel', left: '12%', top: 24, bottom: 52, width: '76%', minSize: '22%', maxSize: '100%', sort: 'descending', gap: 3, label: { show: true, position: 'inside', formatter: '{b}: {c}', fontFamily: chartFont }, itemStyle: { borderColor: '#fff', borderWidth: 2 }, data: [
      { name: 'नियमित अनुपस्थित', value: followupStats.chronic, itemStyle: { color: '#d29b36' } },
      { name: 'फर्किएको वा सुधार', value: followupStats.closed, itemStyle: { color: green } },
    ] }],
  }), [followupStats])

  const assessmentLabels: Record<AssessmentMetric, string> = { average_pct: 'औसत', pass_pct: 'उत्तीर्ण', at_risk_pct: 'जोखिम' }
  const assessmentToolbar = <select aria-label="Assessment heatmap metric" value={assessmentMetric} onChange={(event) => setAssessmentMetric(event.target.value as AssessmentMetric)}><option value="average_pct">औसत %</option><option value="pass_pct">उत्तीर्ण %</option><option value="at_risk_pct">जोखिम %</option></select>

  const attendanceFiltered = month === 'all' ? attendanceRows : attendanceRows.filter((row) => textValue(row.month_code) === month)
  const attendanceClassCount = sortClasses(attendanceFiltered.map((row) => textValue(row.class_name)).filter(Boolean)).length
  const assessmentClassCount = sortClasses(assessmentSnapshot.rows.map((row) => textValue(row.class_name)).filter(Boolean)).length
  const period = (effectiveMonth: string) => contextFor(effectiveMonth)

  return <div className="dashboard-visual-grid">
    <ExportableChart title="उपस्थिति तापचित्र" description="कक्षा र महिनाअनुसार छात्र/छात्रा उपस्थिति" context={period(month === 'all' ? '' : month)} filename={`attendance-heatmap-${month}.png`} option={attendanceOption} empty={!attendanceFiltered.length} height={Math.max(320, attendanceClassCount * 34 + 150)} />
    <ExportableChart title="कोर्ष प्रगति बनाम योजना" description="विषयगत वास्तविक प्रगति र निर्धारित लक्ष्य" context={period(courseSnapshot.effectiveMonth)} filename={`course-progress-${courseSnapshot.effectiveMonth || month}.png`} option={courseOption} empty={!courseSnapshot.rows.length} height={Math.max(300, courseSnapshot.rows.length * 34 + 110)} />
    <ExportableChart title="मूल्याङ्कन तापचित्र" description={`${assessmentLabels[assessmentMetric]} प्रतिशत · कक्षा × विषय`} context={period(assessmentSnapshot.effectiveMonth)} filename={`assessment-${assessmentMetric}-${assessmentSnapshot.effectiveMonth || month}.png`} option={assessmentOption} empty={!assessmentSnapshot.rows.length} height={Math.max(340, assessmentClassCount * 34 + 190)} toolbar={assessmentToolbar} />
    <ExportableChart title="लक्ष्यभन्दा अन्तर" description="शून्यभन्दा बायाँ लक्ष्यभन्दा कम, दायाँ लक्ष्यभन्दा माथि" context={period(targetSnapshot.effectiveMonth)} filename={`target-variance-${targetSnapshot.effectiveMonth || month}.png`} option={targetOption} empty={!targetSnapshot.rows.length} height={Math.max(300, targetSnapshot.rows.length * 34 + 90)} />
    <ExportableChart title="अनुपस्थिति follow-up" description={`नियमित अनुपस्थितिबाट सुधारसम्म · Dropout: ${followupStats.dropout}`} context={period(followupSnapshot.effectiveMonth)} filename={`student-followup-${followupSnapshot.effectiveMonth || month}.png`} option={followupOption} empty={!followupSnapshot.rows.length || (followupStats.chronic === 0 && followupStats.dropout === 0)} height={330} />
  </div>
}
