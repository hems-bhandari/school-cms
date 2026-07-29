export const IMAGE_UPLOAD_TYPES: Record<string, readonly string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
}

export const NOTICE_UPLOAD_TYPES: Record<string, readonly string[]> = {
  ...IMAGE_UPLOAD_TYPES,
  'application/pdf': ['pdf'],
}

export const DOCUMENT_UPLOAD_TYPES: Record<string, readonly string[]> = {
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-powerpoint': ['ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
  'text/plain': ['txt'],
}

export function validateUpload(
  file: File,
  allowedTypes: Record<string, readonly string[]>,
  maxSizeMB: number,
): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = allowedTypes[file.type]

  if (!extension || !allowedExtensions?.includes(extension)) {
    return 'This file type is not allowed.'
  }

  if (file.size <= 0 || file.size > maxSizeMB * 1024 * 1024) {
    return `File size must be between 1 byte and ${maxSizeMB}MB.`
  }

  return null
}

export function createStorageFileName(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension) throw new Error('The file must have an extension.')
  return `${crypto.randomUUID()}.${extension}`
}
