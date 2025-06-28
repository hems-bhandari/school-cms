'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'

export type Locale = 'en' | 'ne'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

// Simple translations
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.teachers': 'Teachers',
    'nav.committee': 'Committee',
    'nav.notices': 'Notices',
    'nav.activities': 'Activities',
    'nav.admin': 'Admin',
    'nav.language': 'Language',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.english': 'English',
    'common.nepali': 'नेपाली',
    'common.experience': 'Experience',
    'common.years': 'years',
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.qualifications': 'Qualifications',
    'common.specialization': 'Specialization',
    'common.contact': 'Contact',
    
    // About Page
    'about.title': 'About Our School',
    'about.stats.title': 'School Statistics',
    'about.loading': 'Loading...',
    'about.error': 'Error loading content',
    
    // Teachers Page
    'teachers.title': 'Our Teachers',
    'teachers.subtitle': 'Meet our dedicated team of experienced educators who are committed to providing quality education and nurturing the next generation of leaders.',
    'teachers.noTeachers': 'No Teachers Found',
    'teachers.noTeachersDesc': 'Teacher profiles will appear here once they are added.',
    'teachers.dataStatus': 'Teachers Data',
    'teachers.loaded': 'teachers loaded',
    
    // Notices Page
    'notices.title': 'School Notices',
    'notices.subtitle': 'Stay updated with the latest announcements, events, and important information from our school.',
    'notices.noNotices': 'No Notices Found',
    'notices.noNoticesDesc': 'Notices and announcements will appear here once they are published.',
    'notices.category': 'Category',
    'notices.priority': 'Priority',
    'notices.publishedDate': 'Published Date',
    'notices.expiryDate': 'Expiry Date',
    'notices.attachment': 'Attachment',
    'notices.featured': 'Featured',
    'notices.published': 'Published',
    'notices.categories.academic': 'Academic',
    'notices.categories.administrative': 'Administrative',
    'notices.categories.events': 'Events',
    'notices.categories.holidays': 'Holidays',
    'notices.categories.general': 'General',
    'notices.priorities.low': 'Low',
    'notices.priorities.normal': 'Normal',
    'notices.priorities.high': 'High',
    'notices.priorities.urgent': 'Urgent',
    'notices.readMore': 'Read More',
    'notices.downloadAttachment': 'Download Attachment',
    
    // Home Page
    'home.title': 'School CMS',
    'home.subtitle': 'Testing Supabase integration with bilingual content.',
    'home.aboutStats': 'About & Stats',
    'home.admin': 'Admin Dashboard',
    
    // Admin
    'admin.title': 'Admin Dashboard',
    'admin.login': 'Admin Login',
    'admin.logout': 'Logout',
    'admin.email': 'Email',
    'admin.password': 'Password',
    'admin.signIn': 'Sign In',
    'admin.signOut': 'Sign Out',
    'admin.welcome': 'Welcome to Admin Dashboard',
    'admin.about': 'About Content',
    'admin.stats': 'Statistics',
    'admin.teachers': 'Teachers',
    'admin.aboutDesc': 'Manage about page content in both languages',
    'admin.statsDesc': 'Add and manage school statistics',
    'admin.teachersDesc': 'Manage teacher profiles and information',
  },
  ne: {
    // Navigation
    'nav.home': 'होम',
    'nav.about': 'हाम्रो बारेमा',
    'nav.teachers': 'शिक्षकहरू',
    'nav.committee': 'व्यवस्थापन समिति',
    'nav.notices': 'सूचनाहरू',
    'nav.activities': 'गतिविधिहरू',
    'nav.admin': 'एडमिन',
    'nav.language': 'भाषा',
    
    // Common
    'common.loading': 'लोड हुँदैछ...',
    'common.error': 'त्रुटि भयो',
    'common.save': 'सेभ गर्नुहोस्',
    'common.cancel': 'रद्द गर्नुहोस्',
    'common.delete': 'मेटाउनुहोस्',
    'common.edit': 'सम्पादन गर्नुहोस्',
    'common.create': 'सिर्जना गर्नुहोस्',
    'common.english': 'English',
    'common.nepali': 'नेपाली',
    'common.experience': 'अनुभव',
    'common.years': 'वर्ष',
    'common.email': 'इमेल',
    'common.phone': 'फोन',
    'common.qualifications': 'योग्यता',
    'common.specialization': 'विशेषज्ञता',
    'common.contact': 'सम्पर्क',
    
    // About Page
    'about.title': 'हाम्रो विद्यालयको बारेमा',
    'about.stats.title': 'विद्यालयका तथ्याङ्कहरू',
    'about.loading': 'लोड हुँदैछ...',
    'about.error': 'सामग्री लोड गर्न त्रुटि',
    
    // Teachers Page
    'teachers.title': 'हाम्रा शिक्षकहरू',
    'teachers.subtitle': 'गुणस्तरीय शिक्षा प्रदान गर्न र भावी पुस्ताका नेताहरू तयार पार्न प्रतिबद्ध हाम्रा अनुभवी शिक्षकहरूसँग परिचय गराउँछौं।',
    'teachers.noTeachers': 'कुनै शिक्षक भेटिएन',
    'teachers.noTeachersDesc': 'शिक्षक प्रोफाइलहरू थपिएपछि यहाँ देखिनेछन्।',
    'teachers.dataStatus': 'शिक्षक डेटा',
    'teachers.loaded': 'शिक्षकहरू लोड भए',
    
    // Notices Page
    'notices.title': 'विद्यालय सूचनाहरू',
    'notices.subtitle': 'हाम्रो विद्यालयबाटका नवीनतम घोषणा, कार्यक्रम, र महत्त्वपूर्ण जानकारीहरूसँग अपडेटेड रहनुहोस्।',
    'notices.noNotices': 'कुनै सूचना भेटिएन',
    'notices.noNoticesDesc': 'सूचनाहरू र घोषणाहरू यहाँ प्रकाशित भएपछि देखिनेछन्।',
    'notices.category': 'श्रेणी',
    'notices.priority': 'प्राथमिकता',
    'notices.publishedDate': 'प्रकाशन मिति',
    'notices.expiryDate': 'समाप्ति मिति',
    'notices.attachment': 'संलग्नक',
    'notices.featured': 'विशेष',
    'notices.published': 'प्रकाशित',
    'notices.categories.academic': 'शैक्षिक',
    'notices.categories.administrative': 'प्रशासनिक',
    'notices.categories.events': 'कार्यक्रमहरू',
    'notices.categories.holidays': 'बिदाहरू',
    'notices.categories.general': 'सामान्य',
    'notices.priorities.low': 'कम',
    'notices.priorities.normal': 'सामान्य',
    'notices.priorities.high': 'उच्च',
    'notices.priorities.urgent': 'जरुरी',
    'notices.readMore': 'थप पढ्नुहोस्',
    'notices.downloadAttachment': 'संलग्नक डाउनलोड गर्नुहोस्',
    
    // Home Page
    'home.title': 'विद्यालय CMS',
    'home.subtitle': 'द्विभाषी सामग्रीको साथ Supabase एकीकरण परीक्षण।',
    'home.aboutStats': 'परिचय र तथ्याङ्क',
    'home.admin': 'एडमिन ड्यासबोर्ड',
    
    // Admin
    'admin.title': 'एडमिन ड्यासबोर्ड',
    'admin.login': 'एडमिन लगइन',
    'admin.logout': 'लगआउट',
    'admin.email': 'इमेल',
    'admin.password': 'पासवर्ड',
    'admin.signIn': 'साइन इन',
    'admin.signOut': 'साइन आउट',
    'admin.welcome': 'एडमिन ड्यासबोर्डमा स्वागत छ',
    'admin.about': 'परिचय सामग्री',
    'admin.stats': 'तथ्याङ्कहरू',
    'admin.teachers': 'शिक्षकहरू',
    'admin.aboutDesc': 'दुबै भाषामा परिचय पृष्ठको सामग्री व्यवस्थापन गर्नुहोस्',
    'admin.statsDesc': 'विद्यालयका तथ्याङ्कहरू थप्नुहोस् र व्यवस्थापन गर्नुहोस्',
    'admin.teachersDesc': 'शिक्षक प्रोफाइल र जानकारी व्यवस्थापन गर्नुहोस्',
  }
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const savedLocale = Cookies.get('locale') as Locale
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'ne')) {
      setLocaleState(savedLocale)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    Cookies.set('locale', newLocale, { expires: 365 })
  }

  const t = (key: string): string => {
    const translationObj = translations[locale] as Record<string, string>
    if (!translationObj) {
      console.warn(`No translations found for locale: ${locale}`)
      return key
    }
    
    const translation = translationObj[key]
    if (!translation && process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation for key: ${key} in locale: ${locale}`)
    }
    return translation || key
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
