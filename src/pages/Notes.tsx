import { useState, useEffect } from 'react'
import { getNotes, setNotes } from '../lib/data'
import { getCurrentUser } from '../lib/auth'
import { formatDate } from '../lib/utils'
import ResponsiveNav from '../components/ResponsiveNav'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { FormTextarea } from '../components/FormInput'
import { Plus, X, MessageSquare, Sparkles } from 'lucide-react'
import { Note } from '../types'

function Notes() {
  const user = getCurrentUser()
  const [notes, setNotesState] = useState<Note[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNote, setNewNote] = useState({
    type: 'love' as Note['type'],
    message: '',
  })

  useEffect(() => {
    setNotesState(getNotes())
  }, [])

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    const note: Note = {
      id: `note-${Date.now()}`,
      sender_id: user.id,
      receiver_id: user.id === 'ali-user-id' ? 'roma-user-id' : 'ali-user-id',
      type: newNote.type,
      message: newNote.message,
      read: false,
      created_at: new Date().toISOString(),
    }

    const updatedNotes = [note, ...notes]
    setNotes(updatedNotes)
    setNotesState(updatedNotes)

    setShowAddForm(false)
    setNewNote({
      type: 'love',
      message: '',
    })
  }

  const noteTypes = [
    { type: 'love', label: 'Love', emoji: '❤️' },
    { type: 'thank_you', label: 'Thank You', emoji: '🙏' },
    { type: 'appreciation', label: 'Appreciation', emoji: '💝' },
    { type: 'sorry', label: 'Sorry', emoji: '😔' },
    { type: 'miss_you', label: 'Miss You', emoji: '🥺' },
    { type: 'random', label: 'Random', emoji: '✨' },
  ]

  const getNoteTypeLabel = (type: string) => {
    const found = noteTypes.find(t => t.type === type)
    return found ? found.label : type
  }

  const getNoteTypeEmoji = (type: string) => {
    const found = noteTypes.find(t => t.type === type)
    return found ? found.emoji : '💬'
  }

  const isMyNote = (note: Note) => {
    return note.sender_id === user?.id
  }

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
        {/* Add Note Form */}
        {showAddForm && (
          <div className="card mb-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800 text-lg">Send a Note</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-background-secondary rounded-xl transition-colors">
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
              <button type="submit" className="btn-primary w-full">
                Send Note
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
            action={{
              label: 'Send First Note',
              onClick: () => setShowAddForm(true)
            }}
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
                          {isMyNote(note) ? 'From you' : 'To you'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(note.created_at)}</span>
                    </div>

                    <p className="text-gray-800 leading-relaxed">{note.message}</p>

                    {!note.read && !isMyNote(note) && (
                      <div className="mt-3 flex items-center gap-2">
                        <Sparkles size={14} className="text-rose-500" />
                        <span className="text-xs font-medium text-rose-600">New</span>
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
