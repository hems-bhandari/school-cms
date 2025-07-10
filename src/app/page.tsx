'use client'

import { useState, useEffect } from 'react'
import Link from "next/link";
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { createClient } from '@/lib/supabase-client'
import { generateSchoolSchema } from '@/lib/seo'
import SEOSchema from '@/components/SEOSchema'

interface FooterData {
  school_name_en: string
  school_name_ne: string
  address_en: string
  address_ne: string
  phone: string
  email: string
  logo_url?: string
  facebook_url?: string
  twitter_url?: string
  instagram_url?: string
  youtube_url?: string
  linkedin_url?: string
}

export default function Home() {
  const { t, locale } = useLanguage()
  const [footerData, setFooterData] = useState<FooterData | null>(null)

  useEffect(() => {
    async function fetchSchoolData() {
      const supabase = createClient()
      const { data } = await supabase
        .from('footer')
        .select('*')
        .eq('is_active', true)
        .single()
      
      if (data) {
        setFooterData(data)
      }
    }
    fetchSchoolData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Schema.org structured data */}
      {footerData && (
        <SEOSchema schema={generateSchoolSchema(footerData, locale)} />
      )}
      
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Link 
              href="/about"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              {t('home.aboutStats')}
            </Link>
            <Link 
              href="/teachers"
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              {t('nav.teachers')}
            </Link>
            <Link 
              href="/admin"
              className="bg-gray-800 text-white px-8 py-4 rounded-lg hover:bg-gray-900 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              {t('home.admin')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
