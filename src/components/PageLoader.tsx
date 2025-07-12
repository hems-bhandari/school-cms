'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">School CMS</h2>
        <p className="text-gray-600">Loading amazing content...</p>
      </div>
    </div>
  )
}
