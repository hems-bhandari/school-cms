'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Navigation } from '@/components/Navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Star, 
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon,
  Activity as ActivityIcon
} from 'lucide-react'

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
  index: number
}

function ActivityCard({ activity, locale, onClick, index }: ActivityCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (locale === 'en') {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } else {
      return date.toLocaleDateString('ne-NP', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div 
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group animate-fadeInUp"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
        {activity.preview_img_url ? (
          <Image
            src={activity.preview_img_url}
            alt={locale === 'en' ? activity.title_en : activity.title_ne}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ActivityIcon className="w-16 h-16" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Featured Badge */}
        {activity.is_featured && (
          <div className="absolute top-4 left-4 inline-flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            <Star size={12} />
            <span>{locale === 'en' ? 'Featured' : 'विशेष'}</span>
          </div>
        )}
        
        {/* Gallery Indicator */}
        {activity.gallery_urls && activity.gallery_urls.length > 0 && (
          <div className="absolute top-4 right-4 inline-flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
            <ImageIcon size={12} />
            <span>{activity.gallery_urls.length + 1}</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Date */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar size={14} className="text-blue-600" />
          </div>
          <span className="text-sm text-gray-600 font-medium">{formatDate(activity.event_date)}</span>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
          {locale === 'en' ? activity.title_en : activity.title_ne}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4" style={{ 
          display: '-webkit-box', 
          WebkitLineClamp: 3, 
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {locale === 'en' ? activity.description_en : activity.description_ne}
        </p>
        
        {/* View Details */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-1 text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
            <Eye size={14} />
            <span>{locale === 'en' ? 'View Details' : 'विस्तार हेर्नुहोस्'}</span>
          </div>
          
          {activity.gallery_urls && activity.gallery_urls.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {activity.gallery_urls.length + 1} {locale === 'en' ? 'photos' : 'तस्बिरहरू'}
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1 pr-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {locale === 'en' ? activity.title_en : activity.title_ne}
              </h2>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{formatDate(activity.event_date)}</span>
                </div>
                {activity.is_featured && (
                  <div className="inline-flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <Star size={14} />
                    <span>{locale === 'en' ? 'Featured Event' : 'विशेष कार्यक्रम'}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Image Gallery */}
          {allImages.length > 0 && (
            <div className="mb-8">
              <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-6">
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
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                )}
              </div>
              
              {/* Thumbnail navigation */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all ${
                        index === currentImageIndex 
                          ? 'border-blue-500 shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">
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

  const featuredActivities = activities.filter(activity => activity.is_featured)
  const regularActivities = activities.filter(activity => !activity.is_featured)

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
                {locale === 'en' ? 'School Activities' : 'विद्यालयका गतिविधिहरू'}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto animate-fadeInUp leading-relaxed" style={{ animationDelay: '200ms' }}>
              {locale === 'en' 
                ? 'Explore our vibrant school life through various events, competitions, and cultural programs that shape our students\' educational journey.'
                : 'हाम्रा विद्यार्थीहरूको शैक्षिक यात्रालाई आकार दिने विभिन्न कार्यक्रम, प्रतियोगिता र सांस्कृतिक कार्यक्रमहरू मार्फत हाम्रो जीवन्त विद्यालयी जीवनको अन्वेषण गर्नुहोस्।'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Activities Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {activities.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-xl max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ActivityIcon className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {locale === 'en' ? 'No Activities Found' : 'कुनै गतिविधि भेटिएन'}
              </h3>
              <p className="text-gray-500">
                {locale === 'en' 
                  ? 'Activities will appear here once they are published.'
                  : 'गतिविधिहरू प्रकाशित भएपछि यहाँ देखिनेछन्।'
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Activities */}
            {featuredActivities.length > 0 && (
              <div className="mb-16">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {locale === 'en' ? 'Featured Activities' : 'विशेष गतिविधिहरू'}
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {locale === 'en' 
                      ? 'Highlighting our most significant events and achievements'
                      : 'हाम्रा सबैभन्दा महत्वपूर्ण कार्यक्रम र उपलब्धिहरूलाई हाइलाइट गर्दै'
                    }
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredActivities.map((activity, index) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      locale={locale}
                      onClick={() => setSelectedActivity(activity)}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Activities */}
            {regularActivities.length > 0 && (
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {locale === 'en' ? 'Recent Activities' : 'हालका गतिविधिहरू'}
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {locale === 'en' 
                      ? 'Stay updated with our latest events and student achievements'
                      : 'हाम्रा नवीनतम कार्यक्रम र विद्यार्थी उपलब्धिहरूसँग अद्यावधिक रहनुहोस्'
                    }
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularActivities.map((activity, index) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      locale={locale}
                      onClick={() => setSelectedActivity(activity)}
                      index={index + featuredActivities.length}
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
