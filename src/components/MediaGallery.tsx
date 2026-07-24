import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Play, Images } from 'lucide-react'
import { Media } from '../types'

interface MediaGalleryProps {
  media: Media[]
  onRemove?: (mediaId: string) => void
  editable?: boolean
}

function MediaGallery({ media, onRemove, editable = false }: MediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!media || media.length === 0) return null

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const prev = () =>
    setLightboxIndex((i) => (i === null ? 0 : i === 0 ? media.length - 1 : i - 1))
  const next = () =>
    setLightboxIndex((i) => (i === null ? 0 : i === media.length - 1 ? 0 : i + 1))

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') closeLightbox()
  }

  // ── Layout helpers ──────────────────────────────────────────
  const count = media.length
  const shown = Math.min(count, 4)           // max 4 thumbnails
  const overflow = count - shown             // +N badge

  const gridClass =
    count === 1 ? 'grid-cols-1' :
    count === 2 ? 'grid-cols-2' :
    count === 3 ? 'grid-cols-3' :
    'grid-cols-2'

  return (
    <>
      {/* ── Thumbnail grid ── */}
      <div className={`grid ${gridClass} gap-1.5 rounded-2xl overflow-hidden`}>
        {media.slice(0, shown).map((item, idx) => {
          const isLast = idx === shown - 1 && overflow > 0
          return (
            <div
              key={item.id}
              className={`relative group cursor-pointer overflow-hidden bg-gray-100
                ${count === 1 ? 'aspect-video' : 'aspect-square'}
                ${count === 3 && idx === 0 ? 'row-span-2 aspect-auto' : ''}
              `}
              onClick={() => openLightbox(idx)}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-rose-100">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow">
                      <Play size={20} className="text-purple-600 ml-1" />
                    </div>
                    <span className="text-xs text-gray-500 px-2 text-center line-clamp-1">
                      {item.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

              {/* +N overflow badge */}
              {isLast && overflow > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1">
                    <Images size={24} className="text-white" />
                    <span className="text-white text-xl font-bold">+{overflow}</span>
                  </div>
                </div>
              )}

              {/* Remove button */}
              {editable && onRemove && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(item.id) }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKey}
          tabIndex={0}
          autoFocus
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <X size={22} />
          </button>

          {/* Prev */}
          {media.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* Media */}
          <div
            className="max-w-5xl max-h-[90vh] w-full px-16 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {media[lightboxIndex].type === 'image' ? (
              <img
                src={media[lightboxIndex].url}
                alt={media[lightboxIndex].name}
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            ) : (
              <video
                src={media[lightboxIndex].url}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
              />
            )}
          </div>

          {/* Next */}
          {media.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronRight size={26} />
            </button>
          )}

          {/* Counter + filename */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <p className="text-white/70 text-sm">{media[lightboxIndex].name}</p>
            {media.length > 1 && (
              <div className="flex gap-1.5 mt-1">
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === lightboxIndex ? 'bg-white scale-125' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default MediaGallery
