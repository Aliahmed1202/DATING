import { supabase } from './supabase'

const BUCKET_NAME = 'ourspace-media'

export interface MediaFile {
  id: string
  file: File
  type: 'image' | 'video'
  preview?: string
}

export interface MediaUploadResult {
  id: string
  url: string
  type: 'image' | 'video'
  name: string
  size: number
}

// Validate file type and size
export const validateMediaFile = (file: File): { valid: boolean; type: 'image' | 'video' | null; error?: string } => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  const videoTypes = ['video/mp4', 'video/quicktime', 'video/webm']
  
  const maxSizeImage = 5 * 1024 * 1024 // 5MB
  const maxSizeVideo = 50 * 1024 * 1024 // 50MB

  if (imageTypes.includes(file.type)) {
    if (file.size > maxSizeImage) {
      return { valid: false, type: null, error: 'Image size must be less than 5MB' }
    }
    return { valid: true, type: 'image' }
  }

  if (videoTypes.includes(file.type)) {
    if (file.size > maxSizeVideo) {
      return { valid: false, type: null, error: 'Video size must be less than 50MB' }
    }
    return { valid: true, type: 'video' }
  }

  return { valid: false, type: null, error: 'Invalid file type. Only JPG, PNG, WebP, MP4, MOV, and WebM are allowed.' }
}

// Generate preview for images
export const createPreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve('')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Upload file to Supabase Storage
export const uploadMediaFile = async (
  file: File,
  userId: string,
  parentId: string,
  parentType: 'memory' | 'event' | 'note'
): Promise<MediaUploadResult> => {
  const validation = validateMediaFile(file)
  if (!validation.valid || !validation.type) {
    throw new Error(validation.error || 'Invalid file')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${parentType}/${parentId}/${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return {
    id: data.id,
    url: publicUrl,
    type: validation.type,
    name: file.name,
    size: file.size
  }
}

// Delete file from Supabase Storage
export const deleteMediaFile = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

// Upload multiple files
export const uploadMultipleMediaFiles = async (
  files: File[],
  userId: string,
  parentId: string,
  parentType: 'memory' | 'event' | 'note',
  onProgress?: (progress: number) => void
): Promise<MediaUploadResult[]> => {
  const results: MediaUploadResult[] = []
  
  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadMediaFile(files[i], userId, parentId, parentType)
      results.push(result)
      if (onProgress) {
        onProgress(((i + 1) / files.length) * 100)
      }
    } catch (error) {
      console.error(`Failed to upload file ${files[i].name}:`, error)
    }
  }

  return results
}

// Get signed URL for private files (if needed)
export const getSignedUrl = async (filePath: string, expiresIn: number = 3600): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn)

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`)
  }

  return data.signedUrl
}
