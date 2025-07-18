import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documents & Resources - School CMS',
  description: 'Access important school documents, forms, and resources. Download academic materials and official documents.',
  keywords: 'school documents, forms, resources, downloads, academic materials',
  openGraph: {
    title: 'Documents & Resources - School CMS',
    description: 'Access important school documents, forms, and resources.',
    type: 'website',
  },
}

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
