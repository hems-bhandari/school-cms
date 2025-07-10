'use client'

interface SEOSchemaProps {
  schema: object
}

export default function SEOSchema({ schema }: SEOSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  )
}
