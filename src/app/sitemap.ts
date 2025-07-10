import { createClient } from '@/lib/supabase-server'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = await createClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/teachers`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/committee`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/notices`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/activities`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  const dynamicPages: MetadataRoute.Sitemap = []

  try {
    const { data: notices } = await supabase
      .from('notices')
      .select('id, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(100)

    if (notices) {
      notices.forEach((notice: { id: number; updated_at: string }) => {
        dynamicPages.push({
          url: `${baseUrl}/notices/${notice.id}`,
          lastModified: new Date(notice.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        })
      })
    }

    const { data: activities } = await supabase
      .from('activities')
      .select('id, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(100)

    if (activities) {
      activities.forEach((activity: { id: number; updated_at: string }) => {
        dynamicPages.push({
          url: `${baseUrl}/activities/${activity.id}`,
          lastModified: new Date(activity.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        })
      })
    }

    const { data: teachers } = await supabase
      .from('teachers')
      .select('id, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    if (teachers) {
      teachers.forEach((teacher: { id: number; updated_at: string }) => {
        dynamicPages.push({
          url: `${baseUrl}/teachers/${teacher.id}`,
          lastModified: new Date(teacher.updated_at),
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        })
      })
    }

  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return [...staticPages, ...dynamicPages]
}
