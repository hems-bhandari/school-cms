'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { Database } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type AboutData = Database['public']['Tables']['about']['Row']

interface StudentCountRow {
  id?: number
  level: string
  boys: number
  girls: number
  display_order?: number | null
}

type StudentCountRecord = Database['public']['Tables']['student_counts']['Row']

export default function AdminAbout() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [contentEn, setContentEn] = useState('')
  const [contentNe, setContentNe] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [studentCounts, setStudentCounts] = useState<StudentCountRow[]>([])
  const [countsLoading, setCountsLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  // Load existing content
  useEffect(() => {
    loadAboutContent()
    loadStudentCounts()
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

      const aboutRecord = data as AboutData | null

      if (aboutRecord) {
        setAboutData(aboutRecord)
        setContentEn(aboutRecord.content_en || '')
        setContentNe(aboutRecord.content_ne || '')
      }
    } catch (err: unknown) {
      setError(`Failed to load content: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const loadStudentCounts = async () => {
    try {
      setCountsLoading(true)
      const { data, error } = await supabase
        .from('student_counts')
        .select('*')
        .returns<StudentCountRecord[]>()
        .order('display_order')

      if (error) throw error
      const records = data ?? []
      setStudentCounts(records.map((d) => ({ id: d.id, level: d.level, boys: d.boys, girls: d.girls, display_order: d.display_order })))
    } catch (err: unknown) {
      setError(`Failed to load student counts: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setCountsLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updateData: Database['public']['Tables']['about']['Update'] = {
        content_en: contentEn.trim() || null,
        content_ne: contentNe.trim() || null,
        updated_at: new Date().toISOString(),
      }

      let savedData: AboutData | null = null

      if (aboutData?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('about')
          .update(updateData)
          .eq('id', aboutData.id)
          .select()
          .single()
        if (error) throw error
        savedData = data
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('about')
          .insert(updateData as Database['public']['Tables']['about']['Insert'])
          .select()
          .single()
        if (error) throw error
        savedData = data
      }

      setAboutData(savedData)
      setSuccess('Content saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err: unknown) {
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const addEmptyRow = () => {
    setStudentCounts((rows) => [
      ...rows,
      { level: '', boys: 0, girls: 0, display_order: (rows[rows.length-1]?.display_order || 0) + 1 }
    ])
  }

  const updateRow = (index: number, changes: Partial<StudentCountRow>) => {
    setStudentCounts((rows) => rows.map((r, i) => i === index ? { ...r, ...changes } : r))
  }

  const deleteRow = async (index: number) => {
    const row = studentCounts[index]
    if (row?.id) {
      const { error } = await supabase.from('student_counts').delete().eq('id', row.id)
      if (error) {
        setError(`Failed to delete row: ${error.message}`)
        return
      }
    }
    setStudentCounts((rows) => rows.filter((_, i) => i !== index))
  }

  const saveStudentCounts = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      // Split into updates and inserts
      const updates = studentCounts.filter((r) => r.id)
      const inserts = studentCounts.filter((r) => !r.id)

      if (updates.length > 0) {
        const { error } = await supabase.from('student_counts').upsert(
          updates.map((r) => ({ id: r.id, level: r.level, boys: r.boys, girls: r.girls, display_order: r.display_order })),
          { onConflict: 'id' }
        )
        if (error) throw error
      }

      if (inserts.length > 0) {
        const { error } = await supabase.from('student_counts').insert(
          inserts.map((r) => ({ level: r.level, boys: r.boys, girls: r.girls, display_order: r.display_order }))
        )
        if (error) throw error
      }

      await loadStudentCounts()
      setSuccess('Student counts saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(`Failed to save student counts: ${err instanceof Error ? err.message : 'Unknown error'}`)
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

          {/* Student Counts Editor */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Students Data</h2>
                <p className="text-sm text-gray-500">Level-wise number of students</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={addEmptyRow}>Add Row</Button>
                <Button onClick={saveStudentCounts} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? 'Saving...' : 'Save Data'}
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Boys</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Girls</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {countsLoading ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={6}>Loading...</td>
                    </tr>
                  ) : studentCounts.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={6}>No rows yet. Click Add Row.</td>
                    </tr>
                  ) : (
                    studentCounts.map((row, index) => {
                      const total = (row.boys || 0) + (row.girls || 0)
                      return (
                        <tr key={row.id ?? `new-${index}`}> 
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              className="w-20 px-2 py-1 border rounded"
                              value={row.display_order ?? index + 1}
                              onChange={(e) => updateRow(index, { display_order: Number(e.target.value) })}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="w-56 px-2 py-1 border rounded"
                              placeholder="e.g., Primary"
                              value={row.level}
                              onChange={(e) => updateRow(index, { level: e.target.value })}
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              className="w-24 px-2 py-1 border rounded text-right"
                              min={0}
                              value={row.boys}
                              onChange={(e) => updateRow(index, { boys: Number(e.target.value) })}
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              className="w-24 px-2 py-1 border rounded text-right"
                              min={0}
                              value={row.girls}
                              onChange={(e) => updateRow(index, { girls: Number(e.target.value) })}
                            />
                          </td>
                          <td className="px-4 py-2 text-right font-semibold">{total}</td>
                          <td className="px-4 py-2 text-right">
                            <Button variant="outline" onClick={() => deleteRow(index)}>Delete</Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
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
