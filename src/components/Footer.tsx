'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin 
} from 'lucide-react'

interface QuickLink {
  label_en: string
  label_ne: string
  url: string
}

interface FooterData {
  id: number
  school_name_en: string
  school_name_ne: string
  address_en: string
  address_ne: string
  phone: string
  email: string
  office_hours_en: string | null
  office_hours_ne: string | null
  facebook_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  linkedin_url: string | null
  quick_links: QuickLink[]
  logo_url: string | null
  copyright_text_en: string | null
  copyright_text_ne: string | null
}

export default function Footer() {
  const { t, locale } = useLanguage()
  const [footerData, setFooterData] = useState<FooterData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFooterData() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('footer')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .single()

      if (error) {
        console.error('Error fetching footer:', error)
      } else {
        setFooterData(data)
      }
      setLoading(false)
    }

    fetchFooterData()
  }, [])

  if (loading || !footerData) {
    return null
  }

  const socialLinks = [
    { name: 'Facebook', url: footerData.facebook_url, icon: Facebook },
    { name: 'Twitter', url: footerData.twitter_url, icon: Twitter },
    { name: 'Instagram', url: footerData.instagram_url, icon: Instagram },
    { name: 'YouTube', url: footerData.youtube_url, icon: Youtube },
    { name: 'LinkedIn', url: footerData.linkedin_url, icon: Linkedin }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              {footerData.logo_url && (
                <Image
                  src={footerData.logo_url}
                  alt="School Logo"
                  width={40}
                  height={40}
                  className="mr-3"
                />
              )}
              <h3 className="text-lg font-semibold">
                {locale === 'en' ? footerData.school_name_en : footerData.school_name_ne}
              </h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {locale === 'en' ? footerData.address_en : footerData.address_ne}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.getInTouch')}</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-gray-400" />
                <span className="text-gray-300 text-sm">{footerData.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-gray-400" />
                <span className="text-gray-300 text-sm">{footerData.email}</span>
              </div>
              {(footerData.office_hours_en || footerData.office_hours_ne) && (
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mr-3 mt-0.5 text-gray-400" />
                  <span className="text-gray-300 text-sm">
                    {locale === 'en' ? footerData.office_hours_en : footerData.office_hours_ne}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {footerData.quick_links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="text-gray-300 text-sm hover:text-white transition-colors"
                  >
                    {locale === 'en' ? link.label_en : link.label_ne}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.followUs')}</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return social.url && (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="sr-only">{social.name}</span>
                    <IconComponent className="w-6 h-6" aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {locale === 'en' 
                ? footerData.copyright_text_en || `© ${new Date().getFullYear()} ${footerData.school_name_en}. ${t('footer.allRightsReserved')}`
                : footerData.copyright_text_ne || `© ${new Date().getFullYear()} ${footerData.school_name_ne}। ${t('footer.allRightsReserved')}`
              }
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-xs">
                Made voluntarily by {' '}
                <a 
                  href="hemss.me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Hems
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
