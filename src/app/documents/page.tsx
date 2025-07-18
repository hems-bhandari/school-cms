'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Download, FileText, Calendar, Eye, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'

interface Document {
  id: number
  title_en: string
  title_ne: string
  description_en: string
  description_ne: string
  category_en: string
  category_ne: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  is_featured: boolean
  upload_date: string
  download_count: number
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const { language } = useLanguage()
  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('is_public', true)
        .order('is_featured', { ascending: false })
        .order('upload_date', { ascending: false })
      
      if (error) throw error
      
      const docs = data || []
      setDocuments(docs)
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(docs.map(doc => language === 'en' ? doc.category_en : doc.category_ne))
      )
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      // Increment download count
      await supabase
        .from('documents')
        .update({ download_count: doc.download_count + 1 })
        .eq('id', doc.id)
      
      // Open file in new tab
      window.open(doc.file_url, '_blank')
      
      // Update local state
      setDocuments(docs => 
        docs.map(d => 
          d.id === doc.id 
            ? { ...d, download_count: d.download_count + 1 }
            : d
        )
      )
    } catch (error) {
      console.error('Error tracking download:', error)
      // Still open the file even if tracking fails
      window.open(doc.file_url, '_blank')
    }
  }

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => 
        (language === 'en' ? doc.category_en : doc.category_ne) === selectedCategory
      )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'en' ? 'en-US' : 'ne-NP',
      { year: 'numeric', month: 'long', day: 'numeric' }
    )
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Documents & Resources' : 'कागजातहरू र स्रोतहरू'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'en' 
              ? 'Access important school documents, forms, and resources. Download what you need for your academic journey.'
              : 'महत्वपूर्ण विद्यालय कागजातहरू, फारमहरू, र स्रोतहरू पहुँच गर्नुहोस्। तपाईंको शैक्षिक यात्राको लागि आवश्यक कुराहरू डाउनलोड गर्नुहोस्।'
            }
          </p>
        </div>

        {/* Featured Documents */}
        {documents.some(doc => doc.is_featured) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              {language === 'en' ? 'Featured Documents' : 'विशेष कागजातहरू'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents
                .filter(doc => doc.is_featured)
                .slice(0, 3)
                .map((doc) => (
                  <div key={doc.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <FileText className="h-8 w-8 text-indigo-600" />
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {language === 'en' ? 'Featured' : 'विशेष'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {language === 'en' ? doc.title_en : doc.title_ne}
                      </h3>
                      {(doc.description_en || doc.description_ne) && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {language === 'en' ? doc.description_en : doc.description_ne}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {language === 'en' ? doc.category_en : doc.category_ne}
                        </span>
                        <span>{formatFileSize(doc.file_size)}</span>
                      </div>
                      <Button 
                        onClick={() => handleDownload(doc)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Download' : 'डाउनलोड'}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="mb-2"
            >
              {language === 'en' ? 'All Documents' : 'सबै कागजातहरू'}
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="mb-2"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {language === 'en' ? 'No documents found.' : 'कुनै कागजातहरू फेला परेन।'}
              </p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <FileText className="h-8 w-8 text-indigo-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {language === 'en' ? doc.title_en : doc.title_ne}
                        </h3>
                        {doc.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      {(doc.description_en || doc.description_ne) && (
                        <p className="text-gray-600 mb-3">
                          {language === 'en' ? doc.description_en : doc.description_ne}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {language === 'en' ? doc.category_en : doc.category_ne}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(doc.upload_date)}
                        </span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {doc.download_count} {language === 'en' ? 'downloads' : 'डाउनलोडहरू'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleDownload(doc)}
                    className="bg-indigo-600 hover:bg-indigo-700 ml-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Download' : 'डाउनलोड'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  )
}
