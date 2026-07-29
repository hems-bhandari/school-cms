'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Clock,
  Facebook,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSafeHref, getSafeHttpsUrl } from '@/lib/safe-url'

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

const fallbackFooter: FooterData = {
  id: 0,
  school_name_en: 'Shree Jana Jagriti Secondary School',
  school_name_ne: 'श्री जनजागृति माध्यमिक विद्यालय',
  address_en: 'Omsatiya–3, Karuwani, Rupandehi, Lumbini, Nepal',
  address_ne: 'ओमसतिया–३, करुवानी, रुपन्देही, लुम्बिनी, नेपाल',
  phone: '',
  email: '',
  office_hours_en: 'Sunday–Friday, during school hours',
  office_hours_ne: 'आइतबार–शुक्रबार, विद्यालय समय',
  facebook_url: null,
  twitter_url: null,
  instagram_url: null,
  youtube_url: null,
  linkedin_url: null,
  quick_links: [
    { label_en: 'About the school', label_ne: 'विद्यालय परिचय', url: '/about' },
    { label_en: 'Notices', label_ne: 'सूचनाहरू', url: '/notices' },
    { label_en: 'Documents', label_ne: 'कागजातहरू', url: '/documents' },
    { label_en: 'Faculty and staff', label_ne: 'शिक्षक तथा कर्मचारी', url: '/teachers' },
  ],
  logo_url: null,
  copyright_text_en: null,
  copyright_text_ne: null,
}

export default function Footer() {
  const { t, locale } = useLanguage()
  const [footerData, setFooterData] = useState<FooterData>(fallbackFooter)

  useEffect(() => {
    async function fetchFooterData() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('footer')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching footer:', error)
        return
      }

      if (data) setFooterData(data)
    }

    fetchFooterData()
  }, [])

  const socialLinks = [
    { name: 'Facebook', url: footerData.facebook_url, icon: Facebook },
    { name: 'Twitter', url: footerData.twitter_url, icon: Twitter },
    { name: 'Instagram', url: footerData.instagram_url, icon: Instagram },
    { name: 'YouTube', url: footerData.youtube_url, icon: Youtube },
    { name: 'LinkedIn', url: footerData.linkedin_url, icon: Linkedin },
  ]

  return (
    <footer className="school-footer">
      <div className="school-footer__main">
        <div className="school-footer__identity">
          <div className="school-footer__title">
            <span className="school-footer__mark"><GraduationCap aria-hidden="true" /></span>
            <h2>{locale === 'en' ? footerData.school_name_en : footerData.school_name_ne}</h2>
          </div>
          <p><MapPin aria-hidden="true" /> {locale === 'en' ? footerData.address_en : footerData.address_ne}</p>
          <p className="school-footer__statement">
            {locale === 'en'
              ? 'Knowledge, discipline and service in partnership with our community.'
              : 'समुदायसँगको सहकार्यमा ज्ञान, अनुशासन र सेवा।'}
          </p>
        </div>

        <div>
          <h2>{t('footer.getInTouch')}</h2>
          <address className="school-footer__contact">
            {footerData.phone && <a href={`tel:${footerData.phone}`}><Phone aria-hidden="true" />{footerData.phone}</a>}
            {footerData.email && <a href={`mailto:${footerData.email}`}><Mail aria-hidden="true" />{footerData.email}</a>}
            {(footerData.office_hours_en || footerData.office_hours_ne) && (
              <span><Clock aria-hidden="true" />{locale === 'en' ? footerData.office_hours_en : footerData.office_hours_ne}</span>
            )}
          </address>
        </div>

        <div>
          <h2>{t('footer.quickLinks')}</h2>
          <ul className="school-footer__links">
            {footerData.quick_links.map((link, index) => {
              const href = getSafeHref(link.url)
              return href ? <li key={`${link.url}-${index}`}><Link href={href}>{locale === 'en' ? link.label_en : link.label_ne}</Link></li> : null
            })}
          </ul>
        </div>

        <div>
          <h2>{t('footer.followUs')}</h2>
          <div className="school-footer__socials">
            {socialLinks.map((social) => {
              const Icon = social.icon
              const href = getSafeHttpsUrl(social.url)
              return href ? (
                <a key={social.name} href={href} target="_blank" rel="noopener noreferrer" aria-label={social.name}>
                  <Icon aria-hidden="true" />
                </a>
              ) : null
            })}
          </div>
        </div>
      </div>

      <div className="school-footer__bottom">
        <p>
          {locale === 'en'
            ? footerData.copyright_text_en || `© ${new Date().getFullYear()} ${footerData.school_name_en}. ${t('footer.allRightsReserved')}`
            : footerData.copyright_text_ne || `© ${new Date().getFullYear()} ${footerData.school_name_ne}। ${t('footer.allRightsReserved')}`}
        </p>
      </div>
    </footer>
  )
}
