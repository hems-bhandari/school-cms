'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, MapPin, Menu, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Navigation() {
  const { t, locale } = useLanguage()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
      <div className="school-utility-bar">
        <div className="school-nav-shell">
          <span>{locale === 'en' ? 'Community School · Est. in Rupandehi' : 'सामुदायिक विद्यालय · रुपन्देही'}</span>
          <span className="school-utility-location"><MapPin aria-hidden="true" /> Omsatiya–3, Karuwani</span>
        </div>
      </div>

      <nav className="school-navigation" aria-label={locale === 'en' ? 'Main navigation' : 'मुख्य नेभिगेसन'}>
        <div className="school-nav-shell school-navigation__row">
          <Link href="/" className="school-brand" onClick={() => setIsMenuOpen(false)}>
            <span className="school-brand__mark"><GraduationCap aria-hidden="true" /></span>
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
