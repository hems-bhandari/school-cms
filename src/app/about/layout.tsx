import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: "About Us - Shree Jana Jagriti Secondary School (JJSS)",
  description: "Learn about Shree Jana Jagriti Secondary School's mission, vision, and key statistics. Located in Omsatiya-1, Rupandehi, Lumbini, Nepal. Quality education and student achievements.",
  keywords: ["Shree Jana Jagriti Secondary School", "JJSS", "about school", "school statistics", "Omsatiya", "Rupandehi", "Lumbini", "Nepal", "education", "student enrollment", "academic achievement"],
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
