'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Navigation } from '@/components/Navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'

interface Committee {
  id: number
  name_en: string
  name_ne: string
  role_en: string
  role_ne: string
  photo_url: string | null
  bio_en: string | null
  bio_ne: string | null
  display_order: number
  is_active: boolean
}

interface CommitteeCardProps {
  member: Committee
  locale: 'en' | 'ne'
}

function CommitteeCard({ member, locale }: CommitteeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={locale === 'en' ? member.name_en : member.name_ne}
            width={300}
            height={300}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-2xl font-semibold">
              {(locale === 'en' ? member.name_en : member.name_ne).charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {locale === 'en' ? member.name_en : member.name_ne}
          </h3>
          <p className="text-blue-600 font-medium mb-4">
            {locale === 'en' ? member.role_en : member.role_ne}
          </p>
        </div>
        
        {/* Bio Preview */}
        {((locale === 'en' && member.bio_en) || (locale === 'ne' && member.bio_ne)) && (
          <p className="text-gray-700 text-sm leading-relaxed" style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 4, 
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {locale === 'en' ? member.bio_en : member.bio_ne}
          </p>
        )}
      </div>
    </div>
  )
}

export default function CommitteePage() {
  const { locale, t } = useLanguage()
  const [committee, setCommittee] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCommittee() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('committee')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (error) {
        console.error('Error fetching committee:', error)
      } else {
        setCommittee(data || [])
      }
      setLoading(false)
    }

    fetchCommittee()
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
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {locale === 'en' ? 'Management Committee' : 'व्यवस्थापन समिति'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {locale === 'en' 
                ? 'Meet our dedicated management committee members who guide our school towards excellence.'
                : 'हाम्रो विद्यालयलाई उत्कृष्टताको दिशामा डोर्याउने समर्पित व्यवस्थापन समितिका सदस्यहरूलाई चिन्नुहोस्।'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Committee Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {committee.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              {locale === 'en' 
                ? 'No committee members to display at the moment.'
                : 'अहिले देखाउनका लागि समितिका सदस्यहरू छैनन्।'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {committee.map((member) => (
              <CommitteeCard
                key={member.id}
                member={member}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
