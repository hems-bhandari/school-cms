'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { createClient } from '@/lib/supabase-client'
import { getSafeHttpsUrl } from '@/lib/safe-url'
import { LanguageSwitcher } from './LanguageSwitcher'

const SCHOOL_LOGO_URL = 'https://wdlsxqexgzijxzydhkji.supabase.co/storage/v1/object/public/footer-assets/ed5smwrniva-1752853842602.jpg'

export function Navigation() {
  const { t, locale } = useLanguage()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState(SCHOOL_LOGO_URL)

  useEffect(() => {
    async function loadSchoolLogo() {
      const supabase = createClient()
      const { data } = await supabase
        .from('footer')
        .select('logo_url')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const configuredLogoUrl = getSafeHttpsUrl(data?.logo_url)
      if (configuredLogoUrl) setLogoUrl(configuredLogoUrl)
    }

    loadSchoolLogo()
  }, [])

  const navigationItems = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/teachers', label: t('nav.teachers') },
    { href: '/committee', label: t('nav.committee') },
    { href: '/activities', label: t('nav.activities') },
    { href: '/notices', label: t('nav.notices') },
    { href: '/documents', label: t('nav.documents') },
  ]

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="official-site-header">
      <nav className="school-navigation" aria-label={locale === 'en' ? 'Main navigation' : 'मुख्य नेभिगेसन'}>
        <div className="school-nav-shell school-navigation__row">
          <Link href="/" className="school-brand" onClick={() => setIsMenuOpen(false)}>
            <span className="school-brand__mark school-brand__mark--logo">
              <Image src={logoUrl} alt="Shree Jana Jagriti Secondary School logo" width={64} height={64} priority />
            </span>
            <span className="school-brand__name">
              <strong>{locale === 'en' ? 'Jana Jagriti Secondary School' : 'जनजागृति माध्यमिक विद्यालय'}</strong>
              <small>JJSS · ज्ञान, अनुशासन र सेवा</small>
            </span>
          </Link>

          <div className="school-navigation__links">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? 'is-active' : undefined}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="school-navigation__tools">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="school-menu-button"
              aria-expanded={isMenuOpen}
              aria-controls="school-mobile-navigation"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div id="school-mobile-navigation" className={`school-mobile-navigation${isMenuOpen ? ' is-open' : ''}`}>
          <div className="school-nav-shell">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={isActive(item.href) ? 'is-active' : undefined}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
