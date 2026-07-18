import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../lib/auth'
import { formatDate } from '../lib/utils'
import ResponsiveNav from '../components/ResponsiveNav'
import { User, LogOut, Edit2, Calendar, Mail } from 'lucide-react'

function Profile() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState({
    nickname: user?.nickname || '',
    birth_date: user?.birth_date || '',
  })

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  const handleSave = () => {
    if (user) {
      user.nickname = editedUser.nickname
      user.birth_date = editedUser.birth_date
      localStorage.setItem('currentUser', JSON.stringify(user))
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditedUser({
      nickname: user?.nickname || '',
      birth_date: user?.birth_date || '',
    })
    setIsEditing(false)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64">
      <ResponsiveNav />
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm pt-4">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nickname</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.nickname}
                      onChange={(e) => setEditedUser({ ...editedUser, nickname: e.target.value })}
                      className="font-medium text-gray-800 bg-white px-2 py-1 rounded border border-gray-300"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">{user.nickname}</p>
                  )}
                </div>
              </div>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-red-500">
                  <Edit2 size={18} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Birth Date</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedUser.birth_date}
                    onChange={(e) => setEditedUser({ ...editedUser, birth_date: e.target.value })}
                    className="font-medium text-gray-800 bg-white px-2 py-1 rounded border border-gray-300"
                  />
                ) : (
                  <p className="font-medium text-gray-800">{user.birth_date ? formatDate(user.birth_date) : 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{user.email}</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Your Score</h3>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl font-bold text-red-500">{user.score}</p>
              <p className="text-gray-500 mt-2">points</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-red-500 text-red-500 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile
