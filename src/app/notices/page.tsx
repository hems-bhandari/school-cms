'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { 
  Calendar, 
  Download, 
  Tag, 
  AlertCircle, 
  Clock,
  Star,
  FileText,
  Filter,
  Megaphone,
  Bell
} from 'lucide-react'

interface Notice {
    id: number
    title_en: string
    title_ne: string
    content_en: string
    content_ne: string
    category: string
    priority: string
    published_date: string
    expiry_date?: string
    attachment_url?: string
    attachment_name?: string
    is_featured: boolean
    created_at: string
}

interface NoticeCardProps {
    notice: Notice
    locale: 'en' | 'ne'
    t: (key: string) => string
    index: number
}

function NoticeCard({ notice, locale, t, index }: NoticeCardProps) {
    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'urgent': return { 
                bg: 'from-red-500 to-red-600', 
                text: 'text-red-700', 
                bgLight: 'bg-red-50',
                borderColor: 'border-red-200',
                icon: AlertCircle
            }
            case 'high': return { 
                bg: 'from-orange-500 to-orange-600', 
                text: 'text-orange-700', 
                bgLight: 'bg-orange-50',
                borderColor: 'border-orange-200',
                icon: AlertCircle
            }
            case 'normal': return { 
                bg: 'from-blue-500 to-blue-600', 
                text: 'text-blue-700', 
                bgLight: 'bg-blue-50',
                borderColor: 'border-blue-200',
                icon: Bell
            }
            case 'low': return { 
                bg: 'from-gray-500 to-gray-600', 
                text: 'text-gray-700', 
                bgLight: 'bg-gray-50',
                borderColor: 'border-gray-200',
                icon: Bell
            }
            default: return { 
                bg: 'from-gray-500 to-gray-600', 
                text: 'text-gray-700', 
                bgLight: 'bg-gray-50',
                borderColor: 'border-gray-200',
                icon: Bell
            }
        }
    }

    const getCategoryConfig = (category: string) => {
        switch (category) {
            case 'academic': return { bg: 'bg-green-100', text: 'text-green-800', icon: FileText }
            case 'administrative': return { bg: 'bg-purple-100', text: 'text-purple-800', icon: Tag }
            case 'events': return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Calendar }
            case 'holidays': return { bg: 'bg-pink-100', text: 'text-pink-800', icon: Star }
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText }
        }
    }

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

    const priorityConfig = getPriorityConfig(notice.priority)
    const categoryConfig = getCategoryConfig(notice.category)
    const PriorityIcon = priorityConfig.icon
    const CategoryIcon = categoryConfig.icon

    return (
        <div 
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group animate-fadeInUp ${notice.is_featured ? 'ring-2 ring-blue-500/50' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100/50">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                            {locale === 'en' ? notice.title_en : notice.title_ne}
                        </h3>
                        
                        {/* Date and Featured Badge */}
                        <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Calendar size={12} className="text-blue-600" />
                                </div>
                                <span className="font-medium">{formatDate(notice.published_date)}</span>
                            </div>
                            
                            {notice.expiry_date && (
                                <div className="flex items-center space-x-2 text-sm text-orange-600">
                                    <Clock size={12} />
                                    <span className="font-medium">
                                        Expires: {formatDate(notice.expiry_date)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Priority and Category Badges */}
                    <div className="flex flex-col gap-2 ml-4">
                        {notice.is_featured && (
                            <div className="inline-flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                                <Star size={12} />
                                <span>{t('notices.featured')}</span>
                            </div>
                        )}
                        
                        <div className={`inline-flex items-center space-x-1 bg-gradient-to-r ${priorityConfig.bg} text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm`}>
                            <PriorityIcon size={12} />
                            <span>{t(`notices.priorities.${notice.priority}`)}</span>
                        </div>
                        
                        <div className={`inline-flex items-center space-x-1 ${categoryConfig.bg} ${categoryConfig.text} px-3 py-1 rounded-full text-xs font-medium`}>
                            <CategoryIcon size={12} />
                            <span>{t(`notices.categories.${notice.category}`)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="text-gray-700 leading-relaxed mb-4">
                    {locale === 'en' ? notice.content_en : notice.content_ne}
                </div>

                {/* Attachment */}
                {notice.attachment_url && notice.attachment_name && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-2 mb-2">
                            <FileText size={16} className="text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Attachment</span>
                        </div>
                        <a
                            href={notice.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
                        >
                            <Download size={16} className="group-hover:scale-110 transition-transform" />
                            <span className="truncate">{notice.attachment_name}</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function NoticesPage() {
    const { locale, t } = useLanguage()
    const [notices, setNotices] = useState<Notice[]>([])
    const [filteredNotices, setFilteredNotices] = useState<Notice[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const categories = ['all', 'academic', 'administrative', 'events', 'holidays', 'general']

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'academic': return FileText
            case 'administrative': return Tag
            case 'events': return Calendar
            case 'holidays': return Star
            case 'general': return Megaphone
            default: return FileText
        }
    }

    useEffect(() => {
        async function fetchNotices() {
            setLoading(true)
            const { data, error: err } = await supabase
                .from('notices')
                .select('*')
                .eq('is_published', true)
                .order('is_featured', { ascending: false })
                .order('published_date', { ascending: false })

            if (err) {
                setError(err.message)
            } else {
                // Filter out expired notices
                const currentDate = new Date().toISOString().split('T')[0]
                const activeNotices = (data || []).filter(notice =>
                    !notice.expiry_date || notice.expiry_date >= currentDate
                )
                setNotices(activeNotices)
                setFilteredNotices(activeNotices)
            }
            setLoading(false)
        }

        fetchNotices()
    }, [])

    useEffect(() => {
        if (selectedCategory === 'all') {
            setFilteredNotices(notices)
        } else {
            setFilteredNotices(notices.filter(notice => notice.category === selectedCategory))
        }
    }, [selectedCategory, notices])

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

    const featuredNotices = filteredNotices.filter(notice => notice.is_featured)
    const regularNotices = filteredNotices.filter(notice => !notice.is_featured)

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
                                {t('notices.title')}
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto animate-fadeInUp leading-relaxed" style={{ animationDelay: '200ms' }}>
                            {t('notices.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {/* Category Filter */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center space-x-2 text-gray-600 mb-4">
                            <Filter size={20} />
                            <span className="font-medium">Filter by Category</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map((category) => {
                            const IconComponent = category === 'all' ? Filter : getCategoryIcon(category)
                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                                        selectedCategory === category
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                            : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-white/20'
                                    }`}
                                >
                                    <IconComponent size={16} />
                                    <span>
                                        {category === 'all' ? 'All Notices' : t(`notices.categories.${category}`)}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Notices Content */}
                {filteredNotices.length > 0 ? (
                    <>
                        {/* Featured Notices */}
                        {featuredNotices.length > 0 && (
                            <div className="mb-16">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                        {locale === 'en' ? 'Featured Notices' : 'विशेष सूचनाहरू'}
                                    </h2>
                                    <p className="text-gray-600 max-w-2xl mx-auto">
                                        {locale === 'en' 
                                            ? 'Important announcements and urgent updates'
                                            : 'महत्वपूर्ण घोषणाहरू र तत्काल अपडेटहरू'
                                        }
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    {featuredNotices.map((notice, index) => (
                                        <NoticeCard key={notice.id} notice={notice} locale={locale} t={t} index={index} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Regular Notices */}
                        {regularNotices.length > 0 && (
                            <div>
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {locale === 'en' ? 'Recent Notices' : 'हालका सूचनाहरू'}
                                    </h2>
                                    <p className="text-gray-600 max-w-2xl mx-auto">
                                        {locale === 'en' 
                                            ? 'Stay updated with our latest announcements and information'
                                            : 'हाम्रा नवीनतम घोषणा र जानकारीहरूसँग अद्यावधिक रहनुहोस्'
                                        }
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    {regularNotices.map((notice, index) => (
                                        <NoticeCard 
                                            key={notice.id} 
                                            notice={notice} 
                                            locale={locale} 
                                            t={t} 
                                            index={index + featuredNotices.length} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
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
                                        <Megaphone className="text-gray-400" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-700 mb-2">{t('notices.noNotices')}</h3>
                                    <p className="text-gray-500">{t('notices.noNoticesDesc')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
