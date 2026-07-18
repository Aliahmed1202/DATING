import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../lib/auth'
import { getRelationshipScore, getMemories } from '../lib/data'
import { relationship, levels } from '../lib/data'
import { getDaysTogether, getCurrentLevel, getProgressToNextLevel, formatDate } from '../lib/utils'
import BottomNav from '../components/BottomNav'
import { Heart, Calendar, MessageSquare, LogOut, Bell } from 'lucide-react'

function Dashboard() {
  const navigate = useNavigate()
  const [score, setScore] = useState(0)
  const [memories, setMemories] = useState<any[]>([])

  useEffect(() => {
    setScore(getRelationshipScore())
    setMemories(getMemories())
  }, [])

  const daysTogether = getDaysTogether(relationship.start_date)
  const currentLevel = getCurrentLevel(score, levels)
  const { progress, pointsToNext } = getProgressToNextLevel(score, levels)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const quickActions = [
    { icon: Heart, label: 'Add Memory', path: '/memories', color: 'text-red-500' },
    { icon: Calendar, label: 'Add Event', path: '/events', color: 'text-blue-500' },
    { icon: MessageSquare, label: 'Send Note', path: '/notes', color: 'text-green-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell size={24} className="text-gray-600" />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full">
              <LogOut size={24} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Main Couple Card */}
        <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Heart size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{relationship.name}</h2>
              <p className="text-white/80">{relationship.type}</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <p className="text-sm text-white/80">Together since {formatDate(relationship.start_date)}</p>
            <p className="text-3xl font-bold mt-1">{daysTogether} days</p>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Relationship Score</h3>
            <span className="text-sm text-gray-500">Level {levels.indexOf(currentLevel) + 1}</span>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">{currentLevel.name}</span>
              <span className="font-semibold text-gray-800">{score} / {currentLevel.max_points} points</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">{pointsToNext} points until next level</p>
        </div>

        {/* Individual Scores */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Individual Scores</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Ali</span>
              <span className="font-bold text-red-500">55 points</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Roma</span>
              <span className="font-bold text-pink-500">41 points</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Icon size={24} className={action.color} />
                  <span className="text-xs text-gray-600">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {memories.slice(0, 2).map((memory) => (
              <div key={memory.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Heart size={20} className="text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{memory.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(memory.memory_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default Dashboard
