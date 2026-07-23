import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRelationshipScore, getMemories, calculateUserScore } from '../lib/data'
import { formatDate } from '../lib/utils'
import ResponsiveNav from '../components/ResponsiveNav'
import CoupleHeaderCard from '../components/CoupleHeaderCard'
import ScoreCard from '../components/ScoreCard'
import { Heart, Calendar, MessageSquare } from 'lucide-react'

function Dashboard() {
  const navigate = useNavigate()
  const [score, setScore] = useState(0)
  const [memories, setMemories] = useState<any[]>([])
  const [aliScore, setAliScore] = useState(0)
  const [romaScore, setRomaScore] = useState(0)

  useEffect(() => {
    setScore(getRelationshipScore())
    setMemories(getMemories())
    setAliScore(calculateUserScore('ali-user-id'))
    setRomaScore(calculateUserScore('roma-user-id'))
  }, [])

  const quickActions = [
    { icon: Heart, label: 'Add Memory', path: '/memories', color: 'text-red-500' },
    { icon: Calendar, label: 'Add Event', path: '/events', color: 'text-blue-500' },
    { icon: MessageSquare, label: 'Send Note', path: '/notes', color: 'text-green-500' },
  ]

  return (
    <div className="min-h-screen bg-background-primary md:ml-64">
      <ResponsiveNav />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Main Couple Card */}
        <CoupleHeaderCard />

        {/* Score Card */}
        <ScoreCard score={score} showIndividual={true} aliScore={aliScore} romaScore={romaScore} />

        {/* Quick Actions */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold text-gray-800 text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-3 p-4 bg-background-secondary rounded-2xl hover:bg-rose-50 transition-all duration-200 active:scale-95"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color.replace('text-', 'bg-').replace('-500', '-100')} ${action.color}`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent Memories */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 text-lg">Latest Memories</h3>
            <button onClick={() => navigate('/memories')} className="text-rose-600 text-sm font-medium hover:text-rose-700">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {memories.slice(0, 3).map((memory) => (
              <div key={memory.id} className="flex items-center gap-4 p-4 bg-background-secondary rounded-2xl hover:bg-rose-50 transition-all duration-200 cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-peach-200 to-coral-200 rounded-xl flex items-center justify-center">
                  <Heart size={20} className="text-rose-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{memory.title}</p>
                  <p className="text-sm text-gray-500">{formatDate(memory.memory_date)}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">+{memory.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
