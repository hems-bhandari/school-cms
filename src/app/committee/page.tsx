'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Navigation } from '@/components/Navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'
import { 
  Users
} from 'lucide-react'

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
  index: number
}

function CommitteeCard({ member, locale, index }: CommitteeCardProps) {
  const getRoleColor = (role: string) => {
    const roleL = role.toLowerCase()
    if (roleL.includes('chair') || roleL.includes('president') || roleL.includes('अध्यक्ष')) {
      return 'from-amber-500 to-orange-500'
    }
    if (roleL.includes('vice') || roleL.includes('उपाध्यक्ष')) {
      return 'from-purple-500 to-indigo-500'
    }
    if (roleL.includes('secretary') || roleL.includes('सचिव')) {
      return 'from-blue-500 to-cyan-500'
    }
    if (roleL.includes('treasurer') || roleL.includes('कोषाध्यक्ष')) {
      return 'from-green-500 to-emerald-500'
    }
    return 'from-gray-500 to-slate-500'
  }

  const roleColor = getRoleColor(locale === 'en' ? member.role_en : member.role_ne)

  return (
    <div 
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group animate-fadeInUp"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Photo Section */}
      <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={locale === 'en' ? member.name_en : member.name_ne}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {(locale === 'en' ? member.name_en : member.name_ne).charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        

      </div>
      
      {/* Content Section */}
      <div className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {locale === 'en' ? member.name_en : member.name_ne}
          </h3>
          <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${roleColor} text-white text-sm font-medium rounded-full shadow-lg`}>
            {locale === 'en' ? member.role_en : member.role_ne}
          </div>
        </div>
        
        {/* Bio Preview */}
        {((locale === 'en' && member.bio_en) || (locale === 'ne' && member.bio_ne)) && (
          <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            <p className="text-gray-600 text-sm leading-relaxed" style={{ 
              display: '-webkit-box', 
              WebkitLineClamp: 4, 
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {locale === 'en' ? member.bio_en : member.bio_ne}
            </p>
          </div>
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

  // Group committee members by role hierarchy
  const getHierarchy = (role: string) => {
    const roleL = role.toLowerCase()
    if (roleL.includes('chair') || roleL.includes('president') || roleL.includes('अध्यक्ष')) return 1
    if (roleL.includes('vice') || roleL.includes('उपाध्यक्ष')) return 2
    if (roleL.includes('secretary') || roleL.includes('सचिव')) return 3
    if (roleL.includes('treasurer') || roleL.includes('कोषाध्यक्ष')) return 4
    return 5
  }

  const sortedCommittee = [...committee].sort((a, b) => {
    const aHierarchy = getHierarchy(locale === 'en' ? a.role_en : a.role_ne)
    const bHierarchy = getHierarchy(locale === 'en' ? b.role_en : b.role_ne)
    if (aHierarchy !== bHierarchy) return aHierarchy - bHierarchy
    return a.display_order - b.display_order
  })

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
                {locale === 'en' ? 'Management Committee' : 'व्यवस्थापन समिति'}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto animate-fadeInUp leading-relaxed" style={{ animationDelay: '200ms' }}>
              {locale === 'en' 
                ? 'Meet our dedicated management committee members who guide our school towards excellence and ensure quality education for all students.'
                : 'हाम्रो विद्यालयलाई उत्कृष्टताको दिशामा डोर्याउने र सबै विद्यार्थीहरूको लागि गुणस्तरीय शिक्षा सुनिश्चित गर्ने समर्पित व्यवस्थापन समितिका सदस्यहरूलाई चिन्नुहोस्।'
              }
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {committee.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-xl max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {locale === 'en' ? 'No Committee Members Found' : 'समितिका सदस्यहरू भेटिएनन्'}
              </h3>
              <p className="text-gray-500">
                {locale === 'en' 
                  ? 'Committee member profiles will appear here once they are added.'
                  : 'समितिका सदस्यहरूको प्रोफाइल थपिएपछि यहाँ देखिनेछ।'
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Committee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedCommittee.map((member, index) => (
                <CommitteeCard
                  key={member.id}
                  member={member}
                  locale={locale}
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
