'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'

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

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [statsData, setStatsData] = useState<StatsData[]>([])
  const [teachersData, setTeachersData] = useState<TeacherData[]>([])
  const [noticesData, setNoticesData] = useState<NoticeData[]>([])
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
      const [aboutResult, statsResult, teachersResult, noticesResult] = await Promise.all([
        supabase.from('about').select('*').single(),
        supabase.from('stats').select('*').order('display_order'),
        supabase.from('teachers').select('*'),
        supabase.from('notices').select('id, title_en, title_ne, is_published')
      ])
      
      setAboutData(aboutResult.data)
      setStatsData(statsResult.data || [])
      setTeachersData(teachersResult.data || [])
      setNoticesData(noticesResult.data || [])
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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
              <p className="text-gray-600">{t('admin.welcome')}, {user.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              {t('admin.signOut')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Stats */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-900">{t('admin.about')}</h3>
                <p className="text-sm text-gray-600">
                  {aboutData ? 'Configured' : 'Not set'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-900">{t('admin.stats')}</h3>
                <p className="text-sm text-gray-600">
                  {statsData?.length || 0} stats configured
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-900">{t('admin.teachers')}</h3>
                <p className="text-sm text-gray-600">
                  {teachersData?.length || 0} teachers ({teachersData?.filter(t => t.is_active).length || 0} active)
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-900">Notices</h3>
                <p className="text-sm text-gray-600">
                  {noticesData?.length || 0} notices ({noticesData?.filter(n => n.is_published).length || 0} published)
                </p>
              </div>
            </div>
          </div>

          {/* CMS Modules */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Content Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* About Module */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{t('admin.about')}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('admin.aboutDesc')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3">
                  <Link href="/admin/about">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Manage About
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats Module */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{t('admin.stats')}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('admin.statsDesc')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3">
                  <Link href="/admin/stats">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Manage Stats
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Teachers Module */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{t('admin.teachers')}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('admin.teachersDesc')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3">
                  <Link href="/admin/teachers">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Manage Teachers
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Notices Module */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Notices</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage school announcements and notices
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3">
                  <Link href="/admin/notices">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Manage Notices
                    </Button>
                  </Link>
                </div>
              </div>



            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
