'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage()

  console.log('LanguageSwitcher state:', { locale })

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'ne' : 'en')
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'en' ? t('common.nepali') : t('common.english')}</span>
    </Button>
  )
}
