'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ImageUpload'
import { useLanguage } from '@/contexts/LanguageContext'

interface QuickLink {
  label_en: string
  label_ne: string
  url: string
}

interface Footer {
  id: number
  school_name_en: string
  school_name_ne: string
  address_en: string
  address_ne: string
  phone: string
  email: string
  office_hours_en: string | null
  office_hours_ne: string | null
  facebook_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  linkedin_url: string | null
  quick_links: QuickLink[]
  logo_url: string | null
  copyright_text_en: string | null
  copyright_text_ne: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface FooterFormData {
  school_name_en: string
  school_name_ne: string
  address_en: string
  address_ne: string
  phone: string
  email: string
  office_hours_en: string
  office_hours_ne: string
  facebook_url: string
  twitter_url: string
  instagram_url: string
  youtube_url: string
  linkedin_url: string
  copyright_text_en: string
  copyright_text_ne: string
}

export default function AdminFooter() {
  const { t } = useLanguage()
  const [footer, setFooter] = useState<Footer | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FooterFormData>({
    school_name_en: '',
    school_name_ne: '',
    address_en: '',
    address_ne: '',
    phone: '',
    email: '',
    office_hours_en: '',
    office_hours_ne: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    youtube_url: '',
    linkedin_url: '',
    copyright_text_en: '',
    copyright_text_ne: ''
  })
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([])
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = '/admin/login'
        return
      }
      
      fetchFooter()
    }

    checkUser()
  }, [])

  async function fetchFooter() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('footer')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching footer:', error)
    } else if (data) {
      setFooter(data)
      setFormData({
        school_name_en: data.school_name_en,
        school_name_ne: data.school_name_ne,
        address_en: data.address_en,
        address_ne: data.address_ne,
        phone: data.phone,
        email: data.email,
        office_hours_en: data.office_hours_en || '',
        office_hours_ne: data.office_hours_ne || '',
        facebook_url: data.facebook_url || '',
        twitter_url: data.twitter_url || '',
        instagram_url: data.instagram_url || '',
        youtube_url: data.youtube_url || '',
        linkedin_url: data.linkedin_url || '',
        copyright_text_en: data.copyright_text_en || '',
        copyright_text_ne: data.copyright_text_ne || ''
      })
      setQuickLinks(data.quick_links || [])
      setLogoUrl(data.logo_url)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const supabase = createClient()
      
      const footerData = {
        ...formData,
        quick_links: quickLinks,
        logo_url: logoUrl
      }

      let result
      if (footer) {
        result = await supabase
          .from('footer')
          .update(footerData)
          .eq('id', footer.id)
      } else {
        result = await supabase
          .from('footer')
          .insert([footerData])
      }

      if (result.error) {
        throw result.error
      }

      setMessage({ type: 'success', text: t('footer.footerSaved') })
      fetchFooter()
    } catch (error) {
      console.error('Error saving footer:', error)
      setMessage({ type: 'error', text: t('footer.errorSaving') })
    } finally {
      setSubmitting(false)
    }
  }

  const addQuickLink = () => {
    setQuickLinks([...quickLinks, { label_en: '', label_ne: '', url: '' }])
  }

  const updateQuickLink = (index: number, field: keyof QuickLink, value: string) => {
    const updatedLinks = [...quickLinks]
    updatedLinks[index] = { ...updatedLinks[index], [field]: value }
    setQuickLinks(updatedLinks)
  }

  const removeQuickLink = (index: number) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('footer.title')}</h1>
          <p className="mt-2 text-gray-600">
            Manage website footer content and settings
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('footer.contactInfo')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.schoolName')} (English)
                </label>
                <input
                  type="text"
                  value={formData.school_name_en}
                  onChange={(e) => setFormData({...formData, school_name_en: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.schoolName')} (नेपाली)
                </label>
                <input
                  type="text"
                  value={formData.school_name_ne}
                  onChange={(e) => setFormData({...formData, school_name_ne: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.address')} (English)
                </label>
                <textarea
                  value={formData.address_en}
                  onChange={(e) => setFormData({...formData, address_en: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.address')} (नेपाली)
                </label>
                <textarea
                  value={formData.address_ne}
                  onChange={(e) => setFormData({...formData, address_ne: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.officeHours')} (English)
                </label>
                <input
                  type="text"
                  value={formData.office_hours_en}
                  onChange={(e) => setFormData({...formData, office_hours_en: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Monday - Friday: 8:00 AM - 4:00 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.officeHours')} (नेपाली)
                </label>
                <input
                  type="text"
                  value={formData.office_hours_ne}
                  onChange={(e) => setFormData({...formData, office_hours_ne: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="सोमबार - शुक्रबार: बिहान ८:०० - बेलुका ४:००"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('footer.socialMedia')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.facebook')}
                </label>
                <input
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://facebook.com/"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.twitter')}
                </label>
                <input
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({...formData, twitter_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://twitter.com/"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.instagram')}
                </label>
                <input
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://instagram.com/"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.youtube')}
                </label>
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://youtube.com/"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.linkedin')}
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://linkedin.com/school/"
                />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('footer.quickLinks')}
              </h2>
              <Button
                type="button"
                onClick={addQuickLink}
                variant="outline"
              >
                {t('footer.addLink')}
              </Button>
            </div>
            
            <div className="space-y-4">
              {quickLinks.map((link, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Link {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeQuickLink(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      {t('footer.removeLink')}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('footer.linkLabel')} (English)
                      </label>
                      <input
                        type="text"
                        value={link.label_en}
                        onChange={(e) => updateQuickLink(index, 'label_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="About Us"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('footer.linkLabel')} (नेपाली)
                      </label>
                      <input
                        type="text"
                        value={link.label_ne}
                        onChange={(e) => updateQuickLink(index, 'label_ne', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="हाम्रो बारेमा"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('footer.linkUrl')}
                      </label>
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="/about"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Branding */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('footer.branding')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('footer.logo')}
                </label>
                <ImageUpload
                  onImageUpload={setLogoUrl}
                  onImageRemove={() => setLogoUrl(null)}
                  currentImageUrl={logoUrl}
                  folder="footer-assets"
                  maxSizeMB={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('footer.copyrightText')} (English)
                  </label>
                  <input
                    type="text"
                    value={formData.copyright_text_en}
                    onChange={(e) => setFormData({...formData, copyright_text_en: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="© 2025 School Name. All rights reserved."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('footer.copyrightText')} (नेपाली)
                  </label>
                  <input
                    type="text"
                    value={formData.copyright_text_ne}
                    onChange={(e) => setFormData({...formData, copyright_text_ne: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="© २०२५ तपाईंको विद्यालयको नाम। सबै अधिकार सुरक्षित।"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="px-6 py-2"
            >
              {submitting ? t('common.loading') : t('footer.saveFooter')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
