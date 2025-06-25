'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'

interface StatsCardProps {
  label: string
  value: number
  isPercentage?: boolean
}

function StatsCard({ label, value, isPercentage = false }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {value}{isPercentage ? '%' : ''}
        </div>
        <div className="text-gray-700 font-medium">{label}</div>
      </div>
    </div>
  )
}

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

export default function AboutStatsPage() {
  const { locale, t } = useLanguage()
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [statsData, setStatsData] = useState<StatsData[]>([])
  const [aboutError, setAboutError] = useState<string | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Fetch both about and stats data
      const [aboutResult, statsResult] = await Promise.all([
        supabase.from('about').select('*').single(),
        supabase.from('stats').select('*').order('display_order')
      ])

      const { data: about, error: aboutErr } = aboutResult
      const { data: stats, error: statsErr } = statsResult

      setAboutData(about)
      setStatsData(stats || [])
      setAboutError(aboutErr?.message || null)
      setStatsError(statsErr?.message || null)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600">{t('about.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Section */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">
            {t('about.title')}
          </h1>
          
          <div className="bg-white p-8 rounded-lg border shadow-sm">
            {aboutData ? (
              <div className="text-gray-700 leading-relaxed text-lg">
                {locale === 'en' ? aboutData.content_en : aboutData.content_ne}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-600">
                  {aboutError ? `${t('about.error')}: ${aboutError}` : t('about.loading')}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
            {t('about.stats.title')}
          </h2>
          
          {statsData && statsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData.map((stat) => (
                <StatsCard
                  key={stat.id}
                  label={locale === 'en' ? stat.label_en : stat.label_ne}
                  value={stat.value}
                  isPercentage={stat.label_en.toLowerCase().includes('rate')}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">
                {statsError ? `${t('about.error')}: ${statsError}` : t('about.loading')}
              </p>
            </div>
          )}
        </section>

        {/* Connection Status */}
        <div className="mt-12 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <span className="font-medium">About Status:</span>{' '}
              <span className={aboutError ? 'text-red-600' : 'text-green-600'}>
                {aboutError ? 'Error' : 'Connected'}
              </span>
            </div>
            <div>
              <span className="font-medium">Stats Status:</span>{' '}
              <span className={statsError ? 'text-red-600' : 'text-green-600'}>
                {statsError ? 'Error' : 'Connected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
