'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { User } from '@supabase/supabase-js'
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react'
import NoticeFileUpload, { FileAttachment } from '@/components/NoticeFileUpload'

interface Notice {
  id: number
  title_en: string
  title_ne: string
  content_en: string
  content_ne: string
  category: string
  priority: string
  published_date: string
  expiry_date?: string
  attachment_url?: string
  attachment_name?: string
  attachments?: FileAttachment[]
  is_published: boolean
  is_featured: boolean
  display_order: number
  created_at: string
}

interface NoticeFormData {
  title_en: string
  title_ne: string
  content_en: string
  content_ne: string
  category: string
  priority: string
  published_date: string
  expiry_date: string
  attachments: FileAttachment[]
  is_published: boolean
  is_featured: boolean
  display_order: number
}

export default function AdminNoticesPage() {
  const { locale, t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [formData, setFormData] = useState<NoticeFormData>({
    title_en: '',
    title_ne: '',
    content_en: '',
    content_ne: '',
    category: 'general',
    priority: 'normal',
    published_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    attachments: [],
    is_published: true,
    is_featured: false,
    display_order: 0
  })

  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = '/admin/login'
        return
      }
      
      setUser(user)
      await fetchNotices()
    }

    checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchNotices = async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('notices')
      .select('*')
      .order('display_order')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setNotices(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (editingNotice) {
        // Update existing notice
        const { error: updateError } = await supabase
          .from('notices')
          .update(formData)
          .eq('id', editingNotice.id)

        if (updateError) throw updateError
      } else {
        // Create new notice
        const { error: insertError } = await supabase
          .from('notices')
          .insert([formData])

        if (insertError) throw insertError
      }

      // Reset form and refresh data
      setFormData({
        title_en: '',
        title_ne: '',
        content_en: '',
        content_ne: '',
        category: 'general',
        priority: 'normal',
        published_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        attachments: [],
        is_published: true,
        is_featured: false,
        display_order: 0
      })
      setEditingNotice(null)
      setShowForm(false)
      await fetchNotices()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice)
    setFormData({
      title_en: notice.title_en,
      title_ne: notice.title_ne,
      content_en: notice.content_en,
      content_ne: notice.content_ne,
      category: notice.category,
      priority: notice.priority,
      published_date: notice.published_date,
      expiry_date: notice.expiry_date || '',
      attachments: notice.attachments || [],
      is_published: notice.is_published,
      is_featured: notice.is_featured,
      display_order: notice.display_order
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notice?')) return

    const { error: deleteError } = await supabase
      .from('notices')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      await fetchNotices()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-green-100 text-green-800'
      case 'administrative': return 'bg-purple-100 text-purple-800'
      case 'events': return 'bg-yellow-100 text-yellow-800'
      case 'holidays': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Notices</h1>
            <p className="text-gray-600">Create and manage school announcements</p>
          </div>
          <Button
            onClick={() => {
              setEditingNotice(null)
              setFormData({
                title_en: '',
                title_ne: '',
                content_en: '',
                content_ne: '',
                category: 'general',
                priority: 'normal',
                published_date: new Date().toISOString().split('T')[0],
                expiry_date: '',
                attachments: [],
                is_published: true,
                is_featured: false,
                display_order: 0
              })
              setShowForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Notice
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Notice Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingNotice ? 'Edit Notice' : 'Create New Notice'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* English Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  />
                </div>

                {/* Nepali Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (नेपाली)
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.title_ne}
                    onChange={(e) => setFormData({ ...formData, title_ne: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* English Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (English)
                  </label>
                  <textarea
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.content_en}
                    onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  />
                </div>

                {/* Nepali Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (नेपाली)
                  </label>
                  <textarea
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.content_ne}
                    onChange={(e) => setFormData({ ...formData, content_ne: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="administrative">Administrative</option>
                    <option value="events">Events</option>
                    <option value="holidays">Holidays</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Published Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Published Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.published_date}
                    onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                {/* Published Checkbox */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                  <span className="ml-2 text-sm text-gray-700">Published</span>
                </label>

                {/* Featured Checkbox */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Images & PDFs)
                </label>
                <NoticeFileUpload
                  currentFiles={formData.attachments}
                  onFilesUploaded={(files) => setFormData({ ...formData, attachments: files })}
                  bucketName="notice-attachments"
                  maxFiles={20}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingNotice(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Notices List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              All Notices ({notices.length})
            </h2>
          </div>

          {notices.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {notices.map((notice) => (
                <div key={notice.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {locale === 'en' ? notice.title_en : notice.title_ne}
                        </h3>
                        {notice.is_featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Featured
                          </span>
                        )}
                        {!notice.is_published && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Draft
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {locale === 'en' ? notice.content_en : notice.content_ne}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(notice.published_date).toLocaleDateString()}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {notice.priority}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
                          <Tag className="w-3 h-3 mr-1" />
                          {notice.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(notice)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(notice.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No notices found. Create your first notice!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
