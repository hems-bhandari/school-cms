'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Navigation } from '@/components/Navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'
import { 
  Building,
  Users2
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
  committee_type: string
}

interface CommitteeContent {
  id: number
  committee_type: string
  title_en: string
  title_ne: string
  description_en: string | null
  description_ne: string | null
  is_active: boolean
}

interface CommitteeCardProps {
  member: Committee
  locale: 'en' | 'ne'
}

function CommitteeCard({ member, locale }: CommitteeCardProps) {
  return (
    <article className="overflow-hidden border border-slate-200 bg-white">
      {/* Photo Section */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-slate-100">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={locale === 'en' ? member.name_en : member.name_ne}
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-sm bg-[#0b2545] text-3xl font-bold text-white">
            {(locale === 'en' ? member.name_en : member.name_ne).charAt(0)}
          </div>
        )}
        {/* Committee Type Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
            {member.committee_type}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {locale === 'en' ? member.name_en : member.name_ne}
          </h3>
          <p className="text-sm font-semibold text-[#0b2545]">
            {locale === 'en' ? member.role_en : member.role_ne}
          </p>
        </div>
        
        {/* Bio Preview */}
        {((locale === 'en' && member.bio_en) || (locale === 'ne' && member.bio_ne)) && (
          <div className="mt-4 border-t border-slate-200 pt-4">
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
    </article>
  )
}

export default function CommitteePage() {
  const { locale, t } = useLanguage()
  const [committee, setCommittee] = useState<Committee[]>([])
  const [committeeContent, setCommitteeContent] = useState<CommitteeContent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'SMC' | 'PTA'>('SMC')

  useEffect(() => {
    async function fetchCommittee() {
      const supabase = createClient()
      const [committeeResult, contentResult] = await Promise.all([
        supabase
          .from('committee')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
        supabase
          .from('committee_content')
          .select('*')
          .eq('is_active', true)
      ])

      if (committeeResult.error) {
        console.error('Error fetching committee:', committeeResult.error)
      } else {
        setCommittee(committeeResult.data || [])
      }

      if (contentResult.error) {
        console.error('Error fetching committee content:', contentResult.error)
      } else {
        setCommitteeContent(contentResult.data || [])
      }
      
      setLoading(false)
    }

    fetchCommittee()
  }, [])

  if (loading) {
    return (
      <div className="public-page min-h-screen">
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

  // Group committee members by committee type
  const smcMembers = committee.filter(member => member.committee_type === 'SMC')
  const ptaMembers = committee.filter(member => member.committee_type === 'PTA')

  // Get content for each committee type
  const smcContent = committeeContent.find(content => content.committee_type === 'SMC')
  const ptaContent = committeeContent.find(content => content.committee_type === 'PTA')

  // Sort members by hierarchy
  const getHierarchy = (role: string) => {
    const roleL = role.toLowerCase()
    if (roleL.includes('chair') || roleL.includes('president') || roleL.includes('अध्यक्ष')) return 1
    if (roleL.includes('vice') || roleL.includes('उपाध्यक्ष')) return 2
    if (roleL.includes('secretary') || roleL.includes('सचिव')) return 3
    if (roleL.includes('treasurer') || roleL.includes('कोषाध्यक्ष')) return 4
    return 5
  }

  const sortMembers = (members: Committee[]) => {
    return [...members].sort((a, b) => {
      const aHierarchy = getHierarchy(locale === 'en' ? a.role_en : a.role_ne)
      const bHierarchy = getHierarchy(locale === 'en' ? b.role_en : b.role_ne)
      if (aHierarchy !== bHierarchy) return aHierarchy - bHierarchy
      return a.display_order - b.display_order
    })
  }

  const sortedSmcMembers = sortMembers(smcMembers)
  const sortedPtaMembers = sortMembers(ptaMembers)

  return (
    <div className="public-page min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="official-page-header">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp">
              {locale === 'en' ? 'School Committees' : 'विद्यालय समितिहरू'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto animate-fadeInUp leading-relaxed" style={{ animationDelay: '200ms' }}>
              {locale === 'en' 
                ? 'Meet our dedicated committee members who guide our school towards excellence and ensure quality education for all students.'
                : 'हाम्रो विद्यालयलाई उत्कृष्टताको दिशामा डोर्याउने र सबै विद्यार्थीहरूको लागि गुणस्तरीय शिक्षा सुनिश्चित गर्ने समर्पित समितिका सदस्यहरूलाई चिन्नुहोस्।'
              }
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('SMC')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'SMC'
                    ? 'bg-[#0b2545] text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Building size={20} />
                <span>SMC</span>
              </button>
              <button
                onClick={() => setActiveTab('PTA')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'PTA'
                    ? 'bg-[#0b2545] text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Users2 size={20} />
                <span>PTA</span>
              </button>
            </div>
          </div>
        </div>

        {/* SMC Section */}
        {activeTab === 'SMC' && (
          <div className="animate-fadeInUp">
            {/* SMC Content */}
            {smcContent && (
              <div className="text-center mb-12">
                <h2 className="mb-6 text-3xl font-bold text-[#0b2545] md:text-4xl">
                  {locale === 'en' ? smcContent.title_en : smcContent.title_ne}
                </h2>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  {locale === 'en' ? smcContent.description_en : smcContent.description_ne}
                </p>
              </div>
            )}

            {/* SMC Members */}
            {sortedSmcMembers.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-xl max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    {locale === 'en' ? 'No SMC Members Found' : 'एसएमसी सदस्यहरू भेटिएनन्'}
                  </h3>
                  <p className="text-gray-500">
                    {locale === 'en' 
                      ? 'SMC member profiles will appear here once they are added.'
                      : 'एसएमसी सदस्यहरूको प्रोफाइल थपिएपछि यहाँ देखिनेछ।'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {sortedSmcMembers.map((member) => (
                  <CommitteeCard
                    key={member.id}
                    member={member}
                      locale={locale}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PTA Section */}
        {activeTab === 'PTA' && (
          <div className="animate-fadeInUp">
            {/* PTA Content */}
            {ptaContent && (
              <div className="text-center mb-12">
                <h2 className="mb-6 text-3xl font-bold text-[#0b2545] md:text-4xl">
                  {locale === 'en' ? ptaContent.title_en : ptaContent.title_ne}
                </h2>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  {locale === 'en' ? ptaContent.description_en : ptaContent.description_ne}
                </p>
              </div>
            )}

            {/* PTA Members */}
            {sortedPtaMembers.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-xl max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users2 className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    {locale === 'en' ? 'No PTA Members Found' : 'पीटीए सदस्यहरू भेटिएनन्'}
                  </h3>
                  <p className="text-gray-500">
                    {locale === 'en' 
                      ? 'PTA member profiles will appear here once they are added.'
                      : 'पीटीए सदस्यहरूको प्रोफाइल थपिएपछि यहाँ देखिनेछ।'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {sortedPtaMembers.map((member) => (
                  <CommitteeCard
                    key={member.id}
                    member={member}
                      locale={locale}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
