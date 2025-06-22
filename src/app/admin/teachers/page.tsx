'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Database } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

type Teacher = Database['public']['Tables']['teachers']['Row']
type TeacherInsert = Database['public']['Tables']['teachers']['Insert']

interface EditingTeacher extends Partial<TeacherInsert> {
  isNew?: boolean
}

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [editingTeacher, setEditingTeacher] = useState<EditingTeacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const supabase = createClient()

  // Load existing teachers
  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('display_order')

      if (error) throw error
      setTeachers(data || [])
    } catch (err: unknown) {
      setError(`Failed to load teachers: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setError('')
    setSuccess('')
  }

  const handleAdd = () => {
    setEditingTeacher({
      isNew: true,
      name_en: '',
      name_ne: '',
      position_en: '',
      position_ne: '',
      bio_en: '',
      bio_ne: '',
      email: '',
      phone: '',
      qualifications_en: '',
      qualifications_ne: '',
      experience_years: 0,
      specialization_en: '',
      specialization_ne: '',
      display_order: teachers.length + 1,
      is_active: true,
    })
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    if (!editingTeacher) return

    setSaving(true)
    setError('')

    try {
      const saveData = {
        name_en: editingTeacher.name_en?.trim() || '',
        name_ne: editingTeacher.name_ne?.trim() || '',
        position_en: editingTeacher.position_en?.trim() || '',
        position_ne: editingTeacher.position_ne?.trim() || '',
        bio_en: editingTeacher.bio_en?.trim() || null,
        bio_ne: editingTeacher.bio_ne?.trim() || null,
        email: editingTeacher.email?.trim() || null,
        phone: editingTeacher.phone?.trim() || null,
        qualifications_en: editingTeacher.qualifications_en?.trim() || null,
        qualifications_ne: editingTeacher.qualifications_ne?.trim() || null,
        experience_years: editingTeacher.experience_years || 0,
        specialization_en: editingTeacher.specialization_en?.trim() || null,
        specialization_ne: editingTeacher.specialization_ne?.trim() || null,
        display_order: editingTeacher.display_order || 1,
        is_active: editingTeacher.is_active ?? true,
        updated_at: new Date().toISOString(),
      }

      if (editingTeacher.isNew) {
        // Insert new teacher
        const { data, error } = await supabase
          .from('teachers')
          .insert(saveData)
          .select()
          .single()

        if (error) throw error
        setTeachers([...teachers, data])
        setSuccess('New teacher added successfully!')
      } else {
        // Update existing teacher
        const { data, error } = await supabase
          .from('teachers')
          .update(saveData)
          .eq('id', editingTeacher.id!)
          .select()
          .single()

        if (error) throw error
        setTeachers(teachers.map(t => t.id === editingTeacher.id ? data : t))
        setSuccess('Teacher updated successfully!')
      }

      setEditingTeacher(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return

    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTeachers(teachers.filter(t => t.id !== id))
      setSuccess('Teacher deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(`Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const toggleActive = async (teacher: Teacher) => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update({ 
          is_active: !teacher.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', teacher.id)
        .select()
        .single()

      if (error) throw error
      setTeachers(teachers.map(t => t.id === teacher.id ? data : t))
      setSuccess(`Teacher ${data.is_active ? 'activated' : 'deactivated'} successfully!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError(`Failed to update status: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleCancel = () => {
    setEditingTeacher(null)
    setError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teachers...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Teachers Manager</h1>
                <p className="text-gray-600">Manage teacher profiles and information</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href="/teachers" target="_blank">
                <Button variant="outline">
                  Preview Page
                </Button>
              </Link>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                Add Teacher
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
          {editingTeacher && (
            <div className="mb-8 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {editingTeacher.isNew ? 'Add New Teacher' : 'Edit Teacher'}
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (English) *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Ram Kumar Sharma"
                      value={editingTeacher.name_en || ''}
                      onChange={(e) => setEditingTeacher({...editingTeacher, name_en: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (Nepali) *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., राम कुमार शर्मा"
                      value={editingTeacher.name_ne || ''}
                      onChange={(e) => setEditingTeacher({...editingTeacher, name_ne: e.target.value})}
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position (English) *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Mathematics Teacher"
                      value={editingTeacher.position_en || ''}
                      onChange={(e) => setEditingTeacher({...editingTeacher, position_en: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position (Nepali) *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., गणित शिक्षक"
                      value={editingTeacher.position_ne || ''}
                      onChange={(e) => setEditingTeacher({...editingTeacher, position_ne: e.target.value})}
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., teacher@school.edu.np"
                      value={editingTeacher.email || ''}
                      onChange={(e) => setEditingTeacher({...editingTeacher, email: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., +977-1-4567890"
                      value={editingTeacher.phone || ''}
                      onChange={(e) => setEditingTeacher({...editingTeacher, phone: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 10"
                      value={editingTeacher.experience_years || ''}
                      onChange={(e) => setEditingTeacher({...editingTeacher, experience_years: parseInt(e.target.value) || 0})}
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
                      value={editingTeacher.display_order || ''}
                      onChange={(e) => setEditingTeacher({...editingTeacher, display_order: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
                
                {/* Bio and Qualifications - Full Width */}
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio (English)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief biography of the teacher..."
                      value={editingTeacher.bio_en || ''}
                      onChange={(e) => setEditingTeacher({...editingTeacher, bio_en: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio (Nepali)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="शिक्षकको संक्षिप्त परिचय..."
                      value={editingTeacher.bio_ne || ''}
                      onChange={(e) => setEditingTeacher({...editingTeacher, bio_ne: e.target.value})}
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualifications (English)
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., M.Ed, B.Ed"
                        value={editingTeacher.qualifications_en || ''}
                        onChange={(e) => setEditingTeacher({...editingTeacher, qualifications_en: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualifications (Nepali)
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., शिक्षामा स्नातकोत्तर"
                        value={editingTeacher.qualifications_ne || ''}
                        onChange={(e) => setEditingTeacher({...editingTeacher, qualifications_ne: e.target.value})}
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization (English)
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Advanced Mathematics"
                        value={editingTeacher.specialization_en || ''}
                        onChange={(e) => setEditingTeacher({...editingTeacher, specialization_en: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization (Nepali)
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., उच्च गणित"
                        value={editingTeacher.specialization_ne || ''}
                        onChange={(e) => setEditingTeacher({...editingTeacher, specialization_ne: e.target.value})}
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      />
                    </div>
                  </div>
                  
                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={editingTeacher.is_active ?? true}
                      onChange={(e) => setEditingTeacher({...editingTeacher, is_active: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Active (visible on public page)
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={
                      saving || 
                      !editingTeacher.name_en?.trim() || 
                      !editingTeacher.name_ne?.trim() ||
                      !editingTeacher.position_en?.trim() ||
                      !editingTeacher.position_ne?.trim()
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? 'Saving...' : (editingTeacher.isNew ? 'Add Teacher' : 'Save Changes')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Teachers List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Current Teachers</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {teachers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No teachers found. Add first teacher above.
                </div>
              ) : (
                teachers.map((teacher) => (
                  <div key={teacher.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4">
                        {/* Photo placeholder */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {teacher.photo_url ? (
                            <Image
                              src={teacher.photo_url}
                              alt={teacher.name_en}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-gray-500 text-lg font-semibold">
                              {teacher.name_en.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {teacher.name_en}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              teacher.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {teacher.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            {teacher.name_ne}
                          </p>
                          <p className="text-blue-600 font-medium">
                            {teacher.position_en}
                          </p>
                          <p className="text-sm text-gray-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            {teacher.position_ne}
                          </p>
                          
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                            {teacher.experience_years > 0 && (
                              <span>📅 {teacher.experience_years} years exp.</span>
                            )}
                            {teacher.email && (
                              <span>📧 {teacher.email}</span>
                            )}
                            {teacher.specialization_en && (
                              <span>🎯 {teacher.specialization_en}</span>
                            )}
                            <span className="text-gray-400">Order: {teacher.display_order}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleActive(teacher)}
                          className={teacher.is_active ? "text-amber-600 hover:text-amber-800" : "text-green-600 hover:text-green-800"}
                        >
                          {teacher.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(teacher)}>
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(teacher.id)}
                          className="text-red-600 hover:text-red-800 hover:border-red-300"
                        >
                          Delete
                        </Button>
                      </div>
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
