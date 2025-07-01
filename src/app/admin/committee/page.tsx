'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { User } from '@supabase/supabase-js'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ImageUpload'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'

interface Committee {
  id: number
  name_en: string
  name_ne: string
  role_en: string
  role_ne: string
  photo_url: string | null
  bio_en: string | null
  bio_ne: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CommitteeFormData {
  name_en: string
  name_ne: string
  role_en: string
  role_ne: string
  bio_en: string
  bio_ne: string
  display_order: number
  is_active: boolean
}

export default function AdminCommittee() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [committee, setCommittee] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Committee | null>(null)
  const [formData, setFormData] = useState<CommitteeFormData>({
    name_en: '',
    name_ne: '',
    role_en: '',
    role_ne: '',
    bio_en: '',
    bio_ne: '',
    display_order: 0,
    is_active: true
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
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
      fetchCommittee()
    }

    checkUser()
  }, [])

  async function fetchCommittee() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('committee')
      .select('*')
      .order('display_order')

    if (error) {
      console.error('Error fetching committee:', error)
    } else {
      setCommittee(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = createClient()
      let finalPhotoUrl = photoUrl

      // Upload photo if selected
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('committee-photos')
          .upload(fileName, photoFile)

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('committee-photos')
          .getPublicUrl(uploadData.path)
        
        finalPhotoUrl = publicUrl
      }

      const memberData = {
        ...formData,
        photo_url: finalPhotoUrl
      }

      if (editingMember) {
        // Update existing member
        const { error } = await supabase
          .from('committee')
          .update(memberData)
          .eq('id', editingMember.id)

        if (error) throw error
      } else {
        // Create new member
        const { error } = await supabase
          .from('committee')
          .insert([memberData])

        if (error) throw error
      }

      // Reset form and refresh data
      setFormData({
        name_en: '',
        name_ne: '',
        role_en: '',
        role_ne: '',
        bio_en: '',
        bio_ne: '',
        display_order: 0,
        is_active: true
      })
      setPhotoFile(null)
      setPhotoUrl(null)
      setShowForm(false)
      setEditingMember(null)
      fetchCommittee()
    } catch (error) {
      console.error('Error saving committee member:', error)
      alert('Error saving committee member. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (member: Committee) => {
    setEditingMember(member)
    setFormData({
      name_en: member.name_en,
      name_ne: member.name_ne,
      role_en: member.role_en,
      role_ne: member.role_ne,
      bio_en: member.bio_en || '',
      bio_ne: member.bio_ne || '',
      display_order: member.display_order,
      is_active: member.is_active
    })
    setPhotoUrl(member.photo_url)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this committee member?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('committee')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchCommittee()
    } catch (error) {
      console.error('Error deleting committee member:', error)
      alert('Error deleting committee member. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ne: '',
      role_en: '',
      role_ne: '',
      bio_en: '',
      bio_ne: '',
      display_order: 0,
      is_active: true
    })
    setPhotoFile(null)
    setPhotoUrl(null)
    setShowForm(false)
    setEditingMember(null)
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
              <h1 className="text-3xl font-bold text-gray-900">Committee Management</h1>
              <p className="text-gray-600">Manage management committee members</p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Committee Member
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Committee List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {committee.map((member) => (
                <li key={member.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        {member.photo_url ? (
                          <Image
                            src={member.photo_url}
                            alt={member.name_en}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name_en} / {member.name_ne}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.role_en} / {member.role_ne}
                        </div>
                        <div className="text-xs text-gray-400">
                          Order: {member.display_order} | {member.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(member)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingMember ? 'Edit Committee Member' : 'Add Committee Member'}
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
                      Name (English)
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (नेपाली)
                    </label>
                    <input
                      type="text"
                      value={formData.name_ne}
                      onChange={(e) => setFormData({...formData, name_ne: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role (English)
                    </label>
                    <input
                      type="text"
                      value={formData.role_en}
                      onChange={(e) => setFormData({...formData, role_en: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role (नेपाली)
                    </label>
                    <input
                      type="text"
                      value={formData.role_ne}
                      onChange={(e) => setFormData({...formData, role_ne: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo
                  </label>
                  <ImageUpload
                    onFileSelected={setPhotoFile}
                    currentImageUrl={photoUrl}
                    bucketName="committee-photos"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biography (English)
                    </label>
                    <textarea
                      value={formData.bio_en}
                      onChange={(e) => setFormData({...formData, bio_en: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biography (नेपाली)
                    </label>
                    <textarea
                      value={formData.bio_ne}
                      onChange={(e) => setFormData({...formData, bio_ne: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <select
                      value={formData.is_active.toString()}
                      onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
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
                    {submitting ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
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
