import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: "About Us - School Statistics & Information",
  description: "Learn about our school's mission, vision, and key statistics including student enrollment, success rates, and achievements.",
  keywords: ["about school", "school statistics", "education", "student enrollment", "academic achievement"],
  url: "/about",
  type: "website"
})

export const revalidate = 3600

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
