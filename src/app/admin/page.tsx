'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  FileText,
  FolderOpen,
  Globe2,
  Info,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'

interface OverviewItemProps {
  icon: ReactNode
  label: string
  value: string | number
  detail: string
  warning?: boolean
}

function OverviewItem({ icon, label, value, detail, warning = false }: OverviewItemProps) {
  return (
    <article className="admin-overview-item">
      <div className="admin-overview-item__top">
        <span className="admin-overview-item__icon" aria-hidden="true">{icon}</span>
        <span className={`admin-overview-item__status${warning ? ' is-warning' : ''}`}>
          {warning ? <CircleAlert aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
        </span>
      </div>
      <p className="admin-overview-item__value">{value}</p>
      <h3>{label}</h3>
      <p className="admin-overview-item__detail">{detail}</p>
    </article>
  )
}

interface ModuleLinkProps {
  href: string
  icon: ReactNode
  title: string
  description: string
  external?: boolean
}

function ModuleLink({ href, icon, title, description, external = false }: ModuleLinkProps) {
  return (
    <Link href={href} className="admin-module-link">
      <span className="admin-module-link__icon" aria-hidden="true">{icon}</span>
      <span className="admin-module-link__copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <ArrowUpRight aria-hidden="true" className={external ? '' : 'admin-module-link__arrow'} />
    </Link>
  )
}

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [aboutConfigured, setAboutConfigured] = useState(false)
  const [statsCount, setStatsCount] = useState(0)
  const [teachers, setTeachers] = useState<Array<{ id: number; is_active: boolean; is_academic: boolean }>>([])
  const [notices, setNotices] = useState<Array<{ id: number; is_published: boolean }>>([])
  const [committee, setCommittee] = useState<Array<{ id: number; is_active: boolean }>>([])
  const [activities, setActivities] = useState<Array<{ id: number; is_published: boolean }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        window.location.href = '/admin/login'
        return
      }

      setUser(currentUser)

      const [aboutResult, statsResult, teachersResult, noticesResult, committeeResult, activitiesResult] = await Promise.all([
        supabase.from('about').select('id').limit(1).maybeSingle(),
        supabase.from('stats').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id, is_active, is_academic'),
        supabase.from('notices').select('id, is_published'),
        supabase.from('committee').select('id, is_active'),
        supabase.from('activities').select('id, is_published'),
      ])

      setAboutConfigured(Boolean(aboutResult.data))
      setStatsCount(statsResult.count ?? 0)
      setTeachers(teachersResult.data || [])
      setNotices(noticesResult.data || [])
      setCommittee(committeeResult.data || [])
      setActivities(activitiesResult.data || [])
      setLoading(false)
    }

    loadDashboard()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="admin-dashboard min-h-screen">
        <Navigation />
        <div className="admin-dashboard__loading" role="status">
          <span className="admin-dashboard__spinner" aria-hidden="true" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const academicTeachers = teachers.filter((teacher) => teacher.is_academic)
  const activeTeachers = academicTeachers.filter((teacher) => teacher.is_active).length
  const activeCommittee = committee.filter((member) => member.is_active).length
  const publishedActivities = activities.filter((activity) => activity.is_published).length
  const publishedNotices = notices.filter((notice) => notice.is_published).length

  return (
    <div className="admin-dashboard min-h-screen">
      <Navigation />

      <header className="admin-dashboard__header">
        <div className="admin-dashboard__shell admin-dashboard__header-row">
          <div>
            <p className="admin-dashboard__eyebrow"><LayoutDashboard aria-hidden="true" /> Content management</p>
            <h1>School administration</h1>
            <p className="admin-dashboard__intro">Review published information and manage the school website from one place.</p>
          </div>
          <div className="admin-dashboard__account">
            <span>Signed in as</span>
            <strong>{user.email}</strong>
            <button type="button" onClick={handleSignOut}>
              <LogOut aria-hidden="true" />{t('admin.signOut')}
            </button>
          </div>
        </div>
      </header>

      <main className="admin-dashboard__shell admin-dashboard__content">
        <section aria-labelledby="overview-heading">
          <div className="admin-section-heading">
            <div>
              <p>Current status</p>
              <h2 id="overview-heading">Website overview</h2>
            </div>
            <Link href="/" className="admin-secondary-action">
              <Globe2 aria-hidden="true" />View public website<ArrowUpRight aria-hidden="true" />
            </Link>
          </div>

          <div className="admin-overview-grid">
            <OverviewItem icon={<Info />} label={t('admin.about')} value={aboutConfigured ? 'Ready' : 'Missing'} detail={aboutConfigured ? 'School profile configured' : 'School profile needs content'} warning={!aboutConfigured} />
            <OverviewItem icon={<BarChart3 />} label={t('admin.stats')} value={statsCount} detail="Published statistics" warning={statsCount === 0} />
            <OverviewItem icon={<Users />} label={t('admin.teachers')} value={activeTeachers} detail={`${activeTeachers} active of ${academicTeachers.length} academic staff`} warning={activeTeachers === 0} />
            <OverviewItem icon={<Building2 />} label="Committees" value={activeCommittee} detail="Active committee members" warning={activeCommittee === 0} />
            <OverviewItem icon={<CalendarDays />} label="Activities" value={publishedActivities} detail="Published activities" warning={publishedActivities === 0} />
            <OverviewItem icon={<Megaphone />} label="Notices" value={publishedNotices} detail="Published notices" warning={publishedNotices === 0} />
          </div>
        </section>

        <section aria-labelledby="management-heading" className="admin-management-section">
          <div className="admin-section-heading">
            <div>
              <p>Administration</p>
              <h2 id="management-heading">Manage website content</h2>
            </div>
          </div>

          <div className="admin-module-grid">
            <ModuleLink href="/admin/about" icon={<FileText />} title={t('admin.about')} description={t('admin.aboutDesc')} />
            <ModuleLink href="/admin/stats" icon={<BarChart3 />} title={t('admin.stats')} description={t('admin.statsDesc')} />
            <ModuleLink href="/admin/teachers" icon={<Users />} title={t('admin.teachers')} description={t('admin.teachersDesc')} />
            <ModuleLink href="/admin/committee" icon={<Building2 />} title="Committees" description="Manage SMC and PTA membership" />
            <ModuleLink href="/admin/activities" icon={<CalendarDays />} title="Activities" description="Manage school events and activities" />
            <ModuleLink href="/admin/notices" icon={<Megaphone />} title="Notices" description="Publish announcements and notices" />
            <ModuleLink href="/admin/documents" icon={<FolderOpen />} title="Documents" description="Manage forms, reports and resources" />
            <ModuleLink href="/admin/footer" icon={<Settings />} title="School information" description="Update contact details, links and logo" />
            <ModuleLink href="/admin/dashboard" icon={<ClipboardList />} title="Monthly reporting" description="Review teacher responses and the eight academic KPIs" />
          </div>
        </section>
      </main>
    </div>
  )
}
