'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { Calendar, Download, Tag, AlertCircle } from 'lucide-react'

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
}

function NoticeCard({ notice, locale, t }: NoticeCardProps) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'academic': return 'bg-green-100 text-green-800'
            case 'administrative': return 'bg-purple-100 text-purple-800'
            case 'events': return 'bg-yellow-100 text-yellow-800'
            case 'holidays': return 'bg-pink-100 text-pink-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'ne-NP')
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${notice.is_featured ? 'ring-2 ring-blue-500' : ''}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1">
                        {locale === 'en' ? notice.title_en : notice.title_ne}
                        {notice.is_featured && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {t('notices.featured')}
                            </span>
                        )}
                    </h3>
                    <div className="flex flex-col gap-2 ml-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {t(`notices.priorities.${notice.priority}`)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
                            <Tag className="w-3 h-3 mr-1" />
                            {t(`notices.categories.${notice.category}`)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(notice.published_date)}</span>
                    {notice.expiry_date && (
                        <span className="ml-4 text-orange-600">
                            Expires: {formatDate(notice.expiry_date)}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="text-gray-700 leading-relaxed mb-4">
                    {locale === 'en' ? notice.content_en : notice.content_ne}
                </div>

                {/* Attachment */}
                {notice.attachment_url && notice.attachment_name && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <a
                            href={notice.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {notice.attachment_name}
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
                        {t('notices.title')}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {t('notices.subtitle')}
                    </p>
                </div>

                {/* Category Filter */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {category === 'all' ? 'All' : t(`notices.categories.${category}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notices Grid */}
                {filteredNotices.length > 0 ? (
                    <div className="space-y-6">
                        {filteredNotices.map((notice) => (
                            <NoticeCard key={notice.id} notice={notice} locale={locale} t={t} />
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
                                    <p className="font-semibold mb-2">{t('notices.noNotices')}</p>
                                    <p className="text-sm">{t('notices.noNoticesDesc')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
