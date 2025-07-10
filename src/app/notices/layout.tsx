import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: "School Notices & Announcements",
  description: "Stay updated with the latest school notices, announcements, and important information for students and parents.",
  keywords: ["school notices", "announcements", "news", "updates", "information"],
  url: "/notices",
  type: "website"
})

// Enable ISR with 30 minutes revalidation for frequently updated content
export const revalidate = 1800

export default function NoticesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
