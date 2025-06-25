'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function DebugPage() {
  const { locale, t } = useLanguage()

  const testKeys = [
    'common.nepali',
    'common.english', 
    'home.title',
    'admin.title',
    'nav.home'
  ]

  return (
    <div className="p-8">
      <h1>Translation Debug</h1>
      <p>Current locale: {locale}</p>
      
      <div className="mt-4">
        <h2>Test Translations:</h2>
        {testKeys.map(key => (
          <div key={key} className="border p-2 mb-2">
            <strong>{key}:</strong> &quot;{t(key)}&quot;
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <h2>Direct Tests:</h2>
        <p>common.nepali: {t('common.nepali')}</p>
        <p>common.english: {t('common.english')}</p>
      </div>
    </div>
  )
}
