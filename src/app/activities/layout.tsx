import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: "School Activities & Events",
  description: "Explore our school's exciting activities, events, and programs designed to enhance student learning and development.",
  keywords: ["school activities", "events", "programs", "student activities", "school events"],
  url: "/activities",
  type: "website"
})

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
