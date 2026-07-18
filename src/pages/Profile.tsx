import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../lib/auth'
import { formatDate } from '../lib/utils'
import ResponsiveNav from '../components/ResponsiveNav'
import PageHeader from '../components/PageHeader'
import { FormInput } from '../components/FormInput'
import { User, LogOut, Edit2, Calendar, Mail, Heart } from 'lucide-react'

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


  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background-primary md:ml-64">
      <ResponsiveNav />
      
      <PageHeader title="Profile" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="card mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-peach-400 to-coral-400 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-soft">
              {user.name.charAt(0)}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h2>
              <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} />
                {user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-6 bg-background-secondary rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <User size={20} className="text-rose-500" />
                <p className="text-sm text-gray-500">Nickname</p>
              </div>
              <p className="text-xl font-semibold text-gray-800">{user.nickname}</p>
            </div>
            <div className="p-6 bg-background-secondary rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={20} className="text-rose-500" />
                <p className="text-sm text-gray-500">Birthday</p>
              </div>
              <p className="text-xl font-semibold text-gray-800">{user.birth_date ? formatDate(user.birth_date) : 'Not set'}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Edit2 size={20} />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="card mb-6 animate-scale-in">
            <h3 className="font-semibold text-gray-800 text-lg mb-6">Edit Profile</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <FormInput
                label="Nickname"
                value={editedUser.nickname}
                onChange={(e) => setEditedUser({ ...editedUser, nickname: e.target.value })}
                placeholder="What should we call you?"
              />
              <FormInput
                label="Birth Date"
                type="date"
                value={editedUser.birth_date}
                onChange={(e) => setEditedUser({ ...editedUser, birth_date: e.target.value })}
              />
              <button type="submit" className="btn-primary w-full">
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Stats Card */}
        <div className="card mb-6 animate-slide-up">
          <h3 className="font-semibold text-gray-800 text-lg mb-4">Your Stats</h3>
          <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-peach-50 to-coral-50 rounded-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-peach-400 to-coral-400 rounded-2xl flex items-center justify-center shadow-soft">
              <Heart size={32} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Member Score</p>
              <p className="text-3xl font-bold text-gray-800">{user.score}</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full btn-secondary flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile
