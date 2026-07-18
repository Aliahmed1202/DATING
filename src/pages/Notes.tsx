import { useState, useEffect } from 'react'
import { getNotes, setNotes } from '../lib/data'
import { getCurrentUser } from '../lib/auth'
import { formatDate } from '../lib/utils'
import ResponsiveNav from '../components/ResponsiveNav'
import { Plus, X, MessageSquare } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50 md:ml-64">
      <ResponsiveNav />
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm pt-4">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Notes</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Send Note
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Add Note Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Send a Note</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSendNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {noteTypes.map((type) => (
                    <button
                      key={type.type}
                      type="button"
                      onClick={() => setNewNote({ ...newNote, type: type.type as Note['type'] })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        newNote.type === type.type
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{type.emoji}</span>
                      <p className="text-xs mt-1">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={newNote.message}
                  onChange={(e) => setNewNote({ ...newNote, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  rows={4}
                  placeholder="Write your message..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Send Note
              </button>
            </form>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`bg-white rounded-2xl p-6 shadow-sm ${
                isMyNote(note) ? 'ml-4 border-l-4 border-red-500' : 'mr-4 border-l-4 border-pink-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getNoteTypeEmoji(note.type)}</span>
                  <div>
                    <span className="text-xs font-medium text-red-500 uppercase">
                      {getNoteTypeLabel(note.type)}
                    </span>
                    <p className="text-sm text-gray-500">
                      {isMyNote(note) ? 'From you' : 'To you'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{formatDate(note.created_at)}</span>
              </div>

              <p className="text-gray-800">{note.message}</p>

              {!note.read && !isMyNote(note) && (
                <div className="mt-3">
                  <span className="text-xs text-red-500 font-medium">New</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notes yet</p>
            <p className="text-gray-400 text-sm">Send your first note!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notes
