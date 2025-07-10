import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: "Our Teachers - Faculty & Staff Profiles",
  description: "Meet our dedicated teachers and faculty members who are committed to providing quality education and nurturing student growth.",
  keywords: ["teachers", "faculty", "staff", "education", "profiles"],
  url: "/teachers",
  type: "website"
})

// Enable ISR with 1 day revalidation
export const revalidate = 86400

export default function TeachersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
