'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { 
  GraduationCap, 
  Users, 
  Target, 
  Eye, 
  Heart, 
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'

interface AnimatedStatsCardProps {
  label: string
  value: number
  isPercentage?: boolean
  icon: React.ReactNode
  delay: number
}

function AnimatedStatsCard({ label, value, isPercentage = false, icon, delay }: AnimatedStatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAnimated) {
        setHasAnimated(true)
        const increment = value / 50
        let current = 0
        const interval = setInterval(() => {
          current += increment
          if (current >= value) {
            setDisplayValue(value)
            clearInterval(interval)
          } else {
            setDisplayValue(Math.floor(current))
          }
        }, 30)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay, hasAnimated])

  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {displayValue}{isPercentage ? '%' : ''}
        </div>
        <div className="text-gray-700 font-medium text-lg">{label}</div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <div 
      className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fadeInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
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

export default function AboutPage() {
  const { locale, t } = useLanguage()
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [statsData, setStatsData] = useState<StatsData[]>([])
  const [aboutError, setAboutError] = useState<string | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [studentCounts, setStudentCounts] = useState<Array<{ id: number; level: string; boys: number; girls: number }>>([])
  const [studentCountsError, setStudentCountsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Fetch about, stats, and student counts data
      const [aboutResult, statsResult, countsResult] = await Promise.all([
        supabase.from('about').select('*').single(),
        supabase.from('stats').select('*').order('display_order'),
        supabase.from('student_counts').select('id, level, boys, girls').order('display_order')
      ])

      const { data: about, error: aboutErr } = aboutResult
      const { data: stats, error: statsErr } = statsResult

      setAboutData(about)
      setStatsData(stats || [])
      setStudentCounts(countsResult.data || [])
      setAboutError(aboutErr?.message || null)
      setStatsError(statsErr?.message || null)
      setStudentCountsError(countsResult.error?.message || null)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">{t('about.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatsIcon = (index: number) => {
    const iconComponents = [Users, GraduationCap, Clock, Award]
    const IconComponent = iconComponents[index % iconComponents.length]
    return <IconComponent size={24} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('about.title')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* About Content Section */}
        <section className="mb-20">
          <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-white/20 shadow-xl animate-scaleIn">
            {aboutData ? (
              <div className="prose prose-lg md:prose-xl max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: (locale === 'en' ? aboutData.content_en : aboutData.content_ne)
                      .replace(/\n/g, '<br />')
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-red-500 text-lg">
                  {aboutError ? `${t('about.error')}: ${aboutError}` : t('about.loading')}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Mission, Vision, Values Cards */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target size={24} />}
              title={t('about.mission')}
              description="To provide quality education that empowers students to become responsible global citizens and lifelong learners."
              delay={0}
            />
            <FeatureCard
              icon={<Eye size={24} />}
              title={t('about.vision')}
              description="To be a leading educational institution recognized for excellence in academic achievement and character development."
              delay={200}
            />
            <FeatureCard
              icon={<Heart size={24} />}
              title={t('about.values')}
              description="Integrity, excellence, innovation, community service, and respect for diversity form the foundation of our educational philosophy."
              delay={400}
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('about.stats.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.stats.description')}
            </p>
          </div>
          
          {statsData && statsData.length > 0 ? (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
                {statsData.map((stat, index) => (
                  <AnimatedStatsCard
                    key={stat.id}
                    label={locale === 'en' ? stat.label_en : stat.label_ne}
                    value={stat.value}
                    isPercentage={stat.label_en.toLowerCase().includes('rate')}
                    icon={getStatsIcon(index)}
                    delay={index * 200}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg">
                {statsError ? `${t('about.error')}: ${statsError}` : t('about.loading')}
              </div>
            </div>
          )}
        </section>

        {/* Data Section: Student Counts */}
        <section className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Data
            </h2>
            <p className="text-gray-600">Number of students</p>
          </div>

          {studentCountsError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-center">
              {studentCountsError}
            </div>
          )}

          <div className="overflow-x-auto bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/70">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boys
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Girls
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/60 divide-y divide-gray-100">
                {studentCounts.map((row) => {
                  const total = (row?.boys || 0) + (row?.girls || 0)
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                        {row.boys}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                        {row.girls}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                        {total}
                      </td>
                    </tr>
                  )
                })}
                {studentCounts.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-center text-sm text-gray-500" colSpan={4}>
                      No data available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Excellence Features */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              icon={<BookOpen size={24} />}
              title={t('about.excellence')}
              description="Our commitment to academic excellence is reflected in our innovative teaching methods and comprehensive curriculum."
              delay={0}
            />
            <FeatureCard
              icon={<Users size={24} />}
              title={t('about.community')}
              description="We foster a strong sense of community through collaborative learning and meaningful partnerships with families."
              delay={200}
            />
            <FeatureCard
              icon={<TrendingUp size={24} />}
              title={t('about.innovation')}
              description="We embrace technology and innovative approaches to prepare students for the challenges of tomorrow."
              delay={400}
            />
            <FeatureCard
              icon={<GraduationCap size={24} />}
              title={t('about.leadership')}
              description="Our programs are designed to develop leadership skills and prepare students to make positive contributions to society."
              delay={600}
            />
          </div>
        </section>

        {/* Connection Status (for debugging) */}
        {(aboutError || statsError) && (
          <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-red-200">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">Status:</span>
                <div className="flex items-center space-x-4">
                  <span className={`flex items-center space-x-1 ${aboutError ? 'text-red-600' : 'text-green-600'}`}>
                    {aboutError ? <span>⚠</span> : <CheckCircle size={16} />}
                    <span>About {aboutError ? 'Error' : 'Connected'}</span>
                  </span>
                  <span className={`flex items-center space-x-1 ${statsError ? 'text-red-600' : 'text-green-600'}`}>
                    {statsError ? <span>⚠</span> : <CheckCircle size={16} />}
                    <span>Stats {statsError ? 'Error' : 'Connected'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
