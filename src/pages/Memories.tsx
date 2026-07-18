import { useState, useEffect } from 'react'
import { getMemories, setMemories, getRelationshipScore, setRelationshipScore } from '../lib/data'
import { getCurrentUser } from '../lib/auth'
import { formatDate } from '../lib/utils'
import BottomNav from '../components/BottomNav'
import { Heart, Plus, X } from 'lucide-react'
import { Memory } from '../types'

function Memories() {
  const user = getCurrentUser()
  const [memories, setMemoriesState] = useState<Memory[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
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

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault()
    
    const memory: Memory = {
      id: `mem-${Date.now()}`,
      title: newMemory.title,
      description: newMemory.description,
      memory_type: newMemory.memory_type,
      memory_date: newMemory.memory_date,
      mood: newMemory.mood,
      photo_url: null,
      created_by: user?.id || '',
      created_at: new Date().toISOString(),
      points: 10,
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

    setShowAddForm(false)
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Memories</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Add Memory Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Add New Memory</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newMemory.description}
                  onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Memory Type</label>
                <select
                  value={newMemory.memory_type}
                  onChange={(e) => setNewMemory({ ...newMemory, memory_type: e.target.value as 'good' | 'hard_moment' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="good">Good Memory</option>
                  <option value="hard_moment">Moment We Overcame</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newMemory.memory_date}
                  onChange={(e) => setNewMemory({ ...newMemory, memory_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                <select
                  value={newMemory.mood}
                  onChange={(e) => setNewMemory({ ...newMemory, mood: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="happy">Happy</option>
                  <option value="excited">Excited</option>
                  <option value="emotional">Emotional</option>
                  <option value="nervous">Nervous</option>
                  <option value="grateful">Grateful</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Save Memory
              </button>
            </form>
          </div>
        )}

        {/* Memories List */}
        <div className="space-y-4">
          {memories.map((memory) => (
            <div key={memory.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-medium text-red-500 uppercase">
                    {getMemoryTypeLabel(memory.memory_type)}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800 mt-1">{memory.title}</h3>
                </div>
                <span className="text-xs text-gray-500">{formatDate(memory.memory_date)}</span>
              </div>
              
              {memory.description && (
                <p className="text-gray-600 text-sm mb-4">{memory.description}</p>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {reactions.map((reaction) => (
                    <button
                      key={reaction.type}
                      className="text-2xl hover:scale-110 transition-transform"
                      title={reaction.type}
                    >
                      {reaction.emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-red-500" />
                  <span className="text-sm text-gray-500">+{memory.points} pts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default Memories
