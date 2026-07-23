import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout, updateProfile } from '../lib/auth'
import { formatDate } from '../lib/utils'
import { calculateAge } from '../lib/data'
import ResponsiveNav from '../components/ResponsiveNav'
import PageHeader from '../components/PageHeader'
import { FormInput } from '../components/FormInput'
import MediaUpload from '../components/MediaUpload'
import { User, LogOut, Edit2, Calendar, Mail, Heart, Camera } from 'lucide-react'
import { MediaFile, uploadMultipleMediaFiles } from '../lib/storage'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFiles, setAvatarFiles] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [editedUser, setEditedUser] = useState({ nickname: '', birth_date: '' })

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) {
        setUser(u)
        setEditedUser({ nickname: u.nickname || '', birth_date: u.birth_date || '' })
      }
    })
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      let avatarUrl = user.avatar

      // Upload avatar to bucket if a new file was selected
      if (avatarFiles.length > 0) {
        const uploaded = await uploadMultipleMediaFiles(
          avatarFiles.map(f => f.file),
          user.id,
          'avatar',
          'avatar',
          (progress) => setUploadProgress(progress)
        )
        if (uploaded.length > 0) {
          avatarUrl = uploaded[0].url
        }
      }

      // Persist all changes to the profiles table
      const updated = await updateProfile(user.id, {
        nickname: editedUser.nickname,
        birth_date: editedUser.birth_date || null,
        avatar: avatarUrl,
      })

      setUser(updated)
      setIsEditing(false)
      setAvatarFiles([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background-primary md:ml-64">
      <ResponsiveNav />

      <PageHeader title="Profile" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl text-sm">{error}</div>
        )}

        {/* Profile Card */}
        <div className="card mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="relative group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-3xl object-cover shadow-soft"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-peach-400 to-coral-400 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-soft">
                  {user.name.charAt(0)}
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={24} className="text-white" />
                </div>
              )}
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
              <p className="text-xl font-semibold text-gray-800">
                {user.birth_date ? `${calculateAge(user.birth_date)} years old` : 'Not set'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {user.birth_date ? formatDate(user.birth_date) : ''}
              </p>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                <MediaUpload
                  mediaFiles={avatarFiles}
                  onMediaChange={setAvatarFiles}
                  maxFiles={1}
                  accept="image/*"
                />
              </div>
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
              {isUploading && (
                <div className="p-4 bg-rose-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-rose-700">Uploading...</span>
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
                {isUploading ? 'Saving...' : 'Save Changes'}
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

        {/* Logout */}
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
