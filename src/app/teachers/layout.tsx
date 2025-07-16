import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: "Our Teachers - JJSS Faculty & Staff Profiles",
  description: "Meet the dedicated teachers and faculty members of Shree Jana Jagriti Secondary School who are committed to providing quality education in Lumbini, Nepal.",
  keywords: ["JJSS teachers", "Jana Jagriti faculty", "school staff", "Lumbini education", "Nepal teachers", "quality education"],
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
