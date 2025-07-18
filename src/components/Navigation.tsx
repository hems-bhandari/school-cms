'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Menu, X, GraduationCap, Users, Calendar, Bell, User, Home, Info, FileText } from 'lucide-react'

export function Navigation() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigationItems = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/about', label: t('nav.about'), icon: Info },
    { href: '/teachers', label: t('nav.teachers'), icon: Users },
    { href: '/committee', label: t('nav.committee'), icon: User },
    { href: '/activities', label: t('nav.activities'), icon: Calendar },
    { href: '/notices', label: t('nav.notices'), icon: Bell },
    { href: '/documents', label: t('nav.documents'), icon: FileText },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-200">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  JJSS
                </span>
                <span className="text-xs text-gray-500 hidden lg:block">
                  Jana Jagriti Secondary School
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            {/* Admin Link */}
            {/* <Link
              href="/admin"
              className="ml-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-gray-900 hover:to-black transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {t('nav.admin')}
            </Link> */}
          </div>

          {/* Language Switcher & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-base transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              {/* Mobile Admin Link */}
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 bg-gray-800 text-white rounded-lg font-medium text-base hover:bg-gray-900 transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                <span>{t('nav.admin')}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
