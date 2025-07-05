'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { User } from '@supabase/supabase-js'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import MultiImageUpload from '@/components/MultiImageUpload'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'
import { Calendar, Star, Users, Eye, EyeOff } from 'lucide-react'

interface Activity {
  id: number
  title_en: string
  title_ne: string
  description_en: string
  description_ne: string
  preview_img_url: string | null
  gallery_urls: string[] | null
  event_date: string
  is_featured: boolean
  is_published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface ActivityFormData {
  title_en: string
  title_ne: string
  description_en: string
  description_ne: string
  event_date: string
  is_featured: boolean
  is_published: boolean
  display_order: number
}

export default function AdminActivities() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [formData, setFormData] = useState<ActivityFormData>({
    title_en: '',
    title_ne: '',
    description_en: '',
    description_ne: '',
    event_date: '',
    is_featured: false,
    is_published: true,
    display_order: 0
  })
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = '/admin/login'
        return
      }
      
      setUser(user)
      fetchActivities()
    }

    checkUser()
  }, [])

  async function fetchActivities() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('event_date', { ascending: false })

    if (error) {
      console.error('Error fetching activities:', error)
    } else {
      setActivities(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = createClient()
      
      const activityData = {
        ...formData,
        preview_img_url: galleryImages.length > 0 ? galleryImages[0] : null,
        gallery_urls: galleryImages.length > 1 ? galleryImages.slice(1) : null
      }

      if (editingActivity) {
        // Update existing activity
        const { error } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', editingActivity.id)

        if (error) throw error
      } else {
        // Create new activity
        const { error } = await supabase
          .from('activities')
          .insert([activityData])

        if (error) throw error
      }

      // Reset form and refresh data
      resetForm()
      fetchActivities()
    } catch (error) {
      console.error('Error saving activity:', error)
      alert('Error saving activity. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setFormData({
      title_en: activity.title_en,
      title_ne: activity.title_ne,
      description_en: activity.description_en,
      description_ne: activity.description_ne,
      event_date: activity.event_date,
      is_featured: activity.is_featured,
      is_published: activity.is_published,
      display_order: activity.display_order
    })
    
    // Set gallery images
    const allImages = [
      ...(activity.preview_img_url ? [activity.preview_img_url] : []),
      ...(activity.gallery_urls || [])
    ]
    setGalleryImages(allImages)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this activity?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchActivities()
    } catch (error) {
      console.error('Error deleting activity:', error)
      alert('Error deleting activity. Please try again.')
    }
  }

  const togglePublished = async (activity: Activity) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('activities')
        .update({ is_published: !activity.is_published })
        .eq('id', activity.id)

      if (error) throw error
      fetchActivities()
    } catch (error) {
      console.error('Error updating activity status:', error)
      alert('Error updating activity status. Please try again.')
    }
  }

  const toggleFeatured = async (activity: Activity) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('activities')
        .update({ is_featured: !activity.is_featured })
        .eq('id', activity.id)

      if (error) throw error
      fetchActivities()
    } catch (error) {
      console.error('Error updating featured status:', error)
      alert('Error updating featured status. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_ne: '',
      description_en: '',
      description_ne: '',
      event_date: '',
      is_featured: false,
      is_published: true,
      display_order: 0
    })
    setGalleryImages([])
    setShowForm(false)
    setEditingActivity(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
      
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activities Management</h1>
              <p className="text-gray-600">Manage school activities and events</p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Activity
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Activities List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <li key={activity.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0 h-20 w-20">
                        {activity.preview_img_url ? (
                          <Image
                            src={activity.preview_img_url}
                            alt={activity.title_en}
                            width={80}
                            height={80}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {activity.title_en}
                          </div>
                          <div className="ml-2 flex space-x-1">
                            {activity.is_featured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.is_published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.title_ne}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(activity.event_date)}</span>
                          {activity.gallery_urls && (
                            <span className="ml-4">
                              {(activity.gallery_urls.length + (activity.preview_img_url ? 1 : 0))} photos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublished(activity)}
                        title={activity.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {activity.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatured(activity)}
                        title={activity.is_featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star className={`w-4 h-4 ${activity.is_featured ? 'fill-current text-amber-500' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(activity)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(activity.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingActivity ? 'Edit Activity' : 'Add Activity'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (नेपाली)
                    </label>
                    <input
                      type="text"
                      value={formData.title_ne}
                      onChange={(e) => setFormData({...formData, title_ne: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (English)
                    </label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (नेपाली)
                    </label>
                    <textarea
                      value={formData.description_ne}
                      onChange={(e) => setFormData({...formData, description_ne: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Images
                  </label>
                  <MultiImageUpload
                    onImagesUploaded={setGalleryImages}
                    currentImages={galleryImages}
                    bucketName="activities-images"
                    maxImages={10}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_published}
                          onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                          className="mr-2"
                        />
                        Published
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                          className="mr-2"
                        />
                        Featured
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting ? 'Saving...' : editingActivity ? 'Update Activity' : 'Add Activity'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
