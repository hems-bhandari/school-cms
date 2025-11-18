'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase-client'
import Image from 'next/image'
import { X, Upload, FileText, Image as ImageIcon, File } from 'lucide-react'

export interface FileAttachment {
  url: string
  name: string
  type: string
  size: number
}

interface NoticeFileUploadProps {
  onFilesUploaded: (files: FileAttachment[]) => void
  currentFiles?: FileAttachment[]
  bucketName: string
  maxFiles?: number
}

export default function NoticeFileUpload({ 
  onFilesUploaded, 
  currentFiles = [], 
  bucketName,
  maxFiles = 20
}: NoticeFileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<FileAttachment[]>(currentFiles)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const isImageFile = (type: string): boolean => {
    return type.startsWith('image/')
  }

  const isPDFFile = (type: string): boolean => {
    return type === 'application/pdf'
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setFiles(currentFiles => {
      if (currentFiles.length + acceptedFiles.length > maxFiles) {
        alert(`You can only upload up to ${maxFiles} files`)
        return currentFiles
      }
      return currentFiles
    })

    setUploading(true)
    const supabase = createClient()
    const uploadedFiles: FileAttachment[] = []

    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file)

        if (error) {
          throw error
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path)
        
        uploadedFiles.push({
          url: publicUrl,
          name: file.name,
          type: file.type,
          size: file.size
        })
      }

      setFiles(currentFiles => {
        const newFiles = [...currentFiles, ...uploadedFiles]
        // Call onFilesUploaded after state update completes
        setTimeout(() => onFilesUploaded(newFiles), 0)
        return newFiles
      })
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [bucketName, maxFiles, onFilesUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
      'application/pdf': ['.pdf']
    },
    multiple: true,
    disabled: uploading || files.length >= maxFiles,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const removeFile = async (indexToRemove: number) => {
    // Optionally delete from storage (commented out for safety - files might be referenced elsewhere)
    // You can enable this if you want to delete files immediately
    /*
    const fileToRemove = files[indexToRemove]
    try {
      const supabase = createClient()
      const path = fileToRemove.url.split('/').pop()
      if (path) {
        await supabase.storage.from(bucketName).remove([path])
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }
    */
    
    setFiles(currentFiles => {
      const newFiles = currentFiles.filter((_, index) => index !== indexToRemove)
      setTimeout(() => onFilesUploaded(newFiles), 0)
      return newFiles
    })
  }

  const moveFile = (fromIndex: number, toIndex: number) => {
    setFiles(currentFiles => {
      const newFiles = [...currentFiles]
      const [movedFile] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, movedFile)
      setTimeout(() => onFilesUploaded(newFiles), 0)
      return newFiles
    })
  }

  const renderFilePreview = (file: FileAttachment) => {
    if (isImageFile(file.type)) {
      return (
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={file.url}
            alt={file.name}
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
      )
    } else if (isPDFFile(file.type)) {
      return (
        <div className="aspect-square bg-red-50 rounded-lg overflow-hidden flex items-center justify-center">
          <FileText className="w-16 h-16 text-red-600" />
        </div>
      )
    } else {
      return (
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          <File className="w-16 h-16 text-gray-600" />
        </div>
      )
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {uploading ? (
            <p className="text-gray-600">Uploading files...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag & drop images or PDFs here, or click to select'}
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, WEBP, PDF up to 10MB each ({files.length}/{maxFiles} files)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Files Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={`${file.url}-${index}`} className="relative group">
              {renderFilePreview(file)}
              
              {/* File Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  {/* Move Left */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveFile(index, index - 1)}
                      className="bg-white text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      title="Move left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Move Right */}
                  {index < files.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveFile(index, index + 1)}
                      className="bg-white text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      title="Move right"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* File Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 rounded-b-lg">
                <p className="text-white text-xs truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-white text-xs opacity-75">
                  {formatFileSize(file.size)}
                </p>
              </div>
              
              {/* File Type Badge */}
              <div className="absolute top-2 right-2">
                {isImageFile(file.type) && (
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>IMG</span>
                  </div>
                )}
                {isPDFFile(file.type) && (
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>PDF</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {files.length > 0 && (
        <p className="text-sm text-gray-500">
          <File className="w-4 h-4 inline mr-1" />
          {files.filter(f => isImageFile(f.type)).length} image(s), {files.filter(f => isPDFFile(f.type)).length} PDF(s)
        </p>
      )}
    </div>
  )
}

