import { useState, useEffect } from 'react'
import { getMemories, setMemories, getRelationshipScore, setRelationshipScore } from '../lib/data'
import { getCurrentUser } from '../lib/auth'
import { formatDate } from '../lib/utils'
import ResponsiveNav from '../components/ResponsiveNav'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { FormInput, FormTextarea } from '../components/FormInput'
import MediaUpload from '../components/MediaUpload'
import MediaGallery from '../components/MediaGallery'
import { Heart, Plus, X, Star } from 'lucide-react'
import { Memory } from '../types'
import { MediaFile } from '../lib/storage'

function Memories() {
  const user = getCurrentUser()
  const [memories, setMemoriesState] = useState<Memory[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    memory_type: 'good' as 'good' | 'hard_moment',
    memory_date: '',
    mood: 'happy',
  })

  useEffect(() => {
    setMemoriesState(getMemories())
  }, [])

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsUploading(true)
    setUploadProgress(0)

    const memoryId = `mem-${Date.now()}`
    
    // Upload media files if any
    let uploadedMedia: any[] = []
    if (mediaFiles.length > 0) {
      try {
        const { uploadMultipleMediaFiles } = await import('../lib/storage')
        uploadedMedia = await uploadMultipleMediaFiles(
          mediaFiles.map(f => f.file),
          user?.id || '',
          memoryId,
          'memory',
          (progress) => setUploadProgress(progress)
        )
      } catch (error) {
        console.error('Failed to upload media:', error)
      }
    }

    const memory: Memory = {
      id: memoryId,
      title: newMemory.title,
      description: newMemory.description,
      memory_type: newMemory.memory_type,
      memory_date: newMemory.memory_date,
      mood: newMemory.mood,
      photo_url: null,
      created_by: user?.id || '',
      created_at: new Date().toISOString(),
      points: 10,
      media: uploadedMedia
    }

    const updatedMemories = [memory, ...memories]
    setMemories(updatedMemories)
    setMemoriesState(updatedMemories)
    
    // Update scores
    const currentScore = getRelationshipScore()
    setRelationshipScore(currentScore + 5)
    
    // Update user score
    if (user) {
      user.score += 10
      localStorage.setItem('currentUser', JSON.stringify(user))
    }

    setIsUploading(false)
    setShowAddForm(false)
    setMediaFiles([])
    setNewMemory({
      title: '',
      description: '',
      memory_type: 'good',
      memory_date: '',
      mood: 'happy',
    })
  }

  const reactions = [
    { type: 'love', emoji: '❤️' },
    { type: 'emotional', emoji: '🥹' },
    { type: 'funny', emoji: '😂' },
    { type: 'together', emoji: '🫂' },
    { type: 'special', emoji: '⭐' },
  ]

  const getMemoryTypeLabel = (type: string) => {
    return type === 'good' ? 'Good Memory' : 'Moment We Overcame'
  }

  return (
    <div className="min-h-screen bg-background-primary md:ml-64">
      <ResponsiveNav />
      
      <PageHeader 
        title="Memories" 
        action={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden md:inline">Add Memory</span>
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Add Memory Form */}
        {showAddForm && (
          <div className="card mb-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800 text-lg">Add New Memory</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-background-secondary rounded-xl transition-colors">
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddMemory} className="space-y-4">
              <FormInput
                label="Title"
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                placeholder="What's this memory about?"
                required
              />
              <FormTextarea
                label="Description"
                value={newMemory.description}
                onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                rows={3}
                placeholder="Tell the story..."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Memory Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewMemory({ ...newMemory, memory_type: 'good' })}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      newMemory.memory_type === 'good'
                        ? 'border-rose-400 bg-rose-50 text-rose-700'
                        : 'border-soft hover:border-rose-300'
                    }`}
                  >
                    <Heart size={24} className="mx-auto mb-2" />
                    <span className="font-medium">Good Memory</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMemory({ ...newMemory, memory_type: 'hard_moment' })}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      newMemory.memory_type === 'hard_moment'
                        ? 'border-purple-400 bg-purple-50 text-purple-700'
                        : 'border-soft hover:border-purple-300'
                    }`}
                  >
                    <Star size={24} className="mx-auto mb-2" />
                    <span className="font-medium">Moment We Overcame</span>
                  </button>
                </div>
              </div>
              <FormInput
                label="Date"
                type="date"
                value={newMemory.memory_date}
                onChange={(e) => setNewMemory({ ...newMemory, memory_date: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                <select
                  value={newMemory.mood}
                  onChange={(e) => setNewMemory({ ...newMemory, mood: e.target.value })}
                  className="input-field"
                >
                  <option value="happy">Happy</option>
                  <option value="excited">Excited</option>
                  <option value="emotional">Emotional</option>
                  <option value="nervous">Nervous</option>
                  <option value="grateful">Grateful</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Photos & Videos</label>
                <MediaUpload 
                  mediaFiles={mediaFiles}
                  onMediaChange={setMediaFiles}
                  maxFiles={10}
                />
              </div>

              {isUploading && (
                <div className="p-4 bg-rose-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-rose-700">Uploading media...</span>
                    <span className="text-sm text-rose-600">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-rose-200 rounded-full h-2">
                    <div 
                      className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary w-full" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Save Memory'}
              </button>
            </form>
          </div>
        )}

        {/* Memories List */}
        {memories.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No memories yet"
            description="Start creating beautiful memories together"
            action={{
              label: 'Add First Memory',
              onClick: () => setShowAddForm(true)
            }}
          />
        ) : (
          <div className="space-y-4">
            {memories.map((memory, index) => (
              <div 
                key={memory.id} 
                className={`card animate-slide-up ${
                  memory.memory_type === 'hard_moment' 
                    ? 'border-l-4 border-l-purple-400' 
                    : 'border-l-4 border-l-rose-400'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`text-xs font-semibold uppercase tracking-wide ${
                      memory.memory_type === 'hard_moment' ? 'text-purple-600' : 'text-rose-600'
                    }`}>
                      {getMemoryTypeLabel(memory.memory_type)}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800 mt-1">{memory.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500 bg-background-secondary px-3 py-1 rounded-full">
                    {formatDate(memory.memory_date)}
                  </span>
                </div>
                
                {memory.description && (
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{memory.description}</p>
                )}

                {memory.media && memory.media.length > 0 && (
                  <div className="mb-4">
                    <MediaGallery media={memory.media} />
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {reactions.map((reaction) => (
                      <button
                        key={reaction.type}
                        className="text-2xl hover:scale-110 transition-transform p-1"
                        title={reaction.type}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-rose-500" />
                    <span className="text-sm font-medium text-rose-600">+{memory.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Memories
