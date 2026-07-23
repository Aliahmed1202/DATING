import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/auth'
import { Heart } from 'lucide-react'

const ACCOUNTS = [
  { email: 'aliahmesbiso@gmail.com', name: 'Ali', initial: 'A', color: 'from-peach-400 to-coral-400' },
  { email: 'romysaa.samir@icloud.com', name: 'Roma', initial: 'R', color: 'from-coral-400 to-rose-400' },
]

function Login() {
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSelect = async (email: string) => {
    setError('')
    setLoadingEmail(email)
    try {
      await login(email)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoadingEmail(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <Heart className="text-red-500" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Our Space</h1>
          <p className="text-gray-500 mt-2">Who are you?</p>
        </div>

        {/* Account buttons */}
        <div className="space-y-4">
          {ACCOUNTS.map((account) => {
            const isLoading = loadingEmail === account.email
            return (
              <button
                key={account.email}
                onClick={() => handleSelect(account.email)}
                disabled={loadingEmail !== null}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-red-300 hover:bg-red-50 transition-all duration-200 active:scale-95 disabled:opacity-60"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${account.color} flex items-center justify-center text-white text-2xl font-bold shadow-sm flex-shrink-0`}>
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    account.initial
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xl font-semibold text-gray-800">{account.name}</p>
                  <p className="text-sm text-gray-400">{account.email}</p>
                </div>
              </button>
            )
          })}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">
          Private space for Ali & Roma
        </div>
      </div>
    </div>
  )
}

export default Login
