import { useState, useEffect } from 'react'
import { getNotes, insertNote, updateNote, deleteNote, getPartnerProfiles, syncUserScore } from '../lib/data'
import { getCurrentUser } from '../lib/auth'
import { formatDate } from '../lib/utils'
import ResponsiveNav from '../components/ResponsiveNav'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { FormTextarea } from '../components/FormInput'
import { Plus, X, MessageSquare, Sparkles, Edit2, Trash2 } from 'lucide-react'
import { Note } from '../types'
import { MediaFile, uploadMultipleMediaFiles } from '../lib/storage'
import MediaUpload from '../components/MediaUpload'
import MediaGallery from '../components/MediaGallery'

function Notes() {
  const [user, setUser] = useState<any>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [notes, setNotesState] = useState<Note[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({
    type: 'love' as Note['type'],
    message: '',
  })

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u)
      if (u) {
        const partners = await getPartnerProfiles(u.id)
        if (partners.length > 0) setPartnerId(partners[0].id)
      }
    })
    loadNotes()
  }, [])

  async function loadNotes() {
    try {
      const data = await getNotes()
      setNotesState(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingNoteId(null)
    setMediaFiles([])
    setNewNote({ type: 'love', message: '' })
  }

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !partnerId) return
    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      if (editingNoteId) {
        await updateNote(editingNoteId, {
          type: newNote.type,
          message: newNote.message,
        })

        if (mediaFiles.length > 0) {
          await uploadMultipleMediaFiles(
            mediaFiles.map(f => f.file),
            user.id,
            editingNoteId,
            'note',
            (progress) => setUploadProgress(progress)
          )
        }
      } else {
        const created = await insertNote({
          sender_id: user.id,
          receiver_id: partnerId,
          type: newNote.type,
          message: newNote.message,
          read: false,
        })

        if (mediaFiles.length > 0) {
          await uploadMultipleMediaFiles(
            mediaFiles.map(f => f.file),
            user.id,
            created.id,
            'note',
            (progress) => setUploadProgress(progress)
          )
        }
      }

      await loadNotes()
      await syncUserScore(user.id)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
      resetForm()
    }
  }

  const handleEditNote = (note: Note) => {
    setNewNote({ type: note.type, message: note.message })
    setEditingNoteId(note.id)
    setShowAddForm(true)
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    try {
      await deleteNote(noteId)
      setNotesState(prev => prev.filter(n => n.id !== noteId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const noteTypes = [
    { type: 'love', label: 'Love', emoji: '❤️' },
    { type: 'thank_you', label: 'Thank You', emoji: '🙏' },
    { type: 'appreciation', label: 'Appreciation', emoji: '💝' },
    { type: 'sorry', label: 'Sorry', emoji: '😔' },
    { type: 'miss_you', label: 'Miss You', emoji: '🥺' },
    { type: 'random', label: 'Random', emoji: '✨' },
  ]

  const getNoteTypeLabel = (type: string) =>
    noteTypes.find(t => t.type === type)?.label ?? type

  const getNoteTypeEmoji = (type: string) =>
    noteTypes.find(t => t.type === type)?.emoji ?? '💬'

  const isMyNote = (note: Note) => note.sender_id === user?.id

  return (
    <div className="min-h-screen bg-background-primary md:ml-64">
      <ResponsiveNav />

      <PageHeader
        title="Notes"
        action={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden md:inline">Send Note</span>
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl text-sm">{error}</div>
        )}

        {/* Add / Edit Form */}
        {showAddForm && (
          <div className="card mb-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800 text-lg">
                {editingNoteId ? 'Edit Note' : 'Send a Note'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-background-secondary rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSendNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose the vibe</label>
                <div className="grid grid-cols-3 gap-3">
                  {noteTypes.map((type) => (
                    <button
                      key={type.type}
                      type="button"
                      onClick={() => setNewNote({ ...newNote, type: type.type as Note['type'] })}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        newNote.type === type.type
                          ? 'border-rose-400 bg-rose-50 text-rose-700'
                          : 'border-soft hover:border-rose-300'
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <span className="text-3xl">{type.emoji}</span>
                      </div>
                      <p className="text-sm font-medium">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <FormTextarea
                label="Your message"
                value={newNote.message}
                onChange={(e) => setNewNote({ ...newNote, message: e.target.value })}
                rows={4}
                placeholder="Write something sweet..."
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Photo</label>
                <MediaUpload
                  mediaFiles={mediaFiles}
                  onMediaChange={setMediaFiles}
                  maxFiles={1}
                  accept="image/*"
                />
              </div>

              {isUploading && (
                <div className="p-4 bg-rose-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-rose-700">Uploading photo...</span>
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
                {isUploading ? 'Uploading...' : (editingNoteId ? 'Update Note' : 'Send Note')}
              </button>
            </form>
          </div>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No notes yet"
            description="Share your thoughts and feelings"
            action={{ label: 'Send First Note', onClick: () => setShowAddForm(true) }}
          />
        ) : (
          <div className="space-y-4">
            {notes.map((note, index) => (
              <div
                key={note.id}
                className={`card animate-slide-up ${
                  isMyNote(note)
                    ? 'ml-0 md:ml-8 border-l-4 border-l-rose-400'
                    : 'mr-0 md:mr-8 border-l-4 border-l-purple-400'
                } ${!note.read && !isMyNote(note) ? 'bg-gradient-to-r from-rose-50 to-peach-50' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isMyNote(note)
                      ? 'bg-gradient-to-br from-peach-200 to-coral-200'
                      : 'bg-gradient-to-br from-rose-200 to-purple-200'
                  }`}>
                    <span className="text-2xl">{getNoteTypeEmoji(note.type)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                          isMyNote(note) ? 'text-rose-600' : 'text-purple-600'
                        }`}>
                          {getNoteTypeLabel(note.type)}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {isMyNote(note) ? 'From you' : 'From your partner'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(note.created_at)}</span>
                    </div>

                    <p className="text-gray-800 leading-relaxed">{note.message}</p>

                    {note.media && note.media.length > 0 && (
                      <div className="mt-3">
                        <MediaGallery media={note.media} />
                      </div>
                    )}

                    {!note.read && !isMyNote(note) && (
                      <div className="mt-3 flex items-center gap-2">
                        <Sparkles size={14} className="text-rose-500" />
                        <span className="text-xs font-medium text-rose-600">New</span>
                      </div>
                    )}

                    {isMyNote(note) && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-2 hover:bg-background-secondary rounded-xl transition-colors"
                          title="Edit note"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete note"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    )}
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

export default Notes
