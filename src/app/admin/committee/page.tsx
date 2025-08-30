'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { User } from '@supabase/supabase-js'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ImageUpload'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'
import { Building, Users2, Settings, Edit3 } from 'lucide-react'

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
  committee_type: string
  created_at: string
  updated_at: string
}

interface CommitteeContent {
  id: number
  committee_type: string
  title_en: string
  title_ne: string
  description_en: string | null
  description_ne: string | null
  is_active: boolean
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
  committee_type: string
}

interface ContentFormData {
  title_en: string
  title_ne: string
  description_en: string
  description_ne: string
  is_active: boolean
}

export default function AdminCommittee() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [committee, setCommittee] = useState<Committee[]>([])
  const [committeeContent, setCommitteeContent] = useState<CommitteeContent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showContentForm, setShowContentForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Committee | null>(null)
  const [editingContent, setEditingContent] = useState<CommitteeContent | null>(null)
  const [activeTab, setActiveTab] = useState<'SMC' | 'PTA'>('SMC')
  const [formData, setFormData] = useState<CommitteeFormData>({
    name_en: '',
    name_ne: '',
    role_en: '',
    role_ne: '',
    bio_en: '',
    bio_ne: '',
    display_order: 0,
    is_active: true,
    committee_type: 'SMC'
  })
  const [contentFormData, setContentFormData] = useState<ContentFormData>({
    title_en: '',
    title_ne: '',
    description_en: '',
    description_ne: '',
    is_active: true
  })
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
      fetchData()
    }

    checkUser()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    const [committeeResult, contentResult] = await Promise.all([
      supabase
        .from('committee')
        .select('*')
        .order('display_order'),
      supabase
        .from('committee_content')
        .select('*')
    ])

    if (committeeResult.error) {
      console.error('Error fetching committee:', committeeResult.error)
    } else {
      setCommittee(committeeResult.data || [])
    }

    if (contentResult.error) {
      console.error('Error fetching committee content:', contentResult.error)
    } else {
      setCommitteeContent(contentResult.data || [])
    }
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = createClient()
      
      const memberData = {
        ...formData,
        photo_url: photoUrl
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
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving committee member:', error)
      alert('Error saving committee member. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = createClient()
      
      const contentData = {
        ...contentFormData,
        committee_type: activeTab
      }

      if (editingContent) {
        // Update existing content
        const { error } = await supabase
          .from('committee_content')
          .update(contentData)
          .eq('id', editingContent.id)

        if (error) throw error
      } else {
        // Create new content
        const { error } = await supabase
          .from('committee_content')
          .insert([contentData])

        if (error) throw error
      }

      // Reset form and refresh data
      resetContentForm()
      fetchData()
    } catch (error) {
      console.error('Error saving committee content:', error)
      alert('Error saving committee content. Please try again.')
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
      is_active: member.is_active,
      committee_type: member.committee_type
    })
    setPhotoUrl(member.photo_url)
    setShowForm(true)
  }

  const handleEditContent = (content: CommitteeContent) => {
    setEditingContent(content)
    setContentFormData({
      title_en: content.title_en,
      title_ne: content.title_ne,
      description_en: content.description_en || '',
      description_ne: content.description_ne || '',
      is_active: content.is_active
    })
    setShowContentForm(true)
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
      fetchData()
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
      is_active: true,
      committee_type: activeTab
    })
    setPhotoUrl(null)
    setShowForm(false)
    setEditingMember(null)
  }

  const resetContentForm = () => {
    setContentFormData({
      title_en: '',
      title_ne: '',
      description_en: '',
      description_ne: '',
      is_active: true
    })
    setShowContentForm(false)
    setEditingContent(null)
  }

  // Filter committee members by active tab
  const filteredCommittee = committee.filter(member => member.committee_type === activeTab)
  const currentContent = committeeContent.find(content => content.committee_type === activeTab)

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
              <p className="text-gray-600">Manage SMC and PTA committee members and content</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => setShowContentForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Content
              </Button>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Committee Member
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-2 shadow-sm border">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('SMC')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === 'SMC'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Building size={20} />
                  <span>SMC</span>
                </button>
                <button
                  onClick={() => setActiveTab('PTA')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === 'PTA'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Users2 size={20} />
                  <span>PTA</span>
                </button>
              </div>
            </div>
          </div>

          {/* Committee Content Section */}
          {currentContent && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {activeTab} Content
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditContent(currentContent)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Content
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Title</h3>
                  <p className="text-gray-900">{currentContent.title_en}</p>
                  <p className="text-gray-600 text-sm mt-1">{currentContent.title_ne}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-900 text-sm">{currentContent.description_en}</p>
                  <p className="text-gray-600 text-sm mt-1">{currentContent.description_ne}</p>
                </div>
              </div>
            </div>
          )}

          {/* Committee List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {activeTab} Committee Members
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage {activeTab} committee member profiles and information
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {filteredCommittee.map((member) => (
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
              {filteredCommittee.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">
                  No {activeTab} committee members found. Add some members to get started.
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>

      {/* Committee Member Form Modal */}
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
                      Committee Type
                    </label>
                    <select
                      value={formData.committee_type}
                      onChange={(e) => setFormData({...formData, committee_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="SMC">SMC (School Management Committee)</option>
                      <option value="PTA">PTA (Parents Teachers Association)</option>
                    </select>
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
                </div>

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
                    onImageUpload={setPhotoUrl}
                    onImageRemove={() => setPhotoUrl(null)}
                    currentImageUrl={photoUrl}
                    folder="committee-photos"
                    maxSizeMB={5}
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

      {/* Committee Content Form Modal */}
      {showContentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingContent ? 'Edit Committee Content' : 'Add Committee Content'}
                </h2>
                <button
                  onClick={resetContentForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleContentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Committee Type
                  </label>
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value as 'SMC' | 'PTA')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="SMC">SMC (School Management Committee)</option>
                    <option value="PTA">PTA (Parents Teachers Association)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      value={contentFormData.title_en}
                      onChange={(e) => setContentFormData({...contentFormData, title_en: e.target.value})}
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
                      value={contentFormData.title_ne}
                      onChange={(e) => setContentFormData({...contentFormData, title_ne: e.target.value})}
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
                      value={contentFormData.description_en}
                      onChange={(e) => setContentFormData({...contentFormData, description_en: e.target.value})}
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
                      value={contentFormData.description_ne}
                      onChange={(e) => setContentFormData({...contentFormData, description_ne: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={contentFormData.is_active.toString()}
                    onChange={(e) => setContentFormData({...contentFormData, is_active: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetContentForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {submitting ? 'Saving...' : editingContent ? 'Update Content' : 'Add Content'}
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
