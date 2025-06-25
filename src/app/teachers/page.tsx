'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'
import Image from 'next/image'

type Teacher = Database['public']['Tables']['teachers']['Row']

interface TeacherCardProps {
  teacher: Teacher
  locale: 'en' | 'ne'
  t: (key: string) => string
}

function TeacherCard({ teacher, locale, t }: TeacherCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {teacher.photo_url ? (
          <Image
            src={teacher.photo_url}
            alt={locale === 'en' ? teacher.name_en : teacher.name_ne}
            width={300}
            height={300}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-2xl font-semibold">
              {(locale === 'en' ? teacher.name_en : teacher.name_ne).charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {locale === 'en' ? teacher.name_en : teacher.name_ne}
          </h3>
          <p className="text-blue-600 font-medium mb-4">
            {locale === 'en' ? teacher.position_en : teacher.position_ne}
          </p>
        </div>
        
        {/* Bio Preview */}
        {((locale === 'en' && teacher.bio_en) || (locale === 'ne' && teacher.bio_ne)) && (
          <p className="text-gray-700 text-sm mb-4 overflow-hidden" style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 3, 
            WebkitBoxOrient: 'vertical' 
          }}>
            {locale === 'en' ? teacher.bio_en : teacher.bio_ne}
          </p>
        )}
        
        {/* Quick Info */}
        <div className="space-y-2 text-sm">
          {teacher.experience_years > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">{t('common.experience')}:</span>
              <span className="font-medium">{teacher.experience_years} {t('common.years')}</span>
            </div>
          )}
          {((locale === 'en' && teacher.specialization_en) || (locale === 'ne' && teacher.specialization_ne)) && (
            <div className="flex justify-between">
              <span className="text-gray-600">{t('common.specialization')}:</span>
              <span className="font-medium text-right">
                {locale === 'en' ? teacher.specialization_en : teacher.specialization_ne}
              </span>
            </div>
          )}
        </div>
        
        {/* Contact */}
        {(teacher.email || teacher.phone) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-600 font-medium mb-2">{t('common.contact')}:</div>
            {teacher.email && (
              <p className="text-xs text-gray-500 mb-1">
                📧 {teacher.email}
              </p>
            )}
            {teacher.phone && (
              <p className="text-xs text-gray-500">
                📞 {teacher.phone}
              </p>
            )}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('teachers.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('teachers.subtitle')}
          </p>
        </div>

        {teachers && teachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} locale={locale} t={t} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8">
              {error ? (
                <div className="text-red-600">
                  <p className="font-semibold mb-2">{t('common.error')}</p>
                  <p className="text-sm">{error}</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="font-semibold mb-2">{t('teachers.noTeachers')}</p>
                  <p className="text-sm">{t('teachers.noTeachersDesc')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="mt-12 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-medium">{t('teachers.dataStatus')}:</span>{' '}
            <span className={error ? 'text-red-600' : 'text-green-600'}>
              {error ? 'Error' : `${teachers?.length || 0} ${t('teachers.loaded')}`}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
