import { notFound } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { MonthlyReportForm } from '@/components/MonthlyReportForm'
import type { ReportKind } from '@/lib/monthly-report-forms'

export function generateStaticParams() { return [{ type: 'subject' }, { type: 'class' }, { type: 'incharge' }] }

export default async function ReportPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  if (!['subject', 'class', 'incharge'].includes(type)) notFound()
  return <div className="public-page"><Navigation /><MonthlyReportForm kind={type as ReportKind} /></div>
}
