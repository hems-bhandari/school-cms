'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Navigation } from '@/components/Navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'
import { Calendar, Users } from 'lucide-react'

interface Activity {
  id: number
  title_en: string
  title_ne: string
  description_en: string
  description_ne: string
  preview_img_url: string | null
  gallery_urls: string[] | null
  event_date: string
  is_featured: boolean
  is_published: boolean
  display_order: number
  created_at: string
}

interface ActivityCardProps {
  activity: Activity
  locale: 'en' | 'ne'
  onClick: () => void
}

function ActivityCard({ activity, locale, onClick }: ActivityCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (locale === 'en') {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } else {
      return date.toLocaleDateString('ne-NP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
        {activity.preview_img_url ? (
          <Image
            src={activity.preview_img_url}
            alt={locale === 'en' ? activity.title_en : activity.title_ne}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Users className="w-16 h-16" />
          </div>
        )}
        {activity.is_featured && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {locale === 'en' ? 'Featured' : 'विशेष'}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{formatDate(activity.event_date)}</span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {locale === 'en' ? activity.title_en : activity.title_ne}
        </h3>
        
        <p className="text-gray-700 text-sm leading-relaxed" style={{ 
          display: '-webkit-box', 
          WebkitLineClamp: 3, 
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {locale === 'en' ? activity.description_en : activity.description_ne}
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-blue-600 text-sm font-medium">
            {locale === 'en' ? 'View Details' : 'विस्तार हेर्नुहोस्'}
          </span>
          {activity.gallery_urls && activity.gallery_urls.length > 0 && (
            <span className="text-xs text-gray-500">
              {activity.gallery_urls.length} {locale === 'en' ? 'photos' : 'तस्बिरहरू'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface ActivityModalProps {
  activity: Activity
  locale: 'en' | 'ne'
  onClose: () => void
}

function ActivityModal({ activity, locale, onClose }: ActivityModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const allImages = [
    ...(activity.preview_img_url ? [activity.preview_img_url] : []),
    ...(activity.gallery_urls || [])
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (locale === 'en') {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } else {
      return date.toLocaleDateString('ne-NP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {locale === 'en' ? activity.title_en : activity.title_ne}
              </h2>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(activity.event_date)}</span>
                {activity.is_featured && (
                  <span className="ml-3 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                    {locale === 'en' ? 'Featured Event' : 'विशेष कार्यक्रम'}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image Gallery */}
          {allImages.length > 0 && (
            <div className="mb-6">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={allImages[currentImageIndex]}
                  alt={locale === 'en' ? activity.title_en : activity.title_ne}
                  fill
                  className="object-cover"
                />
                
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                )}
              </div>
              
              {/* Thumbnail navigation */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              {locale === 'en' ? 'About this Activity' : 'यस गतिविधिको बारेमा'}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {locale === 'en' ? activity.description_en : activity.description_ne}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ActivitiesPage() {
  const { locale, t } = useLanguage()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: false })

      if (error) {
        console.error('Error fetching activities:', error)
      } else {
        setActivities(data || [])
      }
      setLoading(false)
    }

    fetchActivities()
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

  const featuredActivities = activities.filter(activity => activity.is_featured)
  const regularActivities = activities.filter(activity => !activity.is_featured)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {locale === 'en' ? 'School Activities' : 'विद्यालयका गतिविधिहरू'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {locale === 'en' 
                ? 'Explore our vibrant school life through various events, competitions, and cultural programs that shape our students\' educational journey.'
                : 'हाम्रा विद्यार्थीहरूको शैक्षिक यात्रालाई आकार दिने विभिन्न कार्यक्रम, प्रतियोगिता र सांस्कृतिक कार्यक्रमहरू मार्फत हाम्रो जीवन्त विद्यालयी जीवनको अन्वेषण गर्नुहोस्।'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Activities Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activities.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {locale === 'en' 
                ? 'No activities to display at the moment.'
                : 'अहिले देखाउनका लागि कुनै गतिविधिहरू छैनन्।'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Featured Activities */}
            {featuredActivities.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {locale === 'en' ? 'Featured Activities' : 'विशेष गतिविधिहरू'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      locale={locale}
                      onClick={() => setSelectedActivity(activity)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Activities */}
            {regularActivities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {locale === 'en' ? 'Recent Activities' : 'हालका गतिविधिहरू'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      locale={locale}
                      onClick={() => setSelectedActivity(activity)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          locale={locale}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  )
}
