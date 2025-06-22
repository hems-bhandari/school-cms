'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AboutData {
  id: number
  content_en: string | null
  content_ne: string | null
  created_at: string
  updated_at: string
}

export default function AdminAbout() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [contentEn, setContentEn] = useState('')
  const [contentNe, setContentNe] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  // Load existing content
  useEffect(() => {
    loadAboutContent()
  }, [])

  const loadAboutContent = async () => {
    try {
      const { data, error } = await supabase
        .from('about')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setAboutData(data)
        setContentEn(data.content_en || '')
        setContentNe(data.content_ne || '')
      }
    } catch (err: unknown) {
      setError(`Failed to load content: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updateData = {
        content_en: contentEn.trim() || null,
        content_ne: contentNe.trim() || null,
        updated_at: new Date().toISOString(),
      }

      let result

      if (aboutData?.id) {
        // Update existing record
        result = await supabase
          .from('about')
          .update(updateData)
          .eq('id', aboutData.id)
          .select()
          .single()
      } else {
        // Insert new record
        result = await supabase
          .from('about')
          .insert(updateData)
          .select()
          .single()
      }

      if (result.error) {
        throw result.error
      }

      setAboutData(result.data)
      setSuccess('Content saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err: unknown) {
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    if (aboutData) {
      setContentEn(aboutData.content_en || '')
      setContentNe(aboutData.content_ne || '')
    } else {
      setContentEn('')
      setContentNe('')
    }
    setError('')
    setSuccess('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">About Content Editor</h1>
                <p className="text-gray-600">Manage about page content in both languages</p>
              </div>
            </div>
            <Link href="/about" target="_blank">
              <Button variant="outline">
                Preview Page
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Status Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Content Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Content Editor</h2>
              <p className="text-sm text-gray-500">
                Last updated: {aboutData?.updated_at ? new Date(aboutData.updated_at).toLocaleString() : 'Never'}
              </p>
            </div>
            
            <div className="p-6 space-y-8">
              
              {/* English Content */}
              <div>
                <label htmlFor="content-en" className="block text-sm font-medium text-gray-700 mb-2">
                  English Content
                </label>
                <textarea
                  id="content-en"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the about content in English..."
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Characters: {contentEn.length}
                </p>
              </div>

              {/* Nepali Content */}
              <div>
                <label htmlFor="content-ne" className="block text-sm font-medium text-gray-700 mb-2">
                  Nepali Content (नेपाली सामग्री)
                </label>
                <textarea
                  id="content-ne"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="नेपालीमा विद्यालयको बारेमा जानकारी लेख्नुहोस्..."
                  value={contentNe}
                  onChange={(e) => setContentNe(e.target.value)}
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Characters: {contentNe.length}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleDiscard}
                disabled={saving}
              >
                Discard Changes
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || (!contentEn.trim() && !contentNe.trim())}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? 'Saving...' : 'Save Content'}
              </Button>
            </div>
          </div>

          {/* Content Preview */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Live Preview</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {contentEn && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">English</h3>
                  <div className="bg-gray-50 p-4 rounded border">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {contentEn}
                    </p>
                  </div>
                </div>
              )}
              
              {contentNe && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">नेपाली</h3>
                  <div className="bg-gray-50 p-4 rounded border">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {contentNe}
                    </p>
                  </div>
                </div>
              )}
              
              {!contentEn && !contentNe && (
                <p className="text-gray-500 italic">No content to preview</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
