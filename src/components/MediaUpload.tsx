import { useState } from 'react'
import { Upload, X, Image as ImageIcon, Video, AlertCircle } from 'lucide-react'
import { MediaFile, validateMediaFile, createPreview } from '../lib/storage'

interface MediaUploadProps {
  mediaFiles: MediaFile[]
  onMediaChange: (files: MediaFile[]) => void
  maxFiles?: number
  accept?: string
}

function MediaUpload({ mediaFiles, onMediaChange, maxFiles = 10, accept = 'image/*,video/*' }: MediaUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (files: File[]) => {
    setError(null)

    if (mediaFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const newMediaFiles: MediaFile[] = []

    for (const file of files) {
      const validation = validateMediaFile(file)
      
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        continue
      }

      const preview = await createPreview(file)

      newMediaFiles.push({
        id: `temp-${Date.now()}-${Math.random()}`,
        file,
        type: validation.type!,
        preview
      })
    }

    if (newMediaFiles.length > 0) {
      onMediaChange([...mediaFiles, ...newMediaFiles])
    }
  }

  const removeFile = (id: string) => {
    onMediaChange(mediaFiles.filter(f => f.id !== id))
    setError(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive
            ? 'border-rose-400 bg-rose-50'
            : 'border-soft hover:border-rose-300 hover:bg-background-secondary'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="media-upload"
          multiple
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            dragActive ? 'bg-rose-100' : 'bg-background-secondary'
          }`}>
            <Upload size={32} className="text-rose-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {dragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Images (JPG, PNG, WebP) up to 5MB • Videos (MP4, MOV, WebM) up to 50MB
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* File Preview */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediaFiles.map((media) => (
            <div
              key={media.id}
              className="relative group aspect-square rounded-2xl overflow-hidden bg-background-secondary border border-soft"
            >
              {media.type === 'image' && media.preview ? (
                <img
                  src={media.preview}
                  alt={media.file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Video size={32} className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500 text-center px-2">
                    {media.file.name}
                  </span>
                </div>
              )}
              
              {/* Remove Button */}
              <button
                onClick={() => removeFile(media.id)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>

              {/* File Type Badge */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded-lg flex items-center gap-1">
                {media.type === 'image' ? (
                  <ImageIcon size={12} className="text-white" />
                ) : (
                  <Video size={12} className="text-white" />
                )}
                <span className="text-xs text-white">{formatFileSize(media.file.size)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Count */}
      {mediaFiles.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          {mediaFiles.length} of {maxFiles} files selected
        </p>
      )}
    </div>
  )
}

export default MediaUpload
