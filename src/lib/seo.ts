import type { Metadata } from 'next'

export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  locale?: string
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  locale = 'en'
}: SEOData): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const defaultImage = `${baseUrl}/images/school-default.jpg`
  const imageUrl = image ? `${baseUrl}${image}` : defaultImage

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'School CMS',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type,
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: fullUrl,
      languages: {
        'en': `${baseUrl}/en${url || ''}`,
        'ne': `${baseUrl}/ne${url || ''}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

interface SchemaOrgData {
  '@type': string
  [key: string]: unknown
}

interface SchoolData {
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

interface PersonData {
  name_en: string
  name_ne: string
  position_en: string
  position_ne: string
  bio_en?: string
  bio_ne?: string
  image_url?: string
  email?: string
  phone?: string
}

interface ActivityData {
  title_en: string
  title_ne: string
  description_en: string
  description_ne: string
  date: string
  featured_image_url?: string
  location?: string
}

interface NoticeData {
  title_en: string
  title_ne: string
  content_en: string
  content_ne: string
  created_at: string
  updated_at: string
}

export function generateSchemaOrg(data: SchemaOrgData) {
  return {
    '@context': 'https://schema.org',
    ...data
  }
}

// School Organization Schema
export function generateSchoolSchema(schoolData: SchoolData, locale: string) {
  return generateSchemaOrg({
    '@type': 'EducationalOrganization',
    name: locale === 'en' ? schoolData.school_name_en : schoolData.school_name_ne,
    address: {
      '@type': 'PostalAddress',
      streetAddress: locale === 'en' ? schoolData.address_en : schoolData.address_ne,
    },
    telephone: schoolData.phone,
    email: schoolData.email,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: schoolData.logo_url,
    sameAs: [
      schoolData.facebook_url,
      schoolData.twitter_url,
      schoolData.instagram_url,
      schoolData.youtube_url,
      schoolData.linkedin_url,
    ].filter(Boolean),
  })
}

// Person Schema for Teachers/Committee
export function generatePersonSchema(person: PersonData, locale: string) {
  return generateSchemaOrg({
    '@type': 'Person',
    name: locale === 'en' ? person.name_en : person.name_ne,
    jobTitle: locale === 'en' ? person.position_en : person.position_ne,
    description: locale === 'en' ? person.bio_en : person.bio_ne,
    image: person.image_url,
    email: person.email,
    telephone: person.phone,
    worksFor: {
      '@type': 'EducationalOrganization',
      name: 'School CMS'
    }
  })
}

// Event Schema for Activities
export function generateEventSchema(activity: ActivityData, locale: string) {
  return generateSchemaOrg({
    '@type': 'Event',
    name: locale === 'en' ? activity.title_en : activity.title_ne,
    description: locale === 'en' ? activity.description_en : activity.description_ne,
    startDate: activity.date,
    image: activity.featured_image_url,
    location: activity.location,
    organizer: {
      '@type': 'EducationalOrganization',
      name: 'School CMS'
    }
  })
}

// Article Schema for Notices
export function generateArticleSchema(notice: NoticeData, locale: string) {
  return generateSchemaOrg({
    '@type': 'Article',
    headline: locale === 'en' ? notice.title_en : notice.title_ne,
    description: locale === 'en' ? notice.content_en : notice.content_ne,
    datePublished: notice.created_at,
    dateModified: notice.updated_at,
    author: {
      '@type': 'Organization',
      name: 'School CMS'
    },
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'School CMS'
    }
  })
}
