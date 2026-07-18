import { useState } from 'react'
import { Image as ImageIcon, Video, X, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { Media } from '../types'

interface MediaGalleryProps {
  media: Media[]
  onRemove?: (mediaId: string) => void
  editable?: boolean
}

function MediaGallery({ media, onRemove, editable = false }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  if (!media || media.length === 0) {
    return null
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))
    setSelectedMedia(media[currentIndex === 0 ? media.length - 1 : currentIndex - 1])
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))
    setSelectedMedia(media[currentIndex === media.length - 1 ? 0 : currentIndex + 1])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') setSelectedMedia(null)
  }

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {media.map((item, index) => (
          <div
            key={item.id}
            className="relative group aspect-square rounded-2xl overflow-hidden bg-background-secondary cursor-pointer border border-soft hover:border-rose-300 transition-all"
            onClick={() => {
              setSelectedMedia(item)
              setCurrentIndex(index)
            }}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-rose-100">
                <Video size={32} className="text-purple-600 mb-2" />
                <span className="text-xs text-gray-600 text-center px-2 truncate w-full">
                  {item.name}
                </span>
              </div>
            )}

            {/* Play icon for videos */}
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <Play size={20} className="text-purple-600 ml-1" />
                </div>
              </div>
            )}

            {/* Remove button */}
            {editable && onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(item.id)
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            )}

            {/* Type badge */}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded-lg flex items-center gap-1">
              {item.type === 'image' ? (
                <ImageIcon size={12} className="text-white" />
              ) : (
                <Video size={12} className="text-white" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Navigation buttons */}
            {media.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Media content */}
            <div className="flex items-center justify-center">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl"
                />
              ) : (
                <div className="w-full max-w-3xl">
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay={isPlaying}
                    className="w-full rounded-2xl"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              )}
            </div>

            {/* Counter */}
            {media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">
                {currentIndex + 1} / {media.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default MediaGallery
