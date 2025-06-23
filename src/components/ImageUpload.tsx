'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase-client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageUpload: (url: string) => void
  onImageRemove: () => void
  folder?: string
  maxSizeMB?: number
}

export default function ImageUpload({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  folder = 'teacher-photos',
  maxSizeMB = 5
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(folder)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(folder)
        .getPublicUrl(filePath)

      onImageUpload(publicUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [supabase, folder, maxSizeMB, onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: uploading
  })

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return

    try {
      // Extract file path from URL
      const urlParts = currentImageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]

      // Remove from storage
      await supabase.storage
        .from(folder)
        .remove([fileName])

      onImageRemove()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove image')
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Image Display */}
      {currentImageUrl && (
        <div className="relative">
          <div className="w-32 h-32 mx-auto relative rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={currentImageUrl}
              alt="Current photo"
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              className="text-red-600 hover:text-red-800"
            >
              Remove Photo
            </Button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, GIF, WebP up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  )
}
