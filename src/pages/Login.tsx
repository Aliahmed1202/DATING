import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/auth'
import { Heart, Eye, EyeOff } from 'lucide-react'

type Step = 'pick' | 'password'

const ACCOUNTS = [
  { email: 'aliahmesbiso@gmail.com', name: 'Ali', initial: 'A', color: 'from-peach-400 to-coral-400' },
  { email: 'romysaa.samir@icloud.com', name: 'Roma', initial: 'R', color: 'from-coral-400 to-rose-400' },
]

function Login() {
  const [step, setStep] = useState<Step>('pick')
  const [selected, setSelected] = useState<typeof ACCOUNTS[0] | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handlePick = (account: typeof ACCOUNTS[0]) => {
    setSelected(account)
    setPassword('')
    setError('')
    setStep('password')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setError('')
    setLoading(true)

    try {
      await login(selected.email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Wrong password. Try again.')
    } finally {
      setLoading(false)
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
          <p className="text-gray-500 mt-2">
            {step === 'pick' ? 'Who are you?' : `Welcome, ${selected?.name}`}
          </p>
        </div>

        {step === 'pick' ? (
          /* ── Account picker ── */
          <div className="space-y-4">
            {ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handlePick(account)}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-red-300 hover:bg-red-50 transition-all duration-200 active:scale-95"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${account.color} flex items-center justify-center text-white text-2xl font-bold shadow-sm flex-shrink-0`}>
                  {account.initial}
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold text-gray-800">{account.name}</p>
                  <p className="text-sm text-gray-400">{account.email}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* ── Password entry ── */
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Selected user chip */}
            {selected && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selected.color} flex items-center justify-center text-white font-bold`}>
                  {selected.initial}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{selected.name}</p>
                  <p className="text-xs text-gray-400">{selected.email}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                  required
                  autoFocus
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('pick'); setError('') }}
              className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              ← Back
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Private space for Ali & Roma
        </div>
      </div>
    </div>
  )
}

export default Login
