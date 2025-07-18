'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Calendar,
  Megaphone,
  Settings,
  LogOut,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
  Globe,
  Building,
  FolderOpen
} from 'lucide-react'

interface AboutData {
  id: number
  content_en: string
  content_ne: string
  updated_at: string
}

interface StatsData {
  id: number
  label_en: string
  label_ne: string
  value: number
  display_order: number
}

interface TeacherData {
  id: number
  name_en: string
  name_ne: string
  position_en: string
  position_ne: string
  is_active: boolean
}

interface NoticeData {
  id: number
  title_en: string
  title_ne: string
  is_published: boolean
}

interface CommitteeData {
  id: number
  name_en: string
  name_ne: string
  is_active: boolean
}

interface ActivityData {
  id: number
  title_en: string
  title_ne: string
  is_published: boolean
  is_featured: boolean
}

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [statsData, setStatsData] = useState<StatsData[]>([])
  const [teachersData, setTeachersData] = useState<TeacherData[]>([])
  const [noticesData, setNoticesData] = useState<NoticeData[]>([])
  const [committeeData, setCommitteeData] = useState<CommitteeData[]>([])
  const [activitiesData, setActivitiesData] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/admin/login'
        return
      }

      setUser(user)

      // Get stats for the dashboard
      const [aboutResult, statsResult, teachersResult, noticesResult, committeeResult, activitiesResult] = await Promise.all([
        supabase.from('about').select('*').single(),
        supabase.from('stats').select('*').order('display_order'),
        supabase.from('teachers').select('*'),
        supabase.from('notices').select('id, title_en, title_ne, is_published'),
        supabase.from('committee').select('*'),
        supabase.from('activities').select('id, title_en, title_ne, is_published, is_featured')
      ])

      setAboutData(aboutResult.data)
      setStatsData(statsResult.data || [])
      setTeachersData(teachersResult.data || [])
      setNoticesData(noticesResult.data || [])
      setCommitteeData(committeeResult.data || [])
      setActivitiesData(activitiesResult.data || [])
      setLoading(false)
    }

    checkUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      {/* Hero Header */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <LayoutDashboard className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeInUp">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JJSS Admin Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              {t('admin.welcome')}, <span className="font-semibold">{user.email}</span>
            </p>
            <div className="flex justify-center animate-fadeInUp" style={{ animationDelay: '400ms' }}>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 shadow-lg"
              >
                <LogOut size={16} className="mr-2" />
                {t('admin.signOut')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Quick Stats Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* About Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Info className="text-white" size={24} />
                </div>
                {aboutData ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <AlertCircle className="text-amber-500" size={20} />
                )}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{t('admin.about')}</h3>
              <p className="text-sm text-gray-600">
                {aboutData ? 'Content configured' : 'Not configured'}
              </p>
            </div>

            {/* Stats Count */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{statsData?.length || 0}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{t('admin.stats')}</h3>
              <p className="text-sm text-gray-600">Statistics configured</p>
            </div>

            {/* Teachers Count */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{teachersData?.filter(t => t.is_active).length || 0}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{t('admin.teachers')}</h3>
              <p className="text-sm text-gray-600">
                {teachersData?.filter(t => t.is_active).length || 0} active of {teachersData?.length || 0} total
              </p>
            </div>

            {/* Committee Count */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Building className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{committeeData?.filter(c => c.is_active).length || 0}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Committee</h3>
              <p className="text-sm text-gray-600">
                {committeeData?.filter(c => c.is_active).length || 0} active members
              </p>
            </div>

            {/* Activities Count */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{activitiesData?.filter(a => a.is_published).length || 0}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Activities</h3>
              <p className="text-sm text-gray-600">
                {activitiesData?.filter(a => a.is_published).length || 0} published activities
              </p>
            </div>

            {/* Notices Count */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Megaphone className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{noticesData?.filter(n => n.is_published).length || 0}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Notices</h3>
              <p className="text-sm text-gray-600">
                {noticesData?.filter(n => n.is_published).length || 0} published notices
              </p>
            </div>
          </div>
        </div>

        {/* CMS Modules */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Content Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {/* About Module */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('admin.about')}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {t('admin.aboutDesc')}
                </p>
              </div>
              <div className="px-6 pb-6">
                <Link href="/admin/about" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
                    Manage About
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Module */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('admin.stats')}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {t('admin.statsDesc')}
                </p>
              </div>
              <div className="px-6 pb-6">
                <Link href="/admin/stats" className="block">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg">
                    Manage Stats
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Teachers Module */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('admin.teachers')}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {t('admin.teachersDesc')}
                </p>
              </div>
              <div className="px-6 pb-6">
                <Link href="/admin/teachers" className="block">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg">
                    Manage Teachers
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Committee Module */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Building className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Committee</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Manage management committee members
                </p>
              </div>
              <div className="px-6 pb-6">
                <Link href="/admin/committee" className="block">
                  <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white shadow-lg">
                    Manage Committee
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Activities Module */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Activities</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Manage school events and activities
                </p>
              </div>
              <div className="px-6 pb-6">
                <Link href="/admin/activities" className="block">
                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white shadow-lg">
                    Manage Activities
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Notices Module */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Megaphone className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Notices</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Manage school announcements and notices
                </p>
              </div>
              <div className="px-6 pb-6">
                <Link href="/admin/notices" className="block">
                  <Button className="w-full bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white shadow-lg">
                    Manage Notices
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Footer Module */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Footer</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Manage footer content and settings
                </p>
              </div>
              <div className="px-6 pb-6">
                <Link href="/admin/footer" className="block">
                  <Button className="w-full bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white shadow-lg">
                    Manage Footer
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Documents Module */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FolderOpen className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Documents</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Upload and manage school documents and resources
                </p>
              </div>
              <div className="px-6 pb-6">
                <Link href="/admin/documents" className="block">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white shadow-lg">
                    Manage Documents
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Website Module */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">View Website</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Visit the public website
                </p>
              </div>
              <div className="px-6 pb-6">
                <Link href="/" className="block">
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-lg">
                    View Website
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
