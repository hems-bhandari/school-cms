'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage()

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'ne' : 'en')
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="school-language-button"
      aria-label={locale === 'en' ? 'Switch language to Nepali' : 'Switch language to English'}
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'en' ? t('common.nepali') : t('common.english')}</span>
    </Button>
  )
}
