import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: "School Committee - Leadership & Management",
  description: "Learn about our school committee members who provide leadership and guidance to ensure excellence in education.",
  keywords: ["school committee", "management", "leadership", "governance"],
  url: "/committee",
  type: "website"
})

// Enable ISR with 1 week revalidation
export const revalidate = 604800

export default function CommitteeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
