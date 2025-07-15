'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'
import Image from 'next/image'
import { 
  Mail, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  Users,
  Calendar
} from 'lucide-react'

type Teacher = Database['public']['Tables']['teachers']['Row']

interface TeacherCardProps {
  teacher: Teacher
  locale: 'en' | 'ne'
  t: (key: string) => string
  index: number
}

function TeacherCard({ teacher, locale, t, index }: TeacherCardProps) {
  return (
    <div 
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group animate-fadeInUp"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Photo Section */}
      <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
        {teacher.photo_url ? (
          <Image
            src={teacher.photo_url}
            alt={locale === 'en' ? teacher.name_en : teacher.name_ne}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {(locale === 'en' ? teacher.name_en : teacher.name_ne).charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {locale === 'en' ? teacher.name_en : teacher.name_ne}
          </h3>
          <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-full">
            <GraduationCap size={16} className="mr-1" />
            {locale === 'en' ? teacher.position_en : teacher.position_ne}
          </div>
        </div>
        
        {/* Bio Preview */}
        {((locale === 'en' && teacher.bio_en) || (locale === 'ne' && teacher.bio_ne)) && (
          <p className="text-gray-600 text-sm mb-4 leading-relaxed" style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 3, 
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {locale === 'en' ? teacher.bio_en : teacher.bio_ne}
          </p>
        )}
        
        {/* Info Grid */}
        <div className="space-y-3 mb-4">
          {teacher.experience_years > 0 && (
            <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-600">{t('common.experience')}</span>
                <div className="font-semibold text-blue-600">{teacher.experience_years} {t('common.years')}</div>
              </div>
            </div>
          )}
          
          {((locale === 'en' && teacher.specialization_en) || (locale === 'ne' && teacher.specialization_ne)) && (
            <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen size={16} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-600">{t('common.specialization')}</span>
                <div className="font-semibold text-purple-600 text-sm">
                  {locale === 'en' ? teacher.specialization_en : teacher.specialization_ne}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Contact Info */}
        {(teacher.email || teacher.phone) && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <Users size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{t('common.contact')}</span>
            </div>
            <div className="space-y-2">
              {teacher.email && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <Mail size={14} />
                  <span className="truncate">{teacher.email}</span>
                </div>
              )}
              {teacher.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                  <Phone size={14} />
                  <span>{teacher.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TeachersPage() {
  const { locale, t } = useLanguage()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeachers() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      setTeachers(data || [])
      setError(err?.message || null)
      setLoading(false)
    }

    fetchTeachers()
  }, [])

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
                {t('teachers.title')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto animate-fadeInUp leading-relaxed" style={{ animationDelay: '200ms' }}>
              {t('teachers.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {teachers && teachers.length > 0 ? (
          <>
            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {teachers.map((teacher, index) => (
                <TeacherCard 
                  key={teacher.id} 
                  teacher={teacher} 
                  locale={locale} 
                  t={t} 
                  index={index}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-xl max-w-2xl mx-auto">
              {error ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-2xl">⚠</span>
                  </div>
                  <h3 className="text-xl font-bold text-red-600 mb-2">{t('common.error')}</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">{t('teachers.noTeachers')}</h3>
                  <p className="text-gray-500">{t('teachers.noTeachersDesc')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connection Status (for debugging) */}
        {error && (
          <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-red-200">
            <div className="flex justify-center items-center text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`flex items-center space-x-1 ${error ? 'text-red-600' : 'text-green-600'}`}>
                  <span>{error ? '⚠' : '✓'}</span>
                  <span>{error ? 'Error' : `${teachers?.length || 0} ${t('teachers.loaded')}`}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
