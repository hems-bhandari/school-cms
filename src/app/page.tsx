'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  Landmark,
  MapPin,
  Users,
} from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { FeatureCard, StatsCard } from '@/components/LandingComponents'
import { useLanguage } from '@/contexts/LanguageContext'
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
  const { locale } = useLanguage()
  const [footerData, setFooterData] = useState<FooterData | null>(null)
  const [stats, setStats] = useState({ students: 1200, teachers: 45, activities: 25 })

  useEffect(() => {
    async function fetchSchoolData() {
      const supabase = createClient()
      const [{ data }, { count: teachersCount }, { count: activitiesCount }] = await Promise.all([
        supabase.from('footer').select('*').eq('is_active', true).single(),
        supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('activities').select('*', { count: 'exact', head: true }).eq('is_published', true),
      ])

      if (data) setFooterData(data)
      setStats((current) => ({
        ...current,
        teachers: teachersCount ?? current.teachers,
        activities: activitiesCount ?? current.activities,
      }))
    }

    fetchSchoolData()
  }, [])

  const copy = locale === 'en' ? {
    eyebrow: 'A community school in Rupandehi, Nepal',
    title: 'Shree Jana Jagriti Secondary School',
    intro: 'We provide a disciplined, inclusive and caring learning environment where every student is encouraged to grow in knowledge, character and service.',
    location: 'Omsatiya–3, Karuwani, Rupandehi, Lumbini',
    about: 'About our school',
    notices: 'View notices',
    students: 'Students',
    studentsNote: 'Learning across all levels',
    teachers: 'Teachers',
    teachersNote: 'Committed faculty members',
    activities: 'Activities',
    activitiesNote: 'Academic and co-curricular',
    welcome: 'Welcome to Jana Jagriti',
    welcomeText: 'Our school has grown with the community it serves. We believe strong schools are built through the shared effort of students, families, teachers and local leadership.',
    commitment: 'Our commitment',
    commitmentText: 'Sound teaching, responsible citizenship and equal opportunity remain at the heart of school life.',
    explore: 'School information',
    exploreText: 'Find the people, programmes and official information that shape our school community.',
  } : {
    eyebrow: 'रुपन्देही, नेपालको सामुदायिक विद्यालय',
    title: 'श्री जनजागृति माध्यमिक विद्यालय',
    intro: 'हामी प्रत्येक विद्यार्थीलाई ज्ञान, चरित्र र सेवामा अघि बढ्न प्रेरित गर्ने अनुशासित, समावेशी र आत्मीय सिकाइ वातावरण प्रदान गर्छौं।',
    location: 'ओमसतिया–३, करुवानी, रुपन्देही, लुम्बिनी',
    about: 'विद्यालयबारे जान्नुहोस्',
    notices: 'सूचनाहरू हेर्नुहोस्',
    students: 'विद्यार्थी',
    studentsNote: 'सबै तहमा अध्ययनरत',
    teachers: 'शिक्षक',
    teachersNote: 'समर्पित शिक्षक टोली',
    activities: 'गतिविधि',
    activitiesNote: 'शैक्षिक तथा सह–शैक्षिक',
    welcome: 'जनजागृतिमा स्वागत छ',
    welcomeText: 'हाम्रो विद्यालय आफूले सेवा गर्ने समुदायसँगै विकसित भएको छ। बलियो विद्यालय विद्यार्थी, परिवार, शिक्षक र स्थानीय नेतृत्वको साझा प्रयासबाट निर्माण हुन्छ भन्ने हाम्रो विश्वास छ।',
    commitment: 'हाम्रो प्रतिबद्धता',
    commitmentText: 'गुणस्तरीय शिक्षण, जिम्मेवार नागरिकता र समान अवसर विद्यालय जीवनको केन्द्रमा छन्।',
    explore: 'विद्यालय जानकारी',
    exploreText: 'हाम्रो विद्यालय समुदाय निर्माण गर्ने व्यक्ति, कार्यक्रम र आधिकारिक जानकारी यहाँ पाउनुहोस्।',
  }

  return (
    <div className="official-home min-h-screen">
      {footerData && <SEOSchema schema={generateSchoolSchema(footerData, locale)} />}
      <Navigation />

      <section className="school-hero" aria-labelledby="school-heading">
        <div className="school-hero__content">
          <p className="school-eyebrow">{copy.eyebrow}</p>
          <h1 id="school-heading">{copy.title}</h1>
          <p className="school-hero__intro">{copy.intro}</p>
          <p className="school-location"><MapPin aria-hidden="true" /> {copy.location}</p>
          <div className="school-actions">
            <Link href="/about" className="school-button school-button--primary">
              {copy.about}<ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/notices" className="school-button school-button--secondary">
              <Bell aria-hidden="true" />{copy.notices}
            </Link>
          </div>
        </div>
        <figure className="school-hero__image">
          <div className="school-hero__photo" role="img" aria-label="Shree Jana Jagriti Secondary School campus" />
          <figcaption>ज्ञान • अनुशासन • सेवा</figcaption>
        </figure>
      </section>

      <section className="school-stat-band" aria-label="School at a glance">
        <div className="school-stat-grid">
          <StatsCard icon={<Users />} value={stats.students} suffix="+" label={copy.students} description={copy.studentsNote} />
          <StatsCard icon={<GraduationCap />} value={stats.teachers} suffix="+" label={copy.teachers} description={copy.teachersNote} />
          <StatsCard icon={<CalendarDays />} value={stats.activities} suffix="+" label={copy.activities} description={copy.activitiesNote} />
        </div>
      </section>

      <section className="school-welcome">
        <div>
          <p className="school-eyebrow">{copy.welcome}</p>
          <h2>{copy.commitment}</h2>
        </div>
        <div className="school-welcome__copy">
          <p>{copy.welcomeText}</p>
          <p>{copy.commitmentText}</p>
          <Link href="/about" className="school-text-link">{copy.about}<ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section id="features" className="school-directory">
        <header className="school-section-heading">
          <p className="school-eyebrow">{copy.explore}</p>
          <h2>{copy.explore}</h2>
          <p>{copy.exploreText}</p>
        </header>
        <div className="school-directory__grid">
          <FeatureCard icon={<Users />} title={locale === 'en' ? 'Faculty & Staff' : 'शिक्षक तथा कर्मचारी'} description={locale === 'en' ? 'Meet the educators responsible for learning and student care.' : 'सिकाइ र विद्यार्थी हेरचाहमा जिम्मेवार शिक्षकहरूलाई चिन्नुहोस्।'} href="/teachers" buttonText={locale === 'en' ? 'View faculty' : 'शिक्षक हेर्नुहोस्'} />
          <FeatureCard icon={<Landmark />} title={locale === 'en' ? 'School Leadership' : 'विद्यालय नेतृत्व'} description={locale === 'en' ? 'Learn about the management committee and parent–teacher association.' : 'व्यवस्थापन समिति र अभिभावक–शिक्षक संघबारे जान्नुहोस्।'} href="/committee" buttonText={locale === 'en' ? 'View committees' : 'समिति हेर्नुहोस्'} />
          <FeatureCard icon={<Bell />} title={locale === 'en' ? 'Notices' : 'सूचनाहरू'} description={locale === 'en' ? 'Read current announcements, schedules and official updates.' : 'हालका घोषणा, तालिका र आधिकारिक जानकारी पढ्नुहोस्।'} href="/notices" buttonText={locale === 'en' ? 'Read notices' : 'सूचना पढ्नुहोस्'} />
          <FeatureCard icon={<CalendarDays />} title={locale === 'en' ? 'Activities' : 'गतिविधिहरू'} description={locale === 'en' ? 'See academic, cultural and co-curricular school life.' : 'शैक्षिक, सांस्कृतिक र सह–शैक्षिक विद्यालय जीवन हेर्नुहोस्।'} href="/activities" buttonText={locale === 'en' ? 'View activities' : 'गतिविधि हेर्नुहोस्'} />
          <FeatureCard icon={<FileText />} title={locale === 'en' ? 'Documents' : 'कागजातहरू'} description={locale === 'en' ? 'Access forms, reports and other public school resources.' : 'फाराम, प्रतिवेदन र सार्वजनिक विद्यालय स्रोतहरू प्राप्त गर्नुहोस्।'} href="/documents" buttonText={locale === 'en' ? 'Browse documents' : 'कागजात हेर्नुहोस्'} />
          <FeatureCard icon={<Award />} title={locale === 'en' ? 'About the School' : 'विद्यालय परिचय'} description={locale === 'en' ? 'Read our history, purpose, values and school profile.' : 'हाम्रो इतिहास, उद्देश्य, मूल्य र विद्यालय परिचय पढ्नुहोस्।'} href="/about" buttonText={locale === 'en' ? 'Learn more' : 'थप जान्नुहोस्'} />
        </div>
      </section>

      <section className="school-notice-callout">
        <BookOpen aria-hidden="true" />
        <div>
          <h2>{locale === 'en' ? 'Information for students and families' : 'विद्यार्थी तथा परिवारका लागि जानकारी'}</h2>
          <p>{locale === 'en' ? 'Important school announcements and downloadable resources are maintained online.' : 'महत्त्वपूर्ण विद्यालय सूचना र डाउनलोडयोग्य स्रोतहरू अनलाइन उपलब्ध छन्।'}</p>
        </div>
        <Link href="/notices" className="school-text-link">{copy.notices}<ArrowRight aria-hidden="true" /></Link>
      </section>
    </div>
  )
}
