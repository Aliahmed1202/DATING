import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, verifyOtp } from '../lib/auth'
import { Heart } from 'lucide-react'

type Step = 'email' | 'otp'

const ACCOUNTS = [
  { email: 'aliahmesbiso@gmail.com', name: 'Ali', initial: 'A', color: 'from-peach-400 to-coral-400' },
  { email: 'romysaa.samir@icloud.com', name: 'Roma', initial: 'R', color: 'from-coral-400 to-rose-400' },
]

function Login() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSelect = async (selectedEmail: string) => {
    setEmail(selectedEmail)
    setError('')
    setLoading(true)
    try {
      await login(selectedEmail)
      setStep('otp')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp(email, otp)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const selectedAccount = ACCOUNTS.find(a => a.email === email)

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
            {step === 'email' ? 'Who are you?' : 'Check your email'}
          </p>
        </div>

        {step === 'email' ? (
          <div className="space-y-4">
            {ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleSelect(account.email)}
                disabled={loading}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-red-300 hover:bg-red-50 transition-all duration-200 active:scale-95 disabled:opacity-60"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${account.color} flex items-center justify-center text-white text-2xl font-bold shadow-sm flex-shrink-0`}>
                  {account.initial}
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold text-gray-800">{account.name}</p>
                  <p className="text-sm text-gray-400">{account.email}</p>
                </div>
                {loading && email === account.email && (
                  <div className="ml-auto w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                )}
              </button>
            ))}

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
          </div>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            {/* Show who is signing in */}
            {selectedAccount && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedAccount.color} flex items-center justify-center text-white font-bold`}>
                  {selectedAccount.initial}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedAccount.name}</p>
                  <p className="text-xs text-gray-400">{selectedAccount.email}</p>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 text-center">
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
            </p>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                required
                maxLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(''); setError('') }}
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
