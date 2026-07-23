import { supabase } from './supabase'
import { insertMediaRecord } from './data'

const BUCKET_NAME = 'loll'

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
  file_path: string
}

// Validate file type and size
export const validateMediaFile = (
  file: File
): { valid: boolean; type: 'image' | 'video' | null; error?: string } => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  const videoTypes = ['video/mp4', 'video/quicktime', 'video/webm']

  const maxSizeImage = 5 * 1024 * 1024  // 5 MB
  const maxSizeVideo = 50 * 1024 * 1024 // 50 MB

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

  return {
    valid: false,
    type: null,
    error: 'Invalid file type. Only JPG, PNG, WebP, MP4, MOV, and WebM are allowed.',
  }
}

// Generate preview URL for images
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

/**
 * Upload a single file to Supabase Storage and save a record to the media table.
 */
export const uploadMediaFile = async (
  file: File,
  userId: string,
  parentId: string,
  parentType: 'memory' | 'event' | 'note' | 'avatar'
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
      upsert: false,
    })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  const result: MediaUploadResult = {
    id: data.id ?? crypto.randomUUID(),
    url: publicUrl,
    type: validation.type,
    name: file.name,
    size: file.size,
    file_path: filePath,
  }

  // Persist a record in the media table for non-avatar uploads
  if (parentType !== 'avatar') {
    try {
      const saved = await insertMediaRecord({
        parent_id: parentId,
        parent_type: parentType as 'memory' | 'event' | 'note',
        type: validation.type,
        url: publicUrl,
        file_path: filePath,
        name: file.name,
        size: file.size,
        uploaded_by: userId,
      })
      // Use the DB-generated UUID so the caller has the real id
      result.id = saved.id
    } catch (dbErr) {
      console.error('Media DB record save failed (file is still in bucket):', dbErr)
    }
  }

  return result
}

/**
 * Delete a file from Supabase Storage.
 */
export const deleteMediaFile = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])
  if (error) throw new Error(`Delete failed: ${error.message}`)
}

/**
 * Upload multiple files sequentially, reporting progress.
 */
export const uploadMultipleMediaFiles = async (
  files: File[],
  userId: string,
  parentId: string,
  parentType: 'memory' | 'event' | 'note' | 'avatar',
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

/**
 * Get a signed URL for a private file (if bucket is not public).
 */
export const getSignedUrl = async (
  filePath: string,
  expiresIn = 3600
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn)

  if (error) throw new Error(`Failed to get signed URL: ${error.message}`)
  return data.signedUrl
}
