'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface StatData {
  id: number
  label_en: string
  label_ne: string
  value: number
  display_order: number
  created_at: string
  updated_at: string
}

interface EditingStat extends Partial<StatData> {
  isNew?: boolean
}

export default function AdminStats() {
  const [stats, setStats] = useState<StatData[]>([])
  const [editingStat, setEditingStat] = useState<EditingStat | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const supabase = createClient()

  // Load existing stats
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('stats')
        .select('*')
        .order('display_order')

      if (error) throw error
      setStats(data || [])
    } catch (err: unknown) {
      setError(`Failed to load stats: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (stat: StatData) => {
    setEditingStat(stat)
    setError('')
    setSuccess('')
  }

  const handleAdd = () => {
    setEditingStat({
      isNew: true,
      label_en: '',
      label_ne: '',
      value: 0,
      display_order: stats.length + 1,
    })
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    if (!editingStat) return

    setSaving(true)
    setError('')

    try {
      const saveData = {
        label_en: editingStat.label_en?.trim() || '',
        label_ne: editingStat.label_ne?.trim() || '',
        value: editingStat.value || 0,
        display_order: editingStat.display_order || 1,
        updated_at: new Date().toISOString(),
      }

      if (editingStat.isNew) {
        // Insert new stat
        const { data, error } = await supabase
          .from('stats')
          .insert(saveData)
          .select()
          .single()

        if (error) throw error
        setStats([...stats, data])
        setSuccess('New statistic added successfully!')
      } else {
        // Update existing stat
        const { data, error } = await supabase
          .from('stats')
          .update(saveData)
          .eq('id', editingStat.id!)
          .select()
          .single()

        if (error) throw error
        setStats(stats.map(s => s.id === editingStat.id ? data : s))
        setSuccess('Statistic updated successfully!')
      }

      setEditingStat(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this statistic?')) return

    try {
      const { error } = await supabase
        .from('stats')
        .delete()
        .eq('id', id)

      if (error) throw error
      setStats(stats.filter(s => s.id !== id))
      setSuccess('Statistic deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(`Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleCancel = () => {
    setEditingStat(null)
    setError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Statistics Manager</h1>
                <p className="text-gray-600">Manage school statistics and numbers</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href="/about" target="_blank">
                <Button variant="outline">
                  Preview Page
                </Button>
              </Link>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                Add Statistic
              </Button>
            </div>
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

          {/* Edit Form Modal */}
          {editingStat && (
            <div className="mb-8 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {editingStat.isNew ? 'Add New Statistic' : 'Edit Statistic'}
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      English Label
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Total Students"
                      value={editingStat.label_en || ''}
                      onChange={(e) => setEditingStat({...editingStat, label_en: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nepali Label
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., कुल विद्यार्थी"
                      value={editingStat.label_ne || ''}
                      onChange={(e) => setEditingStat({...editingStat, label_ne: e.target.value})}
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 1250"
                      value={editingStat.value || ''}
                      onChange={(e) => setEditingStat({...editingStat, value: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 1"
                      value={editingStat.display_order || ''}
                      onChange={(e) => setEditingStat({...editingStat, display_order: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || !editingStat.label_en?.trim() || !editingStat.label_ne?.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? 'Saving...' : (editingStat.isNew ? 'Add Statistic' : 'Save Changes')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stats List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Current Statistics</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {stats.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No statistics found. Add your first statistic above.
                </div>
              ) : (
                stats.map((stat) => (
                  <div key={stat.id} className="p-6 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {stat.value}{stat.label_en.toLowerCase().includes('rate') ? '%' : ''}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{stat.label_en}</div>
                          <div className="text-sm text-gray-600" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            {stat.label_ne}
                          </div>
                          <div className="text-xs text-gray-400">Order: {stat.display_order}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(stat)}>
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(stat.id)}
                        className="text-red-600 hover:text-red-800 hover:border-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
